import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spacer,
    Stack,
    Switch,
    useToast,
    VStack
} from '@chakra-ui/react'

import { ViewIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/react'

import { InstrumentCard } from 'components/instrumentCard'
import { UpstreamVisitCard } from 'components/upstreamVisitsCard'
import { getInstrumentName } from 'loaders/general'
import { sessionHandshake, sessionTokenCheck } from 'loaders/jwt'
import { getMachineConfigData } from 'loaders/machineConfig'
import {
    setupMultigridWatcher,
    startMultigridWatcher,
} from 'loaders/multigridSetup'
import { getSessionProcessingParameterData } from 'loaders/processingParameters'
import {
    finaliseSession,
    pauseRsyncer
} from 'loaders/rsyncers'
import {
    MdFileUpload,
    MdOutlineGridOn,
    MdPause
} from 'react-icons/md'
import {
    Link as LinkRouter,
    useLoaderData,
    useNavigate,
    useParams,
} from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { v4 as uuid4 } from 'uuid'

import React, { ChangeEvent, useEffect, useState } from 'react'
import { MachineConfig, MultigridWatcherSpec, RSyncerInfo } from 'utils/types'
import { RsyncCard } from './RsyncCard'

const Session = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
        isOpen: isOpenReconnect,
        onOpen: onOpenReconnect,
        onClose: onCloseReconnect,
    } = useDisclosure()
    const rsync = useLoaderData() as RSyncerInfo[] | null
    const { sessid } = useParams()
    const navigate = useNavigate()
    const [UUID, setUUID] = useState('')
    const [instrumentName, setInstrumentName] = useState('')
    const [machineConfig, setMachineConfig] = useState<MachineConfig>()
    const [sessionActive, setSessionActive] = useState(false)
    const [skipExistingProcessing, setSkipExistingProcessing] =
        useState(false)
    const [selectedDirectory, setSelectedDirectory] = useState('')
    const [rsyncersPaused, setRsyncersPaused] = useState(false)
    const baseUrl =
        sessionStorage.getItem('murfeyServerURL') ??
        process.env.REACT_APP_API_ENDPOINT
    const url = baseUrl ? baseUrl.replace('http', 'ws') : 'ws://localhost:8000'
    const toast = useToast()
    const [session, setSession] = useState<Session>()

    const handleMachineConfig = (mcfg: MachineConfig) => {
        setMachineConfig(mcfg)
        setSelectedDirectory(mcfg['data_directories'][0])
    }

    // Use existing UUID if present; otherwise, generate a new UUID
    useEffect(() => {
        if (!UUID) {
            setUUID(uuid4())
        }
    }, [UUID])

    const recipesAreDefined: boolean = [machineConfig, machineConfig?.recipes, Object.keys(machineConfig?.recipes!).length !== 0].every(v => v)

    useEffect(() => {
        getSessionProcessingParameterData(sessid).then((params) => {
            const authIsValid = params === null &&
                recipesAreDefined &&
                session !== undefined &&
                session.process
            if (authIsValid) navigate(`/new_session/parameters/${sessid}`)
        })
    })

    useEffect(() => {
        getMachineConfigData().then((mcfg) => handleMachineConfig(mcfg))
    }, [])

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

    const finaliseAll = async () => {
        if (sessid) await finaliseSession(parseInt(sessid))
        onClose()
    }

    const pauseAll = async () => {
        rsync?.map((r) => {
            pauseRsyncer(r.session_id, r.source)
        })
        setRsyncersPaused(true)
    }

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

    const getTransferring = (r: RSyncerInfo) => {
        return r.transferring
    }

    const checkRsyncStatus = async () => {
        setRsyncersPaused(rsync ? !rsync.every(getTransferring) : true)
    }

    useEffect(() => {
        checkRsyncStatus()
    }, [])

    const handleDirectorySelection = (
        e: ChangeEvent<HTMLSelectElement>
    ) => setSelectedDirectory(e.target.value)

    const handleReconnect = async () => {
        if (typeof sessid !== 'undefined') {
            await sessionHandshake(parseInt(sessid))
            await setupMultigridWatcher(
                {
                    source: selectedDirectory,
                    skip_existing_processing: skipExistingProcessing,
                    destination_overrides: rsync
                        ? Object.fromEntries(
                            rsync.map((r) => [r.source, r.destination])
                        )
                        : {},
                    rsync_restarts: rsync ? rsync.map((r) => r.source) : [],
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
                        Are you sure you want to remove all data associated with
                        this visit?
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
                                        {machineConfig && machineConfig['data_directories'].length > 0
                                            ? machineConfig['data_directories'].map((value) => <option value={value}> {value} </option>)
                                            : <GridItem colSpan={5}>
                                                <Heading
                                                    textAlign="center"
                                                    py={4}
                                                    variant="notFound"
                                                >
                                                    No Data Directories Found
                                                </Heading>
                                            </GridItem>
                                        }
                                    </Select>
                                </HStack>
                                <HStack>
                                    <FormLabel mb="0">
                                        Do not process existing data
                                    </FormLabel>
                                    <Switch
                                        id="skip-existing-processing-reconnect"
                                        isChecked={false}
                                        onChange={() => {
                                            setSkipExistingProcessing(
                                                !skipExistingProcessing
                                            )
                                        }}
                                    />
                                </HStack>
                            </VStack>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={onCloseReconnect}
                        >
                            Close
                        </Button>
                        <Button variant="ghost" onClick={handleReconnect}>
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
                            </Heading>
                            <HStack>
                                <HStack>
                                    <HStack>
                                        <Button
                                            variant="onBlue"
                                            onClick={() => onOpen()}
                                        >
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
                                            <Button variant="onBlue">
                                                Processing Parameters
                                            </Button>
                                        </Link>
                                    </HStack>
                                    {!sessionActive && <Button variant="onBlue" onClick={() => onOpenReconnect()} > Reconnect </Button>}
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
                <Box
                    mt="1em"
                    w="95%"
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <Flex align="stretch">
                        <Stack w="100%" spacing={5} py="0.8em" px="1em">
                            {rsync && rsync.length > 0
                                ? rsync.map((r) => <RsyncCard rsyncer={r} />)
                                : (
                                    <GridItem colSpan={5}>
                                        <Heading
                                            textAlign="center"
                                            py={4}
                                            variant="notFound"
                                        >
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
                                <Button
                                    rightIcon={<MdOutlineGridOn />}
                                    padding="20px"
                                >
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
                                <Button
                                    rightIcon={<MdFileUpload />}
                                    padding="20px"
                                >
                                    Transfer Gain Reference
                                </Button>
                            </Link>
                            <InstrumentCard />
                            <UpstreamVisitCard
                                sessid={parseInt(sessid ?? '0')}
                            />
                        </Stack>
                    </Flex>
                </Box>
            </Box>
        </div>
    )
}

export { Session }
