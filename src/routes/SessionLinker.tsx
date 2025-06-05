import {
    Box,
    Divider,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Link,
    Stack,
    Stat,
    StatLabel,
    VStack
} from '@chakra-ui/react'

import { linkSessionToClient } from 'loaders/session_clients'
import React from 'react'
import { MdLink } from 'react-icons/md'
import { Link as LinkRouter, useLoaderData, useSearchParams } from 'react-router-dom'
import { components } from 'schema/main'

type Client = components['schemas']['ClientEnvironment']

const SessionLinker = () => {
    const existingClients = useLoaderData() as Client[] | null
    let [searchParams, setSearchParams] = useSearchParams()
    const [sessionId, setSessionId] = React.useState(0)

    return (
        <div className="rootContainer">
            <Box mt="-1em" mx="-7.3vw" bg="murfey.50" flex="1 0 auto">
                <Box w="100%" overflow="hidden">
                    <VStack className="homeRoot">
                        <VStack
                            bg="murfey.700"
                            justifyContent="start"
                            alignItems="start"
                        >
                            <Heading size="xl" color="murfey.50">
                                Connect new session to client
                            </Heading>
                        </VStack>
                    </VStack>
                </Box>
                <Box
                    mt="1em"
                    w="95%"
                    justifyContent={'center'}
                    alignItems={'center'}
                    display={'flex'}
                ></Box>
                <Box
                    mt="1em"
                    w="95%"
                    justifyContent={'center'}
                    alignItems={'center'}
                    display={'flex'}
                >
                    <VStack
                        mt="0 !important"
                        w="100%"
                        px="10vw"
                        justifyContent="start"
                        alignItems="start"
                    >
                        <VStack w="100%" spacing={0}>
                            <Heading textAlign="left" w="100%" size="lg">
                                Existing Clients
                            </Heading>
                            <Divider borderColor="murfey.300" />
                            <Stack w="100%" spacing={5} py="0.8em">
                                {existingClients && existingClients.length > 0
                                    ? existingClients.map((client) => <ClientCard
                                        clientId={client.client_id!}
                                        sessionId={sessionId}
                                        searchParams={searchParams}
                                        setSessionId={setSessionId}
                                    />
                                    )
                                    : <GridItem colSpan={5}>
                                        <Heading
                                            textAlign="center"
                                            py={4}
                                            variant="notFound"
                                        >
                                            No Clients Found
                                        </Heading>
                                    </GridItem>
                                }
                            </Stack>
                        </VStack>
                    </VStack>
                </Box>
            </Box>
        </div>
    )
}

export { SessionLinker }

type ClientCardProps = {
    clientId: number
    sessionId: number
    searchParams: URLSearchParams
    setSessionId: React.Dispatch<React.SetStateAction<number>>
}

function ClientCard({ clientId, sessionId, searchParams, setSessionId }: ClientCardProps) {
    return <>
        <HStack>
            <Stat
                _hover={{
                    borderColor: 'murfey.400',
                }}
                bg="murfey.400"
                overflow="hidden"
                w="calc(100%)"
                p={2}
                border="1px solid grey"
                borderRadius={5}
            >
                <StatLabel
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                >
                    Client {clientId}
                </StatLabel>
            </Stat>
            <Link
                w={{
                    base: '100%',
                    md: '19.6%',
                }}
                key={sessionId}
                _hover={{
                    textDecor: 'none',
                }}
                as={LinkRouter}
                to={`../session/${sessionId}`}
            >
                <IconButton
                    aria-label="Connect to client"
                    icon={<MdLink />}
                    onClick={() => {
                        const sessionName = searchParams.get('session_name') ?? 'Client connection'
                        linkSessionToClient(clientId, sessionName
                        ).then(
                            (sid) => {
                                console.log(sid)
                                setSessionId(sid)
                                console.log(sessionId)
                            }
                        )
                    }} />
            </Link>
        </HStack>
    </>
}

