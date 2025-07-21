import {
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
import { sessionTokenCheck } from 'loaders/jwt'
import { finaliseSession } from 'loaders/rsyncers'
import { deleteSessionData } from 'loaders/sessionClients'
import React, { useEffect } from 'react'
import { GiMagicBroom } from 'react-icons/gi'
import { MdDelete } from 'react-icons/md'
import { Link as LinkRouter } from 'react-router-dom'
import { PuffLoader } from 'react-spinners'
import { components } from 'schema/main'

type Session = components['schemas']['Session']
export const SessionRow = (session: Session) => {
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
