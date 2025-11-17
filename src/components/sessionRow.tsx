import {
  Box,
  Button,
  GridItem,
  Heading,
  HStack,
  Icon,
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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getInstrumentConnectionStatus } from 'loaders/general'
import { sessionTokenCheck } from 'loaders/jwt'
import { finaliseSession } from 'loaders/rsyncers'
import { deleteSessionData } from 'loaders/sessionClients'
import { checkMultigridControllerStatus } from 'loaders/sessionSetup'
import React, { useEffect } from 'react'
import { GiMagicBroom } from 'react-icons/gi'
import { MdDelete } from 'react-icons/md'
import { MdSync, MdSyncProblem } from 'react-icons/md'
import { Link as LinkRouter } from 'react-router-dom'
import { components } from 'schema/main'

type Session = components['schemas']['Session']
type SessionRowProps = {
  session: Session
  instrumentName: string | null
}
export const SessionRow = ({
  session,
  instrumentName = null,
}: SessionRowProps) => {
  // Set up query client
  const queryClient = useQueryClient()

  // Set up React states
  const [sessionActive, setSessionActive] = React.useState(false)
  const [sessionFinalising, setSessionFinalising] = React.useState(false)
  const [instrumentServerConnected, setInstrumentServerConnected] =
    React.useState(false)

  // Set up utility hooks
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
    const response = await finaliseSession(sessid)
    if (response.success) {
      setSessionFinalising(true)
    }
    console.log(`Session ${sessid} marked for cleanup`)
  }

  // Query for probing instrument connection status
  const { data: instrmentServerConnectionStatus } = useQuery<boolean>({
    queryKey: ['instrumentServerConnection', instrumentName],
    queryFn: () => getInstrumentConnectionStatus(),
    enabled: !!instrumentName,
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

  // Run checks on the state of the session if there is
  // a change in instrument server connection status
  useEffect(() => {
    sessionTokenCheck(session.id).then((active) => setSessionActive(active))
    checkMultigridControllerStatus(session.id.toString()).then((status) => {
      setSessionFinalising(status.finalising)
      console.log(`Session ${session.id} finalising:`, status.finalising)
    })
  }, [session, instrumentServerConnected])

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
                    <Button variant="ghost" mr={3} onClick={onCloseDelete}>
                      Close
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        deleteSessionData(session.id).then(() => {
                          // Refetch session information for this instrument
                          queryClient.refetchQueries({
                            queryKey: ['homepageSessions', instrumentName],
                          })
                        })
                        onCloseDelete()
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
                    <Button variant="ghost" mr={3} onClick={onCloseCleanup}>
                      Close
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => {
                        cleanupSession(session.id).then(() => {
                          queryClient.refetchQueries({
                            queryKey: ['homepageSessions', instrumentName],
                          })
                        })
                        onCloseCleanup()
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
                      <Box
                        boxSize="25px"
                        position="relative"
                        overflow="visible"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {sessionActive ? (
                          // Show a pulsing spinning sync icon when running
                          <Icon
                            as={MdSync}
                            boxSize={4}
                            color="black"
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            sx={{
                              animation: `spin 2s linear infinite, glow-${session.id} 2s ease-in-out infinite`,
                              filter: `drop-shadow(0 0 0px ${sessionFinalising ? 'red' : 'green'})`,
                              '@keyframes spin': {
                                from: {
                                  transform:
                                    'translate(-50%, -50%) rotate(360deg)',
                                },
                                to: {
                                  transform:
                                    'translate(-50%, -50%) rotate(0deg)',
                                },
                              },
                              [`@keyframes glow-${session.id}`]: {
                                '0%': {
                                  filter: `drop-shadow(0 0 2px ${sessionFinalising ? 'red' : 'green'})`,
                                },
                                '50%': {
                                  filter: `drop-shadow(0 0 0px ${sessionFinalising ? 'red' : 'green'})`,
                                },
                                '100%': {
                                  filter: `drop-shadow(0 0 2px ${sessionFinalising ? 'red' : 'green'})`,
                                },
                              },
                            }}
                          />
                        ) : (
                          // Show a sync error icon when disconnected
                          <Icon
                            as={MdSyncProblem}
                            boxSize={4}
                            color="black"
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                          />
                        )}
                      </Box>
                    </HStack>
                  </Stat>
                </Link>
              </Tooltip>
              <Tooltip label="Remove from list">
                <IconButton
                  aria-label="Delete session"
                  icon={<MdDelete />}
                  onClick={onOpenDelete}
                  isDisabled={sessionActive || sessionFinalising}
                />
              </Tooltip>
              <Tooltip label="Clean up visit files">
                <IconButton
                  aria-label="Clean up session"
                  icon={<GiMagicBroom />}
                  onClick={onOpenCleanup}
                  isDisabled={!sessionActive || sessionFinalising}
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
