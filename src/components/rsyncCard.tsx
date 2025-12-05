import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import {
  requestSymlinkCreation,
  pauseRsyncer,
  restartRsyncer,
  removeRsyncer,
  finaliseRsyncer,
  flushSkippedRsyncer,
} from 'loaders/rsyncers'
import React from 'react'
import { MdDensityMedium } from 'react-icons/md'
import { components } from 'schema/main'

type RSyncerInfo = components['schemas']['RSyncerInfo']

export const RsyncCard = ({ rsyncer }: { rsyncer: RSyncerInfo }) => {
  const destinationParent = rsyncer.destination
    .split('/')
    .slice(0, -2)
    .join('/')
  const destinationName = rsyncer.destination.split('/')[-1]
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenSymlink,
    onOpen: onOpenSymlink,
    onClose: onCloseSymlink,
  } = useDisclosure()
  const [action, setAction] = React.useState('finalise')
  const [symlinkPath, setSymlinkPath] = React.useState(destinationName)
  const [symlinkOverride, setSymlinkOverride] = React.useState(false)

  const finalise = () => {
    setAction('finalise')
    onOpen()
  }

  const remove = () => {
    setAction('remove')
    onOpen()
  }

  const handleRsyncerAction = async () => {
    if (action === 'finalise') {
      await finaliseRsyncer(rsyncer.session_id, rsyncer.source)
    } else if (action === 'remove') {
      await removeRsyncer(rsyncer.session_id, rsyncer.source)
    }
    onClose()
  }

  const handleCreateSymlink = async () => {
    requestSymlinkCreation(
      rsyncer.session_id,
      rsyncer.destination,
      destinationParent + '/' + symlinkPath,
      symlinkOverride
    )
    onOpenSymlink()
  }

  return (
    <Card
      width="100%"
      bg={rsyncer.alive ? 'murfey.400' : '#DF928E'}
      borderColor="murfey.300"
      _hover={{
        borderColor: 'murfey.500',
      }}
      p={4}
    >
      {/* Pop-up components */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Confirm RSyncer {action}: {rsyncer.source}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to continue?</ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="default" onClick={() => handleRsyncerAction()}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenSymlink} onClose={onCloseSymlink}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Symlink to {rsyncer.destination}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            This will create a symlink to {rsyncer.destination} on the file
            system
            <Input
              value={symlinkPath}
              autoFocus
              w="80%"
              onChange={(v) => setSymlinkPath(v.target.value)}
            />
            <Checkbox
              isChecked={symlinkOverride}
              onChange={(e) => setSymlinkOverride(e.target.checked)}
            >
              Replace any existing symlink with this name?
            </Checkbox>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseSymlink}>
              Close
            </Button>
            <Button variant="default" onClick={() => handleCreateSymlink()}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Box containing card contents */}
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="start"
        justifyContent="start"
        gap={4}
      >
        {/* Title bar of RSync card */}
        <Box
          w="100%"
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap={4}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="start"
            gap={4}
          >
            <Heading fontSize="md" fontWeight="bold" lineHeight={1} mt={0.5}>
              RSync Instance
            </Heading>
            <Badge
              p={1}
              lineHeight={1}
              mt={0.5}
              colorScheme={
                rsyncer.tag === 'fractions'
                  ? 'green'
                  : rsyncer.tag === 'metadata'
                    ? 'purple'
                    : rsyncer.tag === 'atlas'
                      ? 'yellow'
                      : 'red'
              }
            >
              {rsyncer.tag}
            </Badge>
            <Box
              mx={1}
              boxSize={8}
              aspectRatio={1}
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {rsyncer.transferring && rsyncer.alive ? (
                <Spinner boxSize="inherit" color="murfey.700" />
              ) : (
                <></>
              )}
            </Box>
          </Box>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Rsync control options"
              icon={<MdDensityMedium />}
            />
            <MenuList>
              {rsyncer.alive ? (
                <>
                  <MenuItem onClick={() => onOpenSymlink()}>
                    Create symlink
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      pauseRsyncer(rsyncer.session_id, rsyncer.source)
                    }
                    isDisabled={rsyncer.stopping}
                  >
                    Pause
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      flushSkippedRsyncer(rsyncer.session_id, rsyncer.source)
                    }
                    isDisabled={rsyncer.stopping}
                  >
                    Flush skipped files
                  </MenuItem>
                  <MenuItem
                    onClick={() => remove()}
                    isDisabled={rsyncer.stopping}
                  >
                    Stop rsync (cannot be resumed)
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      finalise()
                    }}
                    isDisabled={rsyncer.stopping}
                  >
                    Remove all source files and stop
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem
                    onClick={() =>
                      restartRsyncer(rsyncer.session_id, rsyncer.source)
                    }
                  >
                    Start
                  </MenuItem>
                  <MenuItem onClick={() => remove()}>Remove</MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </Box>
        {/* Contents of RSync card */}
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="start"
          justifyContent="start"
          gap={2}
        >
          {/* Source */}
          <Heading
            pt={2}
            fontSize="sm"
            textTransform="uppercase"
            lineHeight={1}
          >
            Source
          </Heading>
          <Text fontSize="sm" lineHeight={1} overflowWrap="anywhere">
            {rsyncer.source}
          </Text>
          <Divider borderColor="murfey.300" />
          {/* Destination */}
          <Heading
            pt={2}
            fontSize="sm"
            textTransform="uppercase"
            lineHeight={1}
          >
            Destination
          </Heading>
          <Text fontSize="sm" lineHeight={1} overflowWrap="anywhere">
            {rsyncer.destination ?? ''}
          </Text>
          <Divider borderColor="murfey.300" />
          {/* Transfer progress */}
          <Heading
            pt={2}
            fontSize="sm"
            textTransform="uppercase"
            lineHeight={1}
          >
            Transfer progress
          </Heading>
          <Text fontSize="xl" fontWeight="bold" lineHeight={1}>
            {rsyncer.num_files_transferred} transferred
          </Text>
          <Text fontSize="xl" fontWeight="bold" lineHeight={1}>
            {rsyncer.num_files_in_queue} queued
          </Text>
          <Text fontSize="xl" fontWeight="bold" lineHeight={1}>
            {rsyncer.num_files_skipped} skipped
          </Text>
          {rsyncer.analyser_alive ? (
            <Text fontSize="xl" fontWeight="bold" lineHeight={1}>
              {rsyncer.num_files_to_analyse} to analyse
            </Text>
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </Card>
  )
}
