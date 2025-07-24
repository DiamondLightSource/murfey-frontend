import { ViewIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Flex,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Spacer,
  Stack,
  Switch,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { InstrumentCard } from 'components/instrumentCard'
import { RsyncCard } from 'components/rsyncCard'
import { UpstreamVisitCard } from 'components/upstreamVisitsCard'
import { getInstrumentConnectionStatus } from 'loaders/general'
import { sessionTokenCheck, sessionHandshake } from 'loaders/jwt'
import { getMachineConfigData } from 'loaders/machineConfig'
import {
  startMultigridWatcher,
  setupMultigridWatcher,
} from 'loaders/multigridSetup'
import { getSessionProcessingParameterData } from 'loaders/processingParameters'
import { getRsyncerData, pauseRsyncer, finaliseSession } from 'loaders/rsyncers'
import { updateVisitEndTime, getSessionData } from 'loaders/sessionClients'
import { checkMultigridControllerStatus } from 'loaders/sessionSetup'
import React, { useEffect, useCallback } from 'react'
import { FaCalendar } from 'react-icons/fa'
import { MdFileUpload, MdOutlineGridOn, MdPause } from 'react-icons/md'
import {
  Link as LinkRouter,
  useLoaderData,
  useParams,
  useNavigate,
} from 'react-router-dom'
import { components } from 'schema/main'
import { convertUKNaiveToUTC, convertUTCToUKNaive } from 'utils/generic'

type RSyncerInfo = components['schemas']['RSyncerInfo']
type SessionSchema = components['schemas']['Session']
type MachineConfig = components['schemas']['MachineConfig']
type MultigridWatcherSpec = components['schemas']['MultigridWatcherSetup']

export const Session = () => {
  // ----------------------------------------------------------------------------------
  // Routing and loader context
  const { sessid } = useParams() as { sessid: string }
  const instrumentName = sessionStorage.getItem('instrumentName')
  const navigate = useNavigate()

  // ----------------------------------------------------------------------------------
  // State hooks
  // Instrument server connection
  const [instrumentServerConnected, setInstrumentServerConnected] =
    React.useState<boolean>(false)

  // Session information
  const [session, setSession] = React.useState<SessionSchema>()
  const [sessionActive, setSessionActive] = React.useState(false)
  const [skipExistingProcessing, setSkipExistingProcessing] =
    React.useState(false)

  // File transfer source information
  const [selectedDirectory, setSelectedDirectory] = React.useState('')

  // Visit end time information
  const [visitEndTime, setVisitEndTime] = React.useState<Date | null>(null)
  const [proposedVisitEndTime, setProposedVisitEndTime] =
    React.useState<Date | null>(null)
  const [triggerVisitEndTimeUpdate, setTriggerVisitEndTimeUpdate] =
    React.useState<Boolean>(false)

  // Machine config and instrument information
  const [machineConfig, setMachineConfig] = React.useState<MachineConfig>()

  // Rsyncer information
  const [rsyncers, setRsyncers] = React.useState<RSyncerInfo[]>([])
  const [rsyncersPaused, setRsyncersPaused] = React.useState(false)

  // ----------------------------------------------------------------------------------
  // Load Rsyncer data via a polling query
  const preloadedRsyncerData = useLoaderData() as RSyncerInfo[] | null
  const {
    data: rsyncerData,
    isLoading,
    isError,
  } = useQuery<RSyncerInfo[] | null>({
    queryKey: ['rsyncers', sessid],
    queryFn: () => getRsyncerData(sessid),
    enabled: !!sessid,
    initialData: preloadedRsyncerData,
    staleTime: 0,
    refetchInterval: sessionActive ? 5000 : false,
  })
  useEffect(() => {
    if (!rsyncerData) return
    setRsyncers(rsyncerData)
  }, [rsyncerData])

  // Set up a query to probe the instrument server connection status
  const { data: instrmentServerConnectionStatus } = useQuery<boolean>({
    queryKey: ['instrumentServerConnection', instrumentName],
    queryFn: () => getInstrumentConnectionStatus(),
    enabled: !!sessid,
    initialData: sessionActive,
    staleTime: 0,
  })
  useEffect(() => {
    console.log(
      `Instrument server is connected:`,
      instrmentServerConnectionStatus
    )
    setInstrumentServerConnected(instrmentServerConnectionStatus)
  }, [instrmentServerConnectionStatus])

  // ----------------------------------------------------------------------------------
  // UI utility hooks
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenReconnect,
    onOpen: onOpenReconnect,
    onClose: onCloseReconnect,
  } = useDisclosure()
  const {
    isOpen: isOpenCalendar,
    onOpen: onOpenCalendar,
    onClose: onCloseCalendar,
  } = useDisclosure()

  // ----------------------------------------------------------------------------------
  // Functions

  // Get machine config and set up related settings
  const handleMachineConfig = (mcfg: MachineConfig) => {
    setMachineConfig(mcfg)
    setSelectedDirectory(mcfg['data_directories'][0])
  }
  useEffect(() => {
    getMachineConfigData().then((mcfg) => handleMachineConfig(mcfg))
  }, [])

  // Redirect user to earlier stages of the setup depending on what is missing
  useEffect(() => {
    // Exit early if required states are undefined
    if (
      session === undefined ||
      sessid === undefined ||
      !sessionActive ||
      machineConfig === undefined
    )
      return

    const runRedirectChecks = async () => {
      // Check if the multigrid controller for the session exists
      const multigridControllerStatus =
        await checkMultigridControllerStatus(sessid)
      if (!multigridControllerStatus.exists) {
        // Check if this instrument has a gain reference directory configured
        if (
          !!machineConfig?.gain_reference_directory &&
          machineConfig.gain_reference_directory.trim() !== ''
        ) {
          // Check if a gain reference file has been uploaded
          if (!session.current_gain_ref) {
            // Redirect to the gain reference page
            navigate(
              `/sessions/${sessid}/gain_ref_transfer?sessid=${sessid}&setup=true`
            )
            return
          }
        }
        // Redirect to set up multigrid controller
        navigate(`/new_session/setup/${sessid}`)
        return
      }

      // Check if this instrument has processing recipes configured
      if (
        machineConfig?.recipes &&
        Object.keys(machineConfig.recipes).length > 0
      ) {
        // Check if processing parameters have been provided
        getSessionProcessingParameterData(sessid).then((params) => {
          if (params === null && session.process) {
            // Redirect to the processing parameters page
            navigate(`/new_session/parameters/${sessid}`)
            return
          }
        })
      }
    }
    runRedirectChecks() // Call the async function inside the useEffect()
  }, [sessid, session, sessionActive, machineConfig, navigate])

  // Load Session page upon initialisation
  const loadSession = useCallback(async () => {
    const sess = await getSessionData(sessid)
    if (sess) {
      setSession(sess.session)
    }
  }, [sessid])
  useEffect(() => {
    loadSession()
  }, [sessid, loadSession])

  // Other Rsync-related functions
  const finaliseAll = async () => {
    if (sessid) await finaliseSession(parseInt(sessid))
    onClose()
  }

  const pauseAll = async () => {
    rsyncers?.forEach((r) => {
      pauseRsyncer(r.session_id, r.source)
    })
    setRsyncersPaused(true)
  }

  const checkRsyncStatus = useCallback(async () => {
    setRsyncersPaused(rsyncers ? !rsyncers.every(getTransferring) : true)
  }, [rsyncers])

  useEffect(() => {
    checkRsyncStatus()
  }, [checkRsyncStatus])

  const getTransferring = (r: RSyncerInfo) => {
    return r.transferring
  }

  // Update the state of the session when a change in
  // instrument server connection status occurs
  const checkSessionActivationState = useCallback(async () => {
    if (sessid !== undefined) {
      const activationState = await sessionTokenCheck(parseInt(sessid))
      setSessionActive(activationState)
      console.log(`Session is active:`, activationState)
    }
  }, [sessid])
  useEffect(() => {
    checkSessionActivationState()
  }, [checkSessionActivationState, instrumentServerConnected])

  // Set the default visit end time (in UTC) if none was provided
  const defaultVisitEndTime = session?.visit_end_time
    ? (() => {
        let endTime = session.visit_end_time
        return endTime
      })()
    : (() => {
        const now = new Date()
        const fallback = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes(),
          0, // Set seconds to 0
          0 // Set milliseconds to 0
        ).toISOString()
        return fallback
      })()

  // Set the visit end time upon loading of the initial session
  useEffect(() => {
    if (session && session.visit_end_time) {
      setVisitEndTime(new Date(session.visit_end_time))
    } else {
      setVisitEndTime(null)
    }
  }, [session])

  // Update the visit end time only after it's been confirmed
  useEffect(() => {
    if (
      !triggerVisitEndTimeUpdate ||
      !visitEndTime ||
      typeof sessid === 'undefined'
    )
      return
    let registerEndTimeUpdate = async () => {
      await updateVisitEndTime(parseInt(sessid), visitEndTime)
      await loadSession() // Refresh the page with new details
      onCloseCalendar()
      setTriggerVisitEndTimeUpdate(false)
    }
    registerEndTimeUpdate()
  }, [
    sessid,
    visitEndTime,
    triggerVisitEndTimeUpdate,
    loadSession,
    onCloseCalendar,
  ])

  const handleDirectorySelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedDirectory(e.target.value)

  const handleReconnect = async () => {
    if (typeof sessid !== 'undefined') {
      await sessionHandshake(parseInt(sessid))
      await setupMultigridWatcher(
        {
          source: selectedDirectory,
          skip_existing_processing: skipExistingProcessing,
          destination_overrides: rsyncers
            ? Object.fromEntries(rsyncers.map((r) => [r.source, r.destination]))
            : {},
          rsync_restarts: rsyncers ? rsyncers.map((r) => r.source) : [],
        } as MultigridWatcherSpec,
        parseInt(sessid)
      )
      await startMultigridWatcher(parseInt(sessid))
      await checkSessionActivationState()
      onCloseReconnect()
    }
  }

  if (isLoading) return <p>Loading RSyncer data...</p>
  if (isError) return <p>Error loading RSyncer data</p>
  return (
    <div className="rootContainer">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Visit Completion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to remove all data associated with this visit?
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => finaliseAll()}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenReconnect} onClose={onCloseReconnect}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Restart Transfers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl display="flex" alignItems="center">
              <VStack>
                <HStack>
                  <FormLabel mb="0">Data directory</FormLabel>
                  <Select onChange={handleDirectorySelection}>
                    {machineConfig &&
                    machineConfig['data_directories'].length > 0 ? (
                      machineConfig['data_directories'].map((value) => {
                        return <option value={value}>{value}</option>
                      })
                    ) : (
                      <GridItem colSpan={5}>
                        <Heading textAlign="center" py={4} variant="notFound">
                          No Data Directories Found
                        </Heading>
                      </GridItem>
                    )}
                  </Select>
                </HStack>
                <HStack>
                  <FormLabel mb="0">Do not process existing data</FormLabel>
                  <Switch
                    id="skip-existing-processing-reconnect"
                    isChecked={false}
                    onChange={() => {
                      setSkipExistingProcessing(!skipExistingProcessing)
                    }}
                  />
                </HStack>
              </VStack>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onCloseReconnect}>
              Close
            </Button>
            <Button variant="ghost" onClick={handleReconnect}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenCalendar} onClose={onCloseCalendar} size={'xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select data transfer end time</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <input
              aria-label="Date and time"
              type="datetime-local"
              defaultValue={convertUTCToUKNaive(defaultVisitEndTime)}
              onChange={(e) => {
                let timestamp = e.target.value
                timestamp += ':00'
                const newVisitEndTime = new Date(convertUKNaiveToUTC(timestamp))
                setProposedVisitEndTime(newVisitEndTime)
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                onCloseCalendar()
                setProposedVisitEndTime(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (proposedVisitEndTime) {
                  setVisitEndTime(proposedVisitEndTime)
                  setTriggerVisitEndTimeUpdate(true)
                }
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack
              bg="murfey.700"
              justifyContent="start"
              alignItems="start"
              display="flex"
              w="100%"
              px="10vw"
              py="1vh"
            >
              <Heading size="xl" color="murfey.50">
                Session {sessid}: {session ? session.visit : null}
                {/* Display visit end time if set for this session */}
                {visitEndTime && (
                  <>
                    {' '}
                    [Transfer ends at{' '}
                    {visitEndTime.toLocaleString('en-GB', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZoneName: 'short',
                    })}
                    ]
                  </>
                )}
              </Heading>
              <HStack>
                <HStack>
                  <HStack>
                    <Button variant="onBlue" onClick={() => onOpen()}>
                      Visit Complete
                    </Button>
                    <IconButton
                      aria-label="Pause all transfers"
                      as={MdPause}
                      variant="onBlue"
                      isDisabled={rsyncersPaused}
                      onClick={() => pauseAll()}
                    />
                    <Link
                      w={{ base: '100%', md: '19.6%' }}
                      _hover={{ textDecor: 'none' }}
                      as={LinkRouter}
                      to={`session_parameters`}
                    >
                      <Button variant="onBlue">Processing Parameters</Button>
                    </Link>
                  </HStack>
                  {!sessionActive ? (
                    <Button variant="onBlue" onClick={() => onOpenReconnect()}>
                      Reconnect
                    </Button>
                  ) : (
                    <></>
                  )}
                </HStack>
                <HStack>
                  <IconButton
                    aria-label="calendar-to-change-end-time"
                    variant="onBlue"
                    onClick={() => onOpenCalendar()}
                  >
                    <FaCalendar />
                  </IconButton>
                </HStack>
                <Spacer />
                <ViewIcon color="white" />
                <Switch colorScheme="murfey" id="monitor" />
                {/* <Button aria-label="Subscribe to notifications" rightIcon={<MdEmail/>} variant="onBlue">
                            Subscribe
                        </Button> */}
              </HStack>
            </VStack>
          </VStack>
        </Box>
        <Box mt="1em" w="95%" justifyContent={'center'} alignItems={'center'}>
          <Flex align="stretch">
            <Stack w="100%" spacing={5} py="0.8em" px="1em">
              {rsyncers && rsyncers.length > 0 ? (
                rsyncers.map(
                  (r): React.ReactElement => (
                    <RsyncCard
                      key={`${r.session_id}-${r.source}`} // Used by 'map' for ID-ing elements
                      rsyncer={r}
                    />
                  )
                )
              ) : (
                <GridItem colSpan={5}>
                  <Heading textAlign="center" py={4} variant="notFound">
                    No RSyncers Found
                  </Heading>
                </GridItem>
              )}
            </Stack>
            <Spacer />
            <Stack spacing={5} py="0.8em" px="1em">
              <Link
                w={{ base: '100%', md: '19.6%' }}
                key="data_collections"
                _hover={{ textDecor: 'none' }}
                as={LinkRouter}
                to={`../sessions/${sessid}/data_collection_groups`}
              >
                <Button rightIcon={<MdOutlineGridOn />} padding="20px">
                  Data Collections
                </Button>
              </Link>
              <Link
                w={{ base: '100%', md: '19.6%' }}
                key="gain_ref"
                _hover={{ textDecor: 'none' }}
                as={LinkRouter}
                to={`../sessions/${sessid}/gain_ref_transfer?sessid=${sessid}`}
              >
                <Button rightIcon={<MdFileUpload />} padding="20px">
                  Transfer Gain Reference
                </Button>
              </Link>
              <InstrumentCard />
              <UpstreamVisitCard sessid={parseInt(sessid ?? '0')} />
            </Stack>
          </Flex>
        </Box>
      </Box>
    </div>
  )
}
