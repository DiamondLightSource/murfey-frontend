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
  useToast,
} from '@chakra-ui/react'

import { useDisclosure } from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'

import { v4 as uuid4 } from 'uuid'
import {
  Link as LinkRouter,
  useLoaderData,
  useParams,
  useNavigate,
} from 'react-router-dom'
import { MdFileUpload, MdOutlineGridOn, MdPause } from 'react-icons/md'
import { components } from 'schema/main'
import { getInstrumentName } from 'loaders/general'
import { updateVisitEndTime, getSessionData } from 'loaders/sessionClients'
import { checkMultigridControllerStatus } from 'loaders/sessionSetup'
import { getMachineConfigData } from 'loaders/machineConfig'
import {
  getRsyncerData,
  pauseRsyncer,
  removeRsyncer,
  finaliseRsyncer,
  finaliseSession,
} from 'loaders/rsyncers'
import { getSessionProcessingParameterData } from 'loaders/processingParameters'
import { sessionTokenCheck, sessionHandshake } from 'loaders/jwt'
import {
  startMultigridWatcher,
  setupMultigridWatcher,
} from 'loaders/multigridSetup'
import { InstrumentCard } from 'components/instrumentCard'
import { RsyncCard } from 'components/rsyncCard'
import { UpstreamVisitCard } from 'components/upstreamVisitsCard'
import useWebSocket from 'react-use-websocket'

import React, { useEffect } from 'react'
import { FaCalendar } from 'react-icons/fa'
import { convertUKNaiveToUTC, convertUTCToUKNaive } from 'utils/generic'

type RSyncerInfo = components['schemas']['RSyncerInfo']
type Session = components['schemas']['Session']
type MachineConfig = components['schemas']['MachineConfig']
type MultigridWatcherSpec = components['schemas']['MultigridWatcherSetup']

