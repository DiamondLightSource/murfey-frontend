import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  IconButton,
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
  Stack,
  StackDivider,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import {
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [action, setAction] = React.useState('finalise')

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

  return (
    <Card
      width="100%"
      bg={rsyncer.alive ? 'murfey.400' : '#DF928E'}
      borderColor="murfey.300"
    >
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Confirm RSyncer {action}: {rsyncer.source}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to continue?</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => handleRsyncerAction()}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <CardHeader>
        <Flex>
          {' '}
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            {' '}
            <HStack spacing="3em">
              <Text>RSync Instance</Text>
              {rsyncer.transferring && <Spinner color="murfey.700" />}
              <Badge
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
            </HStack>
          </Flex>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Rsync control options"
              icon={<MdDensityMedium />}
            />
            <MenuList>
              {rsyncer.alive ? (
                <>
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
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase">
              Source
            </Heading>
            <Text pt="2" fontSize="sm">
              {rsyncer.source}
            </Text>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase">
              Destination
            </Heading>
            <Text pt="2" fontSize="sm">
              {rsyncer.destination ?? ''}
            </Text>
          </Box>
          <Box>
            <Stat>
              <StatLabel>Transfer progress</StatLabel>
              <StatNumber>
                {rsyncer.num_files_transferred} transferred
              </StatNumber>
              <StatNumber>{rsyncer.num_files_in_queue} queued</StatNumber>
              <StatNumber>{rsyncer.num_files_skipped} skipped</StatNumber>
              {rsyncer.analyser_alive ? (
                <StatNumber>
                  {rsyncer.num_files_to_analyse} to analyse
                </StatNumber>
              ) : (
                <></>
              )}
            </Stat>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}
