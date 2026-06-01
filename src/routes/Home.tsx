import {
  Box,
  Button,
  Divider,
  Heading,
  List,
  ListItem,
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  ModalBody,
  Text,
  VStack,
  Card,
  CardBody,
  HStack,
  Tooltip,
  IconButton,
} from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InstrumentCard } from 'components/instrumentCard'
import { SessionRow } from 'components/sessionRow'
import {
  createSilence,
  deleteSilence,
  getLongestSilence,
  Silence,
} from 'loaders/alertManager'
import { getInstrumentConnectionStatus } from 'loaders/general'
import { sessionTokenCheck } from 'loaders/jwt'
import { finaliseSession } from 'loaders/rsyncers'
import { getAllSessionsData } from 'loaders/sessionClients'
import { checkMultigridControllerStatus } from 'loaders/sessionSetup'
import React, { useCallback, useEffect, useState } from 'react'
import { FaCalendar } from 'react-icons/fa'
import { useNavigate, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import {
  convertUKNaiveToUTC,
  convertUTCToUKNaive,
  formatUTCISOToUKLocal,
} from 'utils/generic'

type Session = components['schemas']['Session']
type SessionsResponse = {
  current: Session[]
} | null
type SessionStatus = {
  isActive: boolean | undefined
  isFinalising: boolean | undefined
}

export const Home = () => {
  const instrumentName = sessionStorage.getItem('instrumentName')
  const queryKey = ['homepageSessions', instrumentName]
  const queryFn = () => getAllSessionsData(instrumentName ? instrumentName : '')

  // Set up a queryClient object
  const queryClient = useQueryClient()

  // Load and set current data
  const preloadedData = useLoaderData() as SessionsResponse
  const { data, isLoading, isError } = useQuery<SessionsResponse>({
    queryKey,
    queryFn,
    initialData: preloadedData,
    enabled: !!instrumentName,
    staleTime: 0, // Always refetch on mount unless preloaded
  })

  const navigate = useNavigate()

  // Listen to the instrument server connection query done by the navbar
  const [instrumentServerConnected, setInstrumentServerConnected] =
    React.useState(false)
  const { data: instrumentServerConnectionResponse } = useQuery<boolean>({
    queryKey: ['instrumentServerConnection', instrumentName],
    queryFn: () => getInstrumentConnectionStatus(),
    enabled: false, // Listen for this query, but don't actively fetch
    initialData: instrumentServerConnected,
  })
  useEffect(() => {
    setInstrumentServerConnected(!!instrumentServerConnectionResponse)
  }, [instrumentServerConnectionResponse])

  // Sort the loaded sessions and set React state
  const [sessionsData, setSessionsData] = useState<Session[]>([])
  useEffect(() => {
    // Early return if session information not loaded
    if (!data) return

    // Sort by session ID in descending order
    const sortedSessions = [...data.current].sort((a, b) => b.id - a.id)
    setSessionsData(sortedSessions)
  }, [data])

  // Query and session statuses and set React state
  const [sessionStatuses, setSessionStatuses] = useState<
    Record<number, SessionStatus>
  >({})
  useEffect(() => {
    const getSessionStatus = async () => {
      // Check every session's status
      const sessionStatuses = await Promise.all(
        sessionsData.map(async (session) => {
          const isActive = await sessionTokenCheck(session.id)
          const isFinalising = await checkMultigridControllerStatus(
            session.id.toString()
          ).then((status) => {
            return status.finalising
          })
          return [
            session.id,
            {
              isActive,
              isFinalising,
            },
          ] as const
        })
      )
      setSessionStatuses(Object.fromEntries(sessionStatuses))
    }
    getSessionStatus()
  }, [sessionsData, instrumentServerConnected])

  // Check if all the statuses have been loaded
  const allStatusesLoaded = sessionsData.every(
    (session) => sessionStatuses[session.id]?.isActive !== undefined
  )

  // Look for stale running sessions
  const [staleRunningSessions, setStaleRunningSessions] = React.useState<
    Session[] | null
  >(null)
  useEffect(() => {
    // Skip effect if sessions haven't loaded yet
    if (!sessionsData) return

    // Get current timestamp
    const currentTimestamp = new Date()

    setStaleRunningSessions(
      sessionsData.filter((session) => {
        if (!session.visit_end_time) return false
        if (!sessionStatuses[session.id]?.isActive) return false
        const sessionEndTimeUTC = new Date(
          convertUKNaiveToUTC(session.visit_end_time)
        )
        return sessionEndTimeUTC < currentTimestamp
      })
    )
  }, [sessionsData, sessionStatuses])

  // Handle logic for when clicking on "New Session" button
  const {
    isOpen: isOpenVisitCleanupPrompt,
    onOpen: onOpenVisitCleanupPrompt,
    onClose: onCloseVisitCleanupPrompt,
  } = useDisclosure()

  const handleNewSession = () => {
    // Check for stale, still running sessions
    if (!staleRunningSessions || staleRunningSessions.length === 0) {
      // If there aren't any, proceed to create new session unimpeded
      navigate(`../instruments/${instrumentName}/new_session`)
    } else {
      // If they are present, trigger the visit cleanup prompt
      onOpenVisitCleanupPrompt()
    }
  }
  const handleVisitCleanupPrompt = () => {
    // Guard against null/undefined
    if (!staleRunningSessions) return

    // Iterate through stale sessions and trigger cleanup on them
    for (const session of staleRunningSessions) {
      finaliseSession(session.id)
      console.log(`Session ${session.id} marked for cleanup`)
    }

    // Mark all sessions as finalising
    setSessionStatuses((prev) => {
      const updatedStatuses = { ...prev }
      for (const session of staleRunningSessions) {
        updatedStatuses[session.id] = {
          ...updatedStatuses[session.id],
          isFinalising: true,
        }
      }
      return updatedStatuses
    })

    // Refetch session information
    queryClient.refetchQueries({
      queryKey: queryKey,
    })

    // Close the window, and move to next page
    onCloseVisitCleanupPrompt()
    navigate(`../instruments/${instrumentName}/new_session`)
  }

  // Turn alerts on/off - values and logic

  //calendar selection popup intialisation
  const {
    isOpen: isOpenCalendar,
    onOpen: onOpenCalendar,
    onClose: onCloseCalendar,
  } = useDisclosure()

  const [existingEndTime, setExistingEndTime] = React.useState<Date | null>(
    null
  ) //longest silence endtime
  const [endTime, setEndTime] = React.useState<Date | null>(null) //new silence endtime
  const [proposedEndTime, setProposedEndTime] = React.useState<Date | null>(
    null
  ) //whilst date being chosen

  //find longest existing silence and set existing end time
  const checkExistingEndTime = useCallback(async () => {
    const silence: Silence | null = await getLongestSilence(
      instrumentName ? instrumentName : ''
    )
    if (silence == null) {
      setExistingEndTime(null)
    } else {
      const existingEndsAt = new Date(silence.endsAt)
      setExistingEndTime(existingEndsAt)
    }
  }, [instrumentName])

  //on load, find and set longest active silence end time
  useEffect(() => {
    checkExistingEndTime()
  }, [checkExistingEndTime])

  // Upon initialisation, zero out seconds field for calendar date/time picker
  const defaultSilenceEndTime = (() => {
    let now = new Date()
    let timestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0, // Set seconds to 0
      0 // Set milliseconds to 0
    ).toISOString()
    return timestamp
  })()

  const handleCreateSilence = async (
    microscope: string | null,
    proposedEndTime: Date | null
  ) => {
    if (!microscope || !proposedEndTime) return null
    await createSilence(microscope, proposedEndTime)
    checkExistingEndTime() //find which is now the longest silence
    setEndTime(null)
  }
  const handleDeleteSilence = async (microscope: string | null) => {
    if (microscope == null) return null
    await deleteSilence(microscope)
    checkExistingEndTime() //reset active silences to null
    setEndTime(null)
  }

  // Page rendering logic below here
  if (isLoading) return <p>Loading sessions...</p>
  if (isError || !data) return <p>Failed to load sessions.</p>

  return (
    <div className="rootContainer">
      <title>Murfey</title>
      {/* Parent container for page contents */}
      <Box
        className="homeRoot"
        overflow="auto"
        display="flex"
        flexDirection="column"
        flex="1"
      >
        {/* Logic for pop-up components */}
        {/* Visit cleanup prompt */}
        <Modal
          isOpen={isOpenVisitCleanupPrompt}
          onClose={onCloseVisitCleanupPrompt}
        >
          <ModalOverlay />
          <ModalContent>
            {/* Header line */}
            <ModalHeader>Running Visits</ModalHeader>
            <ModalCloseButton />
            {/* Main body */}
            <ModalBody gap={2}>
              <Text>
                The following expired visits are still running and should be
                cleaned up:
              </Text>
              <List>
                {staleRunningSessions?.map((session) => (
                  <ListItem key={session.id} pl={4}>
                    {session.visit}: {session.id}
                  </ListItem>
                ))}
              </List>
              <Text>Proceed with cleaning up old running visits?</Text>
            </ModalBody>
            {/* Bottom of dialog box */}
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  onCloseVisitCleanupPrompt()
                  navigate(`../instruments/${instrumentName}/new_session`)
                }}
              >
                Skip Cleanup
              </Button>
              <Button variant="default" onClick={handleVisitCleanupPrompt}>
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={isOpenCalendar} onClose={onCloseCalendar} size={'xl'}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Turn off alerts until (select time)</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <input
                aria-label="Date and time"
                type="datetime-local"
                // Convert UTC into local UK time, and set seconds to 0
                defaultValue={
                  convertUTCToUKNaive(defaultSilenceEndTime).slice(0, 16) +
                  ':00'
                }
                onChange={(e) => {
                  // The seconds field is removed when it's 0, so add it back
                  let timestamp = e.target.value
                  timestamp += ':00'
                  // Find the equivalent UTC time and save that
                  let newEndTime = new Date(convertUKNaiveToUTC(timestamp))
                  setProposedEndTime(newEndTime)
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  onCloseCalendar()
                  setProposedEndTime(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (proposedEndTime) {
                    setEndTime(proposedEndTime)
                    onCloseCalendar()
                  }
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* Sessions title bar */}
        <Box
          bg="murfey.700"
          w="100%"
          px={{
            base: 8,
            md: 16,
          }}
          py={4}
          display="flex"
          flexDirection="column"
          alignItems="start"
          justifyContent="start"
          gap={2}
        >
          <Heading color="murfey.50" fontSize="3xl" lineHeight={1}>
            Murfey Sessions
          </Heading>
          <Heading
            color="murfey.50"
            fontSize="md"
            fontWeight="200"
            lineHeight={1}
          >
            Microscope Data Transfer Control System
          </Heading>
          <Tooltip
            label={
              !allStatusesLoaded ? 'Sessions are still loading' : undefined
            }
          >
            <Button
              variant="onBlue"
              maxW="200px"
              textAlign="center"
              isDisabled={!allStatusesLoaded}
              onClick={handleNewSession}
            >
              New Session
            </Button>
          </Tooltip>
        </Box>
        {/* Sessions page contents */}
        <Box
          p={4}
          flex="1"
          display="flex"
          flexDirection="row"
          alignItems="start"
          justifyContent="space-evenly"
          gap={{
            base: 8,
            md: 32,
          }}
          overflow="auto"
        >
          {/* Left column showing known Murfey sessions */}
          <Box
            minW="300px"
            maxW="600px"
            flex="1"
            pl={{
              base: 8,
              md: 16,
            }}
            display="flex"
            flexDirection="column"
            alignItems="start"
            justifyContent="start"
            gap={4}
            overflow="auto"
          >
            <Heading
              textAlign="left"
              w="100%"
              fontSize="2xl"
              mt={8}
              lineHeight={1}
            >
              Existing Sessions
            </Heading>
            <Divider borderColor="murfey.300" />
            {/* Display sessions in descending order of session ID */}
            {sessionsData.map((session) => (
              <SessionRow
                session={session}
                instrumentName={instrumentName}
                isActive={sessionStatuses[session.id]?.isActive}
                isFinalising={sessionStatuses[session.id]?.isFinalising}
              ></SessionRow>
            ))}
          </Box>
          {/* Right column showing instrument card */}
          <VStack>
            <Box minW="400px" maxW="600px" flex=":1" overflow="auto">
              <InstrumentCard />
            </Box>
            <Card width={'100%'}>
              <CardBody>
                <VStack>
                  <VStack>
                    {existingEndTime ? (
                      <Text>
                        {'Alerts off until ' +
                          formatUTCISOToUKLocal(existingEndTime.toString())}
                      </Text>
                    ) : (
                      ''
                    )}
                    {existingEndTime ? (
                      <Button
                        variant="default"
                        onClick={() => {
                          handleDeleteSilence(instrumentName)
                        }}
                      >
                        Turn On Alerts
                      </Button>
                    ) : (
                      ''
                    )}
                    <Text>Turn off alerts until</Text>
                    <HStack>
                      <Text>
                        {endTime
                          ? formatUTCISOToUKLocal(endTime.toString())
                          : 'NOT SET'}
                      </Text>
                      <Tooltip label="Set end time for silence">
                        <IconButton
                          aria-label="calendar-for-end-time"
                          onClick={() => onOpenCalendar()}
                        >
                          <FaCalendar />
                        </IconButton>
                      </Tooltip>
                    </HStack>
                  </VStack>
                  <HStack>
                    <Button
                      variant="default"
                      isDisabled={endTime ? false : true}
                      onClick={() => {
                        handleCreateSilence(instrumentName, endTime)
                      }}
                    >
                      Turn Off Alerts
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Box>
    </div>
  )
}
