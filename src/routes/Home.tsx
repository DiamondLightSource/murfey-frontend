import {
  Box,
  Button,
  Divider,
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
  Stack,
  Stat,
  StatLabel,
  Tooltip,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { InstrumentCard } from 'components/instrumentCard'
import { sessionTokenCheck } from 'loaders/jwt'
import { finaliseSession } from 'loaders/rsyncers'
import { deleteSessionData } from 'loaders/sessionClients'
import React, { useEffect } from 'react'
import { GiMagicBroom } from 'react-icons/gi'
import { MdDelete } from 'react-icons/md'
import {
  Link as LinkRouter,
  useLoaderData,
  useSearchParams,
  useNavigate,
} from 'react-router-dom'
import { PuffLoader } from 'react-spinners'
import useWebSocket from 'react-use-websocket'
import { components } from 'schema/main'
import { v4 as uuid4 } from 'uuid'

type Session = components['schemas']['Session']
const SessionRow = (session: Session) => {
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure()
  const {
    isOpen: isOpenCleanup,
    onOpen: onOpenCleanup,
    onClose: onCloseCleanup,
  } = useDisclosure()

  const cleanupSession = async (sessid: number) => {
    await finaliseSession(sessid)
    onCloseCleanup()
  }

  const [sessionActive, setSessionActive] = React.useState(false)

  useEffect(() => {
    sessionTokenCheck(session.id).then((active) => setSessionActive(active))
  }, [])

  return (
    <VStack w="100%" spacing={0}>
      <Stack w="100%" spacing={5} py="0.8em">
        {session ? (
          <>
            <HStack>
              <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    Confirm removing session {session.name} from list
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    Are you sure you want to continue? This action is not
                    reversible
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onCloseDelete}>
                      Close
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        deleteSessionData(session.id).then(() =>
                          window.location.reload()
                        )
                      }}
                    >
                      Confirm
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Modal isOpen={isOpenCleanup} onClose={onCloseCleanup}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    Confirm removing files for session {session.name}
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    Are you sure you want to continue? This action is not
                    reversible
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onCloseCleanup}>
                      Close
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        cleanupSession(session.id)
                      }}
                    >
                      Confirm
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
              <Tooltip label={session.name}>
                <Link
                  key={session.id}
                  _hover={{ textDecor: 'none' }}
                  as={LinkRouter}
                  display={'flex'}
                  to={`../sessions/${session.id ?? 0}`}
                >
                  <Stat
                    _hover={{
                      borderColor: 'murfey.400',
                    }}
                    bg={'murfey.400'}
                    overflow="auto"
                    w="calc(100%)"
                    p={2}
                    border="1px solid grey"
                    borderRadius={5}
                    display={'flex'}
                  >
                    <HStack>
                      <StatLabel
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                        overflow="hidden"
                      >
                        {session.name}: {session.id}
                      </StatLabel>
                      {sessionActive ? (
                        <PuffLoader size={25} color="red" />
                      ) : (
                        <></>
                      )}
                    </HStack>
                  </Stat>
                </Link>
              </Tooltip>
              <Tooltip label="Remove from list">
                <IconButton
                  aria-label="Delete session"
                  icon={<MdDelete />}
                  onClick={onOpenDelete}
                  isDisabled={sessionActive}
                />
              </Tooltip>
              <Tooltip label="Clean up visit files">
                <IconButton
                  aria-label="Clean up session"
                  icon={<GiMagicBroom />}
                  onClick={onOpenCleanup}
                  isDisabled={!sessionActive}
                />
              </Tooltip>
            </HStack>
          </>
        ) : (
          <GridItem colSpan={5}>
            <Heading textAlign="center" py={4} variant="notFound">
              None Found
            </Heading>
          </GridItem>
        )}
      </Stack>
    </VStack>
  )
}

export const Home = () => {
  // Get session data from the loader
  const sessions = useLoaderData() as {
    current: Session[]
  } | null

  // Clean the URL after loading the page
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  useEffect(() => {
    if (searchParams.has('instrumentName')) {
      navigate('/home', { replace: true })
    }
  }, [searchParams, navigate])

  const [UUID, setUUID] = React.useState('')
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
              <Heading pt="2vh" color="murfey.50" fontWeight="200" size="md">
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
              <VStack mt="0 !important" w="100%" px="10vw" display="flex">
                <Heading textAlign="left" w="100%" size="lg">
                  {'Existing Sessions'}
                </Heading>
                <Divider borderColor="murfey.300" />
                {sessions && sessions.current.length > 0 ? (
                  sessions.current.map((current) => {
                    return (
                      <VStack w="100%" spacing={5}>
                        {SessionRow(current)}
                      </VStack>
                    )
                  })
                ) : (
                  <VStack w="100%">
                    <Heading w="100%" py={4} variant="notFound">
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
