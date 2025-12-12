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
} from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InstrumentCard } from 'components/instrumentCard'
import { SessionRow } from 'components/sessionRow'
import { getInstrumentConnectionStatus } from 'loaders/general'
import { sessionTokenCheck } from 'loaders/jwt'
import { finaliseSession } from 'loaders/rsyncers'
import { getAllSessionsData } from 'loaders/sessionClients'
import { checkMultigridControllerStatus } from 'loaders/sessionSetup'
import React, { useEffect } from 'react'
import { useNavigate, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import { convertUKNaiveToUTC } from 'utils/generic'

type Session = components['schemas']['Session']
type ExpandedSession = Session & {
  isActive: boolean
  isFinalising: boolean
}
export const Home = () => {
  const instrumentName = sessionStorage.getItem('instrumentName')
  const queryKey = ['homepageSessions', instrumentName]
  const queryFn = () => getAllSessionsData(instrumentName ? instrumentName : '')

  // Set up a queryClient object
  const queryClient = useQueryClient()

  // Load and set current data
  const preloadedData = useLoaderData()
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    initialData: preloadedData,
    enabled: !!instrumentName,
    staleTime: 0, // Always refetch on mount unless preloaded
  })
  const sessionsData = data as {
    current: Session[]
  } | null

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

  // Load sessions for current instrument
  const [expandedSessions, setExpandedSessions] = React.useState<
    ExpandedSession[] | null
  >(null)
  useEffect(() => {
    // Skip if sessions is still null
    if (!sessionsData) return

    const getSessions = async () => {
      // Sort by session ID in descending order
      const sortedSessions = [...sessionsData.current].sort(
        (a, b) => b.id - a.id
      )

      // Collect additional information about the sessions
      const expandedSessions: ExpandedSession[] = await Promise.all(
        sortedSessions.map(async (session) => {
          const isActive = await sessionTokenCheck(session.id)
          const isFinalising = await checkMultigridControllerStatus(
            session.id.toString()
          ).then((status) => {
            return status.finalising
          })
          return {
            ...session,
            isActive: !!isActive,
            isFinalising: !!isFinalising,
          }
        })
      )
      setExpandedSessions(expandedSessions)
    }

    getSessions()
  }, [sessionsData, instrumentServerConnected])

  // Look for stale running sessions
  const [staleRunningSessions, setStaleRunningSessions] = React.useState<
    ExpandedSession[] | null
  >(null)
  useEffect(() => {
    // Skip effect if sessions haven't loaded yet
    if (!expandedSessions) return

    // Get current timestamp
    const currentTimestamp = new Date()

    setStaleRunningSessions(
      expandedSessions.filter((session) => {
        if (!session.visit_end_time) return false
        if (!session.isActive) return false
        const sessionEndTimeUTC = new Date(
          convertUKNaiveToUTC(session.visit_end_time)
        )
        return sessionEndTimeUTC < currentTimestamp
      })
    )
  }, [expandedSessions])

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
    if (!!staleRunningSessions) {
      // Iterate through stale sessions and trigger cleanup on them
      const updatedSessions = staleRunningSessions.map((session) => {
        finaliseSession(session.id)
        console.log(`Session ${session.id} marked for cleanup`)
        return {
          ...session,
          isFinalising: true,
        }
      })
      // Update the React state and refetch queries
      setExpandedSessions(updatedSessions)
      queryClient.refetchQueries({
        queryKey: queryKey,
      })
    }
    // Close the window, and move to next page
    onCloseVisitCleanupPrompt()
    navigate(`../instruments/${instrumentName}/new_session`)
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
          <Button
            variant="onBlue"
            maxW="200px"
            textAlign="center"
            onClick={handleNewSession}
          >
            New Session
          </Button>
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
            {expandedSessions && expandedSessions.length > 0 ? (
              expandedSessions.map((session) => {
                return (
                  <SessionRow
                    session={session}
                    instrumentName={instrumentName}
                    isActive={session.isActive}
                    isFinalising={session.isFinalising}
                  />
                )
              })
            ) : (
              <Heading w="100%" py={4} variant="notFound">
                No sessions found
              </Heading>
            )}
          </Box>
          {/* Right column showing instrument card */}
          <Box minW="300px" maxW="600px" flex="1" overflow="auto">
            <InstrumentCard />
          </Box>
        </Box>
      </Box>
    </div>
  )
}
