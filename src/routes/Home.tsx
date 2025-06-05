import {
    Box,
    Button,
    Divider,
    Heading,
    HStack,
    Link,
    VStack
} from '@chakra-ui/react'

import { InstrumentCard } from 'components/instrumentCard'
import { Link as LinkRouter, useLoaderData } from 'react-router-dom'
import useWebSocket, { Options } from 'react-use-websocket'
import { v4 as uuid4 } from 'uuid'

import { useEffect, useState } from 'react'
import { Session } from "utils/types"
import { SessionRow } from 'components/SessionRow'

const Home = () => {
    const sessions = useLoaderData() as {
        current: Session[]
    } | null
    const [UUID, setUUID] = useState('')
    const baseUrl =
        sessionStorage.getItem('murfeyServerURL') ??
        process.env.REACT_APP_API_ENDPOINT
    const url = baseUrl ? baseUrl.replace('http', 'ws') : 'ws://localhost:8000'

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
    }

    // Use existing UUID if present; otherwise, generate a new UUID
    useEffect(() => {
        if (!UUID) {
            setUUID(uuid4())
        }
    }, [UUID])

    // 'null' is passed to 'useWebSocket()' if UUID is not yet set to
    // prevent malformed connections
    const wsUrl = UUID ? `${url}ws/connect/${UUID}` : null
    const wsOptions: Options | undefined = UUID
        ? {
            onOpen: () => {
                console.log('WebSocket connection established.')
            },
            onMessage: (event) => {
                parseWebsocketMessage(event.data)
            },
        }
        : undefined

    // Establish websocket connection to the backend
    useWebSocket(wsUrl, wsOptions)

    return (
        <div className="rootContainer">
            <title>Murfey</title>
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
                                Murfey Sessions
                            </Heading>
                            <Heading
                                pt="2vh"
                                color="murfey.50"
                                fontWeight="200"
                                size="md"
                            >
                                Microscope Data Transfer Control System
                            </Heading>
                            <Link
                                w={{ base: '100%', md: '19.6%' }}
                                _hover={{ textDecor: 'none' }}
                                as={LinkRouter}
                                to={`../instruments/${sessionStorage.getItem('instrumentName')}/new_session`}
                            >
                                <Button variant="onBlue">New session</Button>
                            </Link>
                        </VStack>

                        <HStack w="100%" display="flex" px="10vw">
                            <VStack
                                mt="0 !important"
                                w="100%"
                                px="10vw"
                                display="flex"
                            >
                                <Heading textAlign="left" w="100%" size="lg">
                                    {'Existing Sessions'}
                                </Heading>
                                <Divider borderColor="murfey.300" />
                                {sessions && sessions.current.length > 0 ? (
                                    sessions.current.map((current) => {
                                        return (
                                            <VStack w="100%" spacing={5}>
                                                <SessionRow id={current.id} name={current.name} visit_end_time={current.visit_end_time} />
                                            </VStack>
                                        )
                                    })
                                ) : (
                                    <VStack w="100%">
                                        <Heading
                                            w="100%"
                                            py={4}
                                            variant="notFound"
                                        >
                                            No sessions found
                                        </Heading>
                                    </VStack>
                                )}
                            </VStack>
                            <InstrumentCard />
                        </HStack>
                    </VStack>
                </Box>
            </Box>
        </div>
    )
}

export { Home }
