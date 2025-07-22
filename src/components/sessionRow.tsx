import {
  Box,
  Button,
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
import { useQueryClient } from '@tanstack/react-query'
import { sessionTokenCheck } from 'loaders/jwt'
import { finaliseSession } from 'loaders/rsyncers'
import { deleteSessionData } from 'loaders/sessionClients'
import { checkMultigridControllerStatus } from 'loaders/sessionSetup'
import React, { useEffect } from 'react'
import { GiMagicBroom } from 'react-icons/gi'
import { MdDelete } from 'react-icons/md'
import { Link as LinkRouter } from 'react-router-dom'
import { PuffLoader } from 'react-spinners'
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
    onCloseCleanup()
  }

  useEffect(() => {
    sessionTokenCheck(session.id).then((active) => setSessionActive(active))
    checkMultigridControllerStatus(session.id.toString()).then((status) =>
      setSessionFinalising(status.finalising)
    )
  }, [session])

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
                          // Refetch session information for this instrument
                          queryClient.refetchQueries({
                            queryKey: ['homepageSessions', instrumentName],
                          })
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
                        <PuffLoader
                          size={25}
                          color={sessionFinalising ? 'red' : 'green'}
                        />
                      ) : (
                        // Replace PuffLoader with inactive grey circle
                        // when session is disconnected
                        <Box
                          boxSize="25px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Box
                            boxSize="12px"
                            bg="gray.800"
                            borderRadius="full"
                          />
                        </Box>
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
