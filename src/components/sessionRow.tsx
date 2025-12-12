import {
  Box,
  Button,
  Card,
  Icon,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useQueryClient } from '@tanstack/react-query'
import { finaliseSession } from 'loaders/rsyncers'
import { deleteSessionData } from 'loaders/sessionClients'
import React from 'react'
import { GiMagicBroom } from 'react-icons/gi'
import { MdDelete } from 'react-icons/md'
import { MdSync, MdSyncProblem } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { components } from 'schema/main'

type Session = components['schemas']['Session']
type SessionRowProps = {
  session: Session
  instrumentName: string | null
  isActive: boolean
  isFinalising: boolean
}

export const SessionRow = ({
  session,
  instrumentName = null,
  isActive = false,
  isFinalising = false,
}: SessionRowProps) => {
  // Set up query client
  const queryClient = useQueryClient()

  // Set up navigate function
  const navigate = useNavigate()

  // Set up React states
  const [sessionFinalising, setSessionFinalising] = React.useState(isFinalising)

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

  // Set up animations for the sync icon
  const spin = keyframes`
    from { transform: translate(-50%, -50%) rotate(360deg); }
    to { transform: translate(-50%, -50%) rotate(0deg); }
  `
  const pulseGlow = keyframes`
    0% { filter: drop-shadow(0 0 2px ${isFinalising ? 'red' : 'green'}) }
    50% { filter: drop-shadow(0 0 0px ${isFinalising ? 'red' : 'green'}) }
    100% { filter: drop-shadow(0 0 2px ${isFinalising ? 'red' : 'green'}) }
  `

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="start"
        gap={2}
      >
        {/* Pop-ups when clicking on component buttons */}
        <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Confirm removing session {session.name} from list
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to continue? This action is not reversible
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCloseDelete}>
                Close
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  deleteSessionData(session.id).then(() => {
                    // Refetch session information after requesting deletion
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
              Are you sure you want to continue? This action is not reversible
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCloseCleanup}>
                Close
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  cleanupSession(session.id).then(() => {
                    // Refetch session information after requesting cleanup
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
        {/* Session card and buttons */}
        <Tooltip label={session.name}>
          {/* Card containing visit name, session ID, and sync status */}
          <Card
            key={session.id}
            _hover={{
              borderColor: 'murfey.500',
            }}
            cursor="pointer"
            bg={'murfey.400'}
            p={2}
            border="1px solid grey"
            borderRadius={5}
            onClick={() => {
              navigate(`../sessions/${session.id ?? 0}`)
            }}
          >
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              {/* Visit name and ID */}
              <Text mt={0.5} fontSize="sm" lineHeight={1}>
                {session.name}: {session.id}
              </Text>
              {/* Sync status */}
              <Box
                position="relative"
                boxSize={6}
                aspectRatio={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {isActive ? (
                  // Show a pulsing spinning sync icon when running
                  <Icon
                    as={MdSync}
                    boxSize="inherit"
                    color="black"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    sx={{
                      animation: `${spin} 2s linear infinite, ${pulseGlow} 2s ease-in-out infinite`,
                    }}
                  />
                ) : (
                  // Show a sync error icon when disconnected
                  <Icon
                    as={MdSyncProblem}
                    boxSize="inherit"
                    color="black"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                  />
                )}
              </Box>
            </Box>
          </Card>
        </Tooltip>
        <Tooltip label="Remove from list">
          <IconButton
            aria-label="Delete session"
            icon={<MdDelete />}
            onClick={onOpenDelete}
            isDisabled={isActive || sessionFinalising}
          />
        </Tooltip>
        <Tooltip label="Clean up visit files">
          <IconButton
            aria-label="Clean up session"
            icon={<GiMagicBroom />}
            onClick={onOpenCleanup}
            isDisabled={!isActive || sessionFinalising}
          />
        </Tooltip>
      </Box>
    </>
  )
}
