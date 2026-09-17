import {
  Box,
  Button,
  Card,
  Input,
  Heading,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalCloseButton,
  ModalBody,
  IconButton,
  Tooltip,
  Text,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { SetupStepper } from 'components/setupStepper'
import { sessionTokenCheck, sessionHandshake } from 'loaders/jwt'
import { createSession, getSessionDataForVisit } from 'loaders/sessionClients'
import React from 'react'
import { FaCalendar } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import {
  convertUTCToUKNaive,
  convertUKNaiveToUTC,
  formatUTCISOToUKLocal,
} from 'utils/generic'

type Visit = components['schemas']['Visit']
type Session = components['schemas']['Session']

const NewSession = () => {
  // Load visits and add columns where they are formatted
  const currentVisits = useLoaderData() as Visit[] | null
  const formattedVisits: Visit[] = currentVisits
    ? currentVisits.map((visit) => ({
        ...visit,
        // Add new columns with the formatted timestamps for use in the table
        startFormatted: formatUTCISOToUKLocal(visit.start),
        endFormatted: formatUTCISOToUKLocal(visit.end),
      }))
    : []

  const {
    isOpen: isOpenVisitCheck,
    onOpen: onOpenVisitCheck,
    onClose: onCloseVisitCheck,
  } = useDisclosure()
  const {
    isOpen: isOpenCalendar,
    onOpen: onOpenCalendar,
    onClose: onCloseCalendar,
  } = useDisclosure()
  const [visitName, setVisitName] = React.useState('')
  const [sessionDescription, setSessionDescription] = React.useState('')
  const [activeSessionsForVisit, setActiveSessionsForVisit] = React.useState<
    Session[]
  >([])
  const [endTime, setEndTime] = React.useState<Date | null>(null)
  const [proposedEndTime, setProposedEndTime] = React.useState<Date | null>(
    null
  )
  const [createSessionDisabled, setCreateSessionDisabled] =
    React.useState<boolean>(false)
  const [ignoreAndContinueDisabled, setIgnoreAndContinueDisabled] =
    React.useState<boolean>(false)

  const navigate = useNavigate()

  // Upon initialisation, zero out seconds field
  const defaultVisitEndTime = (() => {
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

  const instrumentName = sessionStorage.getItem('instrumentName')

  const handleVisitNameInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVisitName(event.target.value)
  }

  const handleSessionDescriptionInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSessionDescription(event.target.value)
  }

  const selectVisit = (data: Record<string, any>, index: number) => {
    setVisitName(data.name)
    setSessionDescription(data.proposal_title)
    // Add an hour to the listed end time
    const endTime = new Date(new Date(data.end).getTime() + 3600 * 1000 * 2)
    setEndTime(endTime)
  }

  const handleNextSetupPage = (sessid: number) => {
    navigate(`../new_session/setup/${sessid}`)
  }

  const startMurfeySession = async (iName: string) => {
    const sessid = await createSession(
      visitName,
      sessionDescription === '' ? visitName : sessionDescription,
      iName,
      endTime
    )
    await sessionHandshake(sessid)
    return sessid
  }

  const alreadyActiveSessions = async () => {
    // Check if there are active sessions for the selected visit
    const sessionsToCheck: Session[] = await getSessionDataForVisit(
      visitName,
      instrumentName ?? ''
    )
    return Promise.all(
      sessionsToCheck.map(async (session) => {
        return (await sessionTokenCheck(session.id)) ? session : null
      })
    )
  }

  const handleCreateSession = (iName: string) => {
    // Disable the button to show that it's working
    setCreateSessionDisabled(true)
    alreadyActiveSessions().then(async (activeSessions) => {
      // Check for active sessions
      if (
        activeSessions !== null &&
        activeSessions.length &&
        activeSessions.every((elem) => {
          return elem !== null
        })
      ) {
        // If there are active sessions, load the popup
        setActiveSessionsForVisit(activeSessions)
        onOpenVisitCheck()
      } else {
        // Otherwise, start session and move to next page
        const sessid = await startMurfeySession(iName)
        handleNextSetupPage(sessid)
      }
    })
  }

  return instrumentName ? (
    <div className="rootContainer">
      {/* Pop-ups section */}
      {/* Pop-up warning about creating a duplicate live visit */}
      <Modal
        isOpen={isOpenVisitCheck}
        onClose={() => {
          setCreateSessionDisabled(false)
          onCloseVisitCheck()
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            An active session already exists for this visit
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              w="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="start"
              gap={4}
            >
              <Box
                w="100%"
                px={2}
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="start"
                gap={2}
              >
                {activeSessionsForVisit.map((session) => {
                  return session ? (
                    <Button
                      key="gain_ref"
                      variant="default"
                      onClick={() => {
                        navigate(`/sessions/${session.id}`)
                      }}
                    >
                      {session.id}
                    </Button>
                  ) : (
                    <></>
                  )
                })}
              </Box>
              <Text>
                You may want to edit one of the above sessions instead
                (otherwise you may start multiple transfers for the same source)
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              isDisabled={visitName === '' || ignoreAndContinueDisabled}
              onClick={() => {
                // Disable the button to show that it's working
                setIgnoreAndContinueDisabled(true)
                // Start Murfey, then move on to the next page
                startMurfeySession(instrumentName).then((sessid: number) => {
                  handleNextSetupPage(sessid)
                  setIgnoreAndContinueDisabled(false)
                })
              }}
            >
              Ignore and continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Pop-up to set transfer end time with */}
      <Modal isOpen={isOpenCalendar} onClose={onCloseCalendar} size={'xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select data transfer end time</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <input
              aria-label="Date and time"
              type="datetime-local"
              // Convert UTC into local UK time, and set seconds to 0
              defaultValue={
                convertUTCToUKNaive(defaultVisitEndTime).slice(0, 16) + ':00'
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
      {/* Parent container fpr page contents */}
      <Box
        className="homeRoot"
        overflow="auto"
        display="flex"
        flexDirection="column"
        flex="1"
        bg="murfey.50"
      >
        {/* Page title bar */}
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
          <Heading size="xl" color="murfey.50">
            Create Session
          </Heading>
          <Heading size="md" color="murfey.50">
            Choose from a currently active visit or manually input one
          </Heading>
        </Box>
        {/* Page contents */}
        <Box
          overflow="auto"
          p={8}
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="start"
          gap={8}
        >
          {/* Setup steps progress indicator */}
          <Box w="80%" minW="600px">
            <SetupStepper activeStepIndex={0} />
          </Box>
          {/* Table showing current visit information */}
          <Box w="80%" minW="600px">
            <Table
              data={formattedVisits}
              headers={[
                { key: 'name', label: 'Name' },
                { key: 'startFormatted', label: 'Start Time' },
                { key: 'endFormatted', label: 'End Time' },
                { key: 'proposal_title', label: 'Description' },
              ]}
              label={'visitData'}
              onClick={selectVisit}
            />
          </Box>
          {/* Visit name and transfer end time information */}
          <Box
            minW="400px"
            maxW="600px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
          >
            {/* Visit name input */}
            <Input
              placeholder="Visit name"
              value={visitName}
              onChange={handleVisitNameInput}
            />
            {/* Visit description input */}
            <Input
              placeholder="Session description (optional)"
              value={sessionDescription}
              onChange={handleSessionDescriptionInput}
            />
            {/* Transfer end time indicator */}
            <Card
              w="100%"
              p={4}
              cursor="default"
              _hover={{
                cursor: 'default',
                borderColor: 'murfey.400',
              }}
            >
              <Box
                w="100%"
                display="flex"
                flexDirection="column"
                alignItems="start"
                gap={4}
              >
                <Text>Transfers will stop after:</Text>
                <Box
                  w="100%"
                  pl={4}
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text>
                    {endTime
                      ? new Intl.DateTimeFormat('en-GB', {
                          timeZone: 'Europe/London',
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          timeZoneName: 'short',
                          hour12: false,
                        }).format(endTime)
                      : 'NOT SET'}
                  </Text>
                  <Tooltip label="Set end time for data transfer">
                    <IconButton
                      aria-label="calendar-for-end-time"
                      icon={<FaCalendar />}
                      onClick={() => onOpenCalendar()}
                    />
                  </Tooltip>
                </Box>
                <Text>
                  (To receive alerts, a transfer end time needs to be set)
                </Text>
              </Box>
            </Card>
          </Box>
          <Button
            variant="default"
            isDisabled={visitName === '' || createSessionDisabled}
            onClick={() => {
              handleCreateSession(instrumentName)
            }}
          >
            Create session for visit {visitName}
          </Button>
        </Box>
      </Box>
    </div>
  ) : (
    <></>
  )
}

export { NewSession }
