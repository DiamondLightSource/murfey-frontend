import {
    Box,
    Button,
    Divider,
    GridItem,
    Input,
    Heading,
    HStack,
    Link,
    Stack,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalFooter,
    ModalCloseButton,
    ModalBody,
} from '@chakra-ui/react'

import { useDisclosure } from '@chakra-ui/react'
import { Link as LinkRouter, useLoaderData, useParams } from 'react-router-dom'
import { components } from 'schema/main'
import { SetupStepper } from 'components/setupStepper'
import { Table } from '@diamondlightsource/ui-components'
import { createSession, getSessionDataForVisit } from 'loaders/session_clients'
import { sessionTokenCheck, sessionHandshake } from 'loaders/jwt'
import { useNavigate } from 'react-router-dom'
import React, { ChangeEventHandler, useEffect } from 'react'
import { getMachineConfigData } from 'loaders/machineConfig'

type Visit = components['schemas']['Visit']
type MachineConfig = components['schemas']['MachineConfig']
type Session = components['schemas']['Session']

const NewSession = () => {
    const currentVisits = useLoaderData() as Visit[] | null
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
        isOpen: isOpenVisitCheck,
        onOpen: onOpenVisitCheck,
        onClose: onCloseVisitCheck,
    } = useDisclosure()
    const [selectedVisit, setSelectedVisit] = React.useState('')
    const [sessionReference, setSessionReference] = React.useState('')
    const [activeSessionsForVisit, setActiveSessionsForVisit] = React.useState<
        (Session | null)[]
    >([])
    const [gainRefDir, setGainRefDir] = React.useState<string | null>()
    const [acqusitionSoftware, setAcquistionSoftware] = React.useState<
        string[]
    >([])
    const navigate = useNavigate()

    const handleMachineConfig = (mcfg: MachineConfig) => {
        setGainRefDir(mcfg.gain_reference_directory)
        setAcquistionSoftware(mcfg.acquisition_software)
    }

    const instrumentName = sessionStorage.getItem('instrumentName')

    const alreadyActiveSessions = async () => {
        const sessionsToCheck: Session[] = await getSessionDataForVisit(
            selectedVisit,
            instrumentName ?? ''
        )
        return Promise.all(
            sessionsToCheck.map(async (session) => {
                return (await sessionTokenCheck(session.id)) ? session : null
            })
        )
    }

    useEffect(() => {
        getMachineConfigData().then((mcfg) => handleMachineConfig(mcfg))
    }, [])
    useEffect(() => {
        alreadyActiveSessions().then((sessions) =>
            setActiveSessionsForVisit(sessions)
        )
    }, [selectedVisit])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
        setSessionReference(event.target.value)

    const handleVisitNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSelectedVisit(event.target.value)
        setSessionReference(event.target.value)
    }

    function selectVisit(data: Record<string, any>, index: number) {
        setSelectedVisit(data.name)
        setSessionReference(data.name)
    }

    const startMurfeySession = async (iName: string) => {
        const sid = await createSession(selectedVisit, sessionReference, iName)
        await sessionHandshake(sid)
        return sid
    }

    const handleCreateSession = async (iName: string) => {
        if (
            !activeSessionsForVisit.length ||
            activeSessionsForVisit.every((elem) => {
                return elem === null
            })
        ) {
            const sid = await startMurfeySession(iName)
            gainRefDir
                ? navigate(
                      `../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true`
                  )
                : navigate(`/new_session/setup/${sid}`)
        } else onOpenVisitCheck()
    }

    return instrumentName ? (
        <div className="rootContainer">
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create visit</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input
                            placeholder="Session name"
                            onChange={handleVisitNameChange}
                        />
                        <Input
                            placeholder="Session reference"
                            value={sessionReference}
                            onChange={handleChange}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            isDisabled={selectedVisit === '' ? true : false}
                            onClick={() => {
                                handleCreateSession(instrumentName)
                            }}
                        >
                            Create session
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenVisitCheck} onClose={onCloseVisitCheck}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        An active session already exists for this visit
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        You may want to edit one of the following sessions
                        instead (otherwise you may start multiple transfers for
                        the same source)
                        <VStack>
                            {activeSessionsForVisit.map((session) => {
                                return session ? (
                                    <Link
                                        w={{ base: '100%', md: '19.6%' }}
                                        key="gain_ref"
                                        _hover={{ textDecor: 'none' }}
                                        as={LinkRouter}
                                        to={`/sessions/${session.id}`}
                                    >
                                        <Button>{session.id}</Button>
                                    </Link>
                                ) : (
                                    <></>
                                )
                            })}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            isDisabled={selectedVisit === '' ? true : false}
                            onClick={() => {
                                startMurfeySession(instrumentName).then(
                                    (sid: number) => {
                                        gainRefDir
                                            ? navigate(
                                                  `../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true`
                                              )
                                            : navigate(
                                                  `/new_session/setup/${sid}`
                                              )
                                    }
                                )
                            }}
                        >
                            Ignore and continue
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
                                Current visits
                            </Heading>
                            <Button variant="onBlue" onClick={() => onOpen()}>
                                Create visit
                            </Button>
                        </VStack>
                    </VStack>
                </Box>
                <Box
                    mt="1em"
                    px="10vw"
                    w="100%"
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <SetupStepper activeStepIndex={0} />
                </Box>
                <Box
                    mt="1em"
                    w="100%"
                    justifyContent={'center'}
                    alignItems={'center'}
                    display={'flex'}
                >
                    <Table
                        data={currentVisits}
                        headers={[
                            { key: 'name', label: 'Name' },
                            { key: 'start', label: 'Start Time' },
                            { key: 'end', label: 'End Time' },
                            { key: 'proposal_title', label: 'Description' },
                        ]}
                        label={'visitData'}
                        onClick={selectVisit}
                    />
                </Box>
                <Box
                    mt="1em"
                    w="100%"
                    justifyContent={'center'}
                    alignItems={'center'}
                    display={'flex'}
                >
                    <Stack>
                        <Input
                            placeholder="Session reference"
                            value={sessionReference}
                            onChange={handleChange}
                        />
                        <Button
                            isDisabled={selectedVisit === '' ? true : false}
                            onClick={() => {
                                handleCreateSession(instrumentName)
                            }}
                        >
                            Create session for visit {selectedVisit}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </div>
    ) : (
        <></>
    )
}

export { NewSession }
