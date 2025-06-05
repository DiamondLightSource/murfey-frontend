import {
    Box,
    Button,
    Heading,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    VStack
} from '@chakra-ui/react'

import { useDisclosure } from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { SetupStepper } from 'components/setupStepper'
import { sessionHandshake, sessionTokenCheck } from 'loaders/jwt'
import { getMachineConfigData } from 'loaders/machineConfig'
import { createSession, getSessionDataForVisit } from 'loaders/session_clients'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { Link as LinkRouter, useLoaderData, useNavigate } from 'react-router-dom'
import { components } from 'schema/main'

type Visit = components['schemas']['Visit']
type MachineConfig = components['schemas']['MachineConfig']
type Session = components['schemas']['Session']

const NewSession = () => {
    const currentVisits = useLoaderData() as Visit[] | []
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
        isOpen: isOpenVisitCheck,
        onOpen: onOpenVisitCheck,
        onClose: onCloseVisitCheck,
    } = useDisclosure()
    const [selectedVisit, setSelectedVisit] = useState<string>('')
    const [sessionReference, setSessionReference] = useState<string>('')
    const [activeSessionsForVisit, setActiveSessionsForVisit] = useState<
        (Session | null)[]
    >([])
    const [gainRefDir, setGainRefDir] = useState<string | null>()
    const [acqusitionSoftwares, setAcquistionSoftwares] = useState<
        string[]
    >([])
    const navigate = useNavigate()

    const handleMachineConfig = (mcfg: MachineConfig) => {
        setGainRefDir(mcfg.gain_reference_directory)
        setAcquistionSoftwares(mcfg.acquisition_software)
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

    const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
        setSessionReference(event.target.value)

    const handleVisitNameChange = (
        event: ChangeEvent<HTMLInputElement>
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
            const path = gainRefDir ? `../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true` : `/new_session/setup/${sid}`
            navigate(path)
        } else onOpenVisitCheck()
    }

    if (!instrumentName) {
        return <Heading size='l' >No instrument name is known</Heading>
    }

    return instrumentName ? (
        <div className="rootContainer">
            <CreateSessionModal
                isOpen={isOpen}
                onClose={onClose}
                handleVisitNameChange={handleVisitNameChange}
                sessionReference={sessionReference}
                handleChange={handleChange}
                selectedVisit={selectedVisit}
                handleCreateSession={handleCreateSession}
                instrumentName={instrumentName}
            />
            <EditSessionModal
                isOpenVisitCheck={isOpenVisitCheck}
                onCloseVisitCheck={onCloseVisitCheck}
                activeSessionsForVisit={activeSessionsForVisit}
                selectedVisit={selectedVisit}
                startMurfeySession={startMurfeySession}
                instrumentName={instrumentName}
                gainRefDir={gainRefDir}
                navigateCallback={navigate}
            />

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
                            isDisabled={selectedVisit === ''}
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

type EditSessionModalProps = {
    isOpenVisitCheck: boolean
    onCloseVisitCheck: () => void
    activeSessionsForVisit: (Session | null)[]
    selectedVisit: string
    startMurfeySession: (iName: string) => Promise<any>
    instrumentName: string
    gainRefDir: string | null | undefined,
    navigateCallback: (url: string) => void
}

function EditSessionModal({ isOpenVisitCheck, onCloseVisitCheck, activeSessionsForVisit, selectedVisit, instrumentName, startMurfeySession, navigateCallback, gainRefDir }: EditSessionModalProps) {
    return <Modal isOpen={isOpenVisitCheck} onClose={onCloseVisitCheck}>
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
                            <Heading size='l'>No sessions available</Heading>
                        )
                    })}
                </VStack>
            </ModalBody>
            <ModalFooter>
                <Button
                    isDisabled={selectedVisit === ''}
                    onClick={() => {
                        startMurfeySession(instrumentName).then(
                            (sid: number) => {
                                const path = gainRefDir ? `../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true` : `/new_session/setup/${sid}`
                                navigateCallback(path)
                            }
                        )
                    }}
                >
                    Ignore and continue
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}

type CreateSessionModalProps = {
    isOpen: boolean
    onClose: () => void
    handleVisitNameChange: (event: ChangeEvent<HTMLInputElement>) => void
    sessionReference: string
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void
    selectedVisit: string
    handleCreateSession: (iName: string) => Promise<void>
    instrumentName: string
}

function CreateSessionModal({ isOpen, onClose, handleVisitNameChange, sessionReference, handleChange, handleCreateSession, instrumentName, selectedVisit }: CreateSessionModalProps) {
    return <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Create visit</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Input
                    placeholder="Session name"
                    onChange={handleVisitNameChange} />
                <Input
                    placeholder="Session reference"
                    value={sessionReference}
                    onChange={handleChange} />
            </ModalBody>
            <ModalFooter>
                <Button
                    isDisabled={selectedVisit === ''}
                    onClick={() => {
                        handleCreateSession(instrumentName)
                    }}
                >
                    Create session
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
}