export const Session = () => {
  // ----------------------------------------------------------------------------------
  // Routing and loader context
  const { sessid } = useParams()
  const rsyncerLoaderData = useLoaderData() as RSyncerInfo[] | null
  const navigate = useNavigate()

  // ----------------------------------------------------------------------------------
  // State hooks
  // Session information
  const [session, setSession] = React.useState<Session>()
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
  const [instrumentName, setInstrumentName] = React.useState('')

  // Websocket UUID information
  const [UUID, setUUID] = React.useState('')

  // Rsyncer information
  const [rsyncers, setRsyncers] = React.useState<RSyncerInfo[]>(
    rsyncerLoaderData ?? []
  )
  const [rsyncersPaused, setRsyncersPaused] = React.useState(false)

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
  // Load the Murfey server URL from the environment variable
  const baseUrl =
    sessionStorage.getItem('murfeyServerURL') ??
    process.env.REACT_APP_API_ENDPOINT

  // Set up websocket connection to Murfey server
  const url = baseUrl ? baseUrl.replace('http', 'ws') : 'ws://localhost:8000'

  // Use existing UUID if present; otherwise, generate a new UUID
  useEffect(() => {
    if (!UUID) {
      setUUID(uuid4())
    }
  }, [UUID])

  // Websocket helper function to parse incoming messages
  const toast = useToast()
  const parseWebsocketMessage = (message: any) => {
    let parsedMessage: any = {}
    try {
      parsedMessage = JSON.parse(message)
    } catch (err) {
      return
    }
    if (parsedMessage.message === 'refresh') {
      window.location.reload()
    }
    if (
      parsedMessage.message === 'update' &&
      typeof sessid !== 'undefined' &&
      parsedMessage.session_id === parseInt(sessid)
    ) {
      return toast({
        title: 'Update',
        description: parsedMessage.payload,
        isClosable: true,
        duration: parsedMessage.duration ?? null,
        status: parsedMessage.status ?? 'info',
      })
    }
  }

  // Establish websocket connection to the backend
  useWebSocket(
    // 'null' is passed to 'useWebSocket()' if UUID is not yet set to
    // prevent malformed connections
    UUID ? url + `ws/connect/${UUID}` : null,
    UUID
      ? {
          onOpen: () => {
            console.log('WebSocket connection established.')
          },
          onMessage: (event) => {
            parseWebsocketMessage(event.data)
          },
        }
      : undefined
  )

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
      if (!multigridControllerStatus) {
        console.log(`THe multigrid controller for this session is not set up`)

        // Check if this instrument has a gain reference directory configured
        if (
          !!machineConfig?.gain_reference_directory &&
          machineConfig.gain_reference_directory.trim() !== ''
        ) {
          console.log(`This instrument needs a gain reference file`)
          // Check if a gain reference file has been uploaded
          console.log(`Current gain reference:`, session.current_gain_ref)
          console.log(
            `(!session.current_gain_ref) evaluates to:`,
            !session.current_gain_ref
          )
          if (!session.current_gain_ref) {
            // Redirect to the gain reference page
            console.log(`Gain reference file not found`)
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
        console.log(`This instrument has defined processing recipes`)
        // Check if processing parameters have been provided
        getSessionProcessingParameterData(sessid).then((params) => {
          if (params === null && session.process) {
            console.log(`Processing parameters have not been provided`)
            // Redirect to the processing parameters page
            navigate(`/new_session/parameters/${sessid}`)
            return
          }
        })
      }
    }
    runRedirectChecks() // Call the async function inside the useEffect()
  }, [sessid, session, sessionActive, machineConfig])

  // Load Session page upon initialisation
  const loadSession = async () => {
    const sess = await getSessionData(sessid)
    if (sess) {
      setSession(sess.session)
    }
  }
  useEffect(() => {
    loadSession()
  }, [sessid])

  // Poll Rsyncer every few seconds
  useEffect(() => {
    // Don't run it if a session is inactive or its session ID is not set
    if (!sessid || !sessionActive) return

    const fetchData = async () => {
      try {
        const data = await getRsyncerData(sessid)
        setRsyncers(data)
      } catch (err) {
        console.error('Error polling rsyncers:', err)
      }
    }
    fetchData() // Fetch data once

    // Set it to run every 5s
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [sessid, sessionActive])

  // Other Rsync-related functions
  const handleRemoveRsyncer = async (sessionId: number, source: string) => {
    // Safely update the displayed Rsync cards after a 'remove' call is made
    try {
      await removeRsyncer(sessionId, source)
      const updatedData = await getRsyncerData(String(sessionId))
      setRsyncers(updatedData)
    } catch (err) {
      console.error('Failed to remove rsyncer:', err)
    }
  }

  const handleFinaliseRsyncer = async (sessionId: number, source: string) => {
    // Safely update the displayed Rsync cards after a 'finalise' call is made
    try {
      await finaliseRsyncer(sessionId, source)
      const updatedData = await getRsyncerData(String(sessionId))
      setRsyncers(updatedData)
    } catch (err) {
      console.error('Failed to finalise rsyncer:', err)
    }
  }

  const finaliseAll = async () => {
    if (sessid) await finaliseSession(parseInt(sessid))
    onClose()
  }

  const pauseAll = async () => {
    rsyncers?.map((r) => {
      pauseRsyncer(r.session_id, r.source)
    })
    setRsyncersPaused(true)
  }

  const checkRsyncStatus = async () => {
    setRsyncersPaused(rsyncers ? !rsyncers.every(getTransferring) : true)
  }

  useEffect(() => {
    checkRsyncStatus()
  }, [])

  const getTransferring = (r: RSyncerInfo) => {
    return r.transferring
  }

  // Get and set the instrument name
  const resolveName = async () => {
    const name: string = await getInstrumentName()
    setInstrumentName(name)
  }
  useEffect(() => {
    resolveName()
  }, [])

  const checkSessionActivationState = async () => {
    if (sessid !== undefined) {
      const activationState = await sessionTokenCheck(parseInt(sessid))
      setSessionActive(activationState)
    }
  }
  useEffect(() => {
    checkSessionActivationState()
  }, [])

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
  }, [visitEndTime, triggerVisitEndTimeUpdate])

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
    }
  }

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
                      // Pass the handler functions through to the RsyncCard object
                      onRemove={handleRemoveRsyncer}
                      onFinalise={handleFinaliseRsyncer}
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
