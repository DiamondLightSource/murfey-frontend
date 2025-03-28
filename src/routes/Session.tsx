import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  Flex,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
  Link,
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
  Select,
  Spacer,
  Spinner,
  Stack,
  StackDivider,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Switch,
  Text,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";

import { useDisclosure } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

import { v4 as uuid4 } from "uuid";
import { Link as LinkRouter, useLoaderData, useParams } from "react-router-dom";
import {
  MdCheck,
  MdDensityMedium,
  MdFileUpload,
  MdOutlineWarning,
  MdOutlineGridOn,
  MdPause,
} from "react-icons/md";
import { FiActivity } from "react-icons/fi";
import { components } from "schema/main";
import { getInstrumentName } from "loaders/general";
import { getMachineConfigData } from "loaders/machineConfig";
import { pauseRsyncer, restartRsyncer, removeRsyncer, finaliseRsyncer } from "loaders/rsyncers";
import { getSessionData } from "loaders/session_clients";
import { sessionTokenCheck, sessionHandshake } from "loaders/jwt";
import { startMultigridWatcher } from "loaders/multigridSetup";
import { InstrumentCard } from "components/instrumentCard";
import { UpstreamVisitCard } from "components/upstreamVisitsCard";
import useWebSocket from "react-use-websocket";

import React, { useEffect } from "react";

type RSyncerInfo = components["schemas"]["RSyncerInfo"];
type Session = components["schemas"]["Session"];
type MachineConfig = components["schemas"]["MachineConfig"];
type MultigridWatcherSpec = components["schemas"]["MultigridWatcherSetup"];


const RsyncCard = (rsyncer: RSyncerInfo) => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [action, setAction] = React.useState("finalise");

  const finalise = () => {
    setAction("finalise");
    onOpen();
  }

  const remove = () => {
    setAction("remove");
    onOpen();
  }

  const handleRsyncerAction = async () => {
    if(action === "finalise")
      await finaliseRsyncer(rsyncer.session_id, rsyncer.source);
    else if(action === "remove")
      await removeRsyncer(rsyncer.session_id, rsyncer.source);
    onClose();
  }



  return (
    
    <Card width="100%" bg={rsyncer.alive ? "murfey.400": "#DF928E"} borderColor="murfey.300">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm RSyncer {action}: {rsyncer.source}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to continue?</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => handleRsyncerAction()}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <CardHeader>
        <Flex>
          {" "}
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            {" "}
            <HStack spacing="3em">
              <Text>RSync Instance</Text>
              {rsyncer.transferring && <Spinner color="murfey.700" />}
              <Badge
                colorScheme={
                  rsyncer.tag === "fractions"
                    ? "green"
                    : rsyncer.tag === "metadata"
                      ? "purple"
                      : rsyncer.tag === "atlas"
                        ? "yellow"
                        : "red"
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
              {
              !rsyncer.stopping ? (
              <>
              <MenuItem
                onClick={() => pauseRsyncer(rsyncer.session_id, rsyncer.source)}
                isDisabled={rsyncer.stopping}
              >
                Pause
              </MenuItem>
              <MenuItem
                onClick={() => remove()}
                isDisabled={rsyncer.stopping}
              >
                Remove
              </MenuItem>
              <MenuItem
                onClick={() => {finalise()}}
                isDisabled={rsyncer.stopping}
              >
                Finalise
              </MenuItem>
              </>
              ): 
              <>
              <MenuItem onClick={() => restartRsyncer(rsyncer.session_id, rsyncer.source)}>
                Start
              </MenuItem>
              <MenuItem
                onClick={() => remove()}
              >
                Remove
              </MenuItem>
              </>
            }
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
              {rsyncer.destination ?? ""}
            </Text>
          </Box>
          <Box>
            <Stat>
              <StatLabel>Transfer progress</StatLabel>
              <StatNumber>
                {rsyncer.num_files_transferred} transferred 
              </StatNumber>
              <StatNumber>
                {rsyncer.num_files_in_queue} queued
              </StatNumber>
            </Stat>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};

const getUrl = (endpoint: string) => {
  return (sessionStorage.getItem("murfeyServerURL") ?? process.env.REACT_APP_API_ENDPOINT) + endpoint;
};


const Session = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenReconnect, onOpen: onOpenReconnect, onClose: onCloseReconnect } = useDisclosure();
  const rsync = useLoaderData() as RSyncerInfo[] | null;
  const { sessid } = useParams();
  const [UUID, setUUID] = React.useState("");
  const [instrumentName, setInstrumentName] = React.useState("");
  const [machineConfig, setMachineConfig] = React.useState<MachineConfig>();
  const [sessionActive, setSessionActive] = React.useState(false);
  const [skipExistingProcessing, setSkipExistingProcessing] = React.useState(false);
  const [selectedDirectory, setSelectedDirectory] = React.useState("");
  const [rsyncersPaused, setRsyncersPaused] = React.useState(false);
  const baseUrl = sessionStorage.getItem("murfeyServerURL") ?? process.env.REACT_APP_API_ENDPOINT
  const url = baseUrl
    ? baseUrl.replace("http", "ws")
    : "ws://localhost:8000";
  const toast = useToast();
  const [session, setSession] = React.useState<Session>();

  const handleMachineConfig = (mcfg: MachineConfig) => {
    setMachineConfig(mcfg);
    setSelectedDirectory(mcfg["data_directories"][0]);
  } 

  useEffect(() => {getMachineConfigData().then((mcfg) => handleMachineConfig(mcfg))}, []);

  useEffect(() => {
    getSessionData(sessid).then((sess) => setSession(sess.session));
    setUUID(uuid4());
  }, []);

  const parseWebsocketMessage = (message: any) => {
    let parsedMessage: any = {};
    try {
      parsedMessage = JSON.parse(message);
    } catch (err) {
      return;
    }
    if (parsedMessage.message === "refresh") {
      window.location.reload();
    }
    if (
      parsedMessage.message === "update" &&
      typeof sessid !== "undefined" &&
      parsedMessage.session_id === parseInt(sessid)
    ) {
      return toast({
        title: "Update",
        description: parsedMessage.payload,
        isClosable: true,
        duration: parsedMessage.duration ?? null,
        status: parsedMessage.status ?? "info",
      });
    }
  };

  useWebSocket(url + `ws/connect/${UUID}`, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    onMessage: (event) => {
      parseWebsocketMessage(event.data);
    },
  });

  const finaliseAll = async () => {
    rsync?.map((r) => {
      finaliseRsyncer(r.session_id, r.source);
    });
    onClose();
  }

  const pauseAll = async () => {
    rsync?.map((r) => {
      pauseRsyncer(r.session_id, r.source);
    });
    setRsyncersPaused(true);
  }

  const resolveName = async () => {
    const name: string = await getInstrumentName();
    setInstrumentName(name);
  };
  useEffect(() => {resolveName()}, []);

  const checkSessionActivationState = async () => {
    if(sessid !== undefined){
      const activationState = await sessionTokenCheck(parseInt(sessid));
      setSessionActive(activationState);
    }
  }
  useEffect(() => {checkSessionActivationState()}, []);

  const getTransferring = (r: RSyncerInfo) => {return r.transferring;}

  const checkRsyncStatus = async () => {
    setRsyncersPaused(rsync ? !rsync.every(getTransferring): true);
  }

  useEffect(() => {checkRsyncStatus()}, []);

  const handleDirectorySelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedDirectory(e.target.value);

  const handleReconnect = async () => {
    if (typeof sessid !== "undefined"){
      await sessionHandshake(parseInt(sessid));
      startMultigridWatcher(
        {
          source: selectedDirectory,
          skip_existing_processing: skipExistingProcessing,
          destination_overrides: rsync ? Object.fromEntries(rsync.map((r) => [r.source, r.destination])): {},
          rsync_restarts: rsync ? rsync.map((r) => r.source): [],
        } as MultigridWatcherSpec,
        parseInt(sessid),
      );
    }
  }


  return (
    <div className="rootContainer">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Visit Completion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to remove all data associated with this visit?</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => finaliseAll()}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenReconnect} onClose={onCloseReconnect}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Restart Transfers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <FormControl display="flex" alignItems="center">
            <VStack>
            <HStack>
            <FormLabel mb="0">Data directory</FormLabel>
            <Select onChange={handleDirectorySelection}>
              {machineConfig &&
              machineConfig["data_directories"].length > 0 ? (
                machineConfig["data_directories"].map(
                  (value) => {
                    return (
                      <option value={value}>{value}</option>
                    );
                  },
                )
              ) : (
                <GridItem colSpan={5}>
                  <Heading textAlign="center" py={4} variant="notFound">
                    No Data Directories Found
                  </Heading>
                </GridItem>
              )}
            </Select>
            </HStack>
            <HStack>
              <FormLabel mb="0">Do not process existing data</FormLabel>
              <Switch
                id="skip-existing-processing-reconnect"
                isChecked={false}
                onChange={() => {
                  setSkipExistingProcessing(!skipExistingProcessing);
                }}
              />
            </HStack>
            </VStack>
          </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onCloseReconnect}>
              Close
            </Button>
            <Button variant="ghost" onClick={handleReconnect}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack bg="murfey.700" justifyContent="start" alignItems="start" display="flex" w="100%" px="10vw" py="1vh">
              <Heading size="xl" color="murfey.50">
                Session {sessid}: {session ? session.visit : null}
              </Heading>
              <HStack>
                <HStack>
                <HStack>
                <Button variant="onBlue" onClick={() => onOpen()}>Visit Complete</Button>
                <IconButton aria-label="Pause all transfers" as={MdPause} variant="onBlue" isDisabled={rsyncersPaused} onClick={() => pauseAll()} />
                <Link
                  w={{ base: "100%", md: "19.6%" }}
                  _hover={{ textDecor: "none" }}
                  as={LinkRouter}
                  to={`session_parameters`}
                >
                  <Button variant="onBlue">Processing Parameters</Button>
                </Link>
                </HStack>
                {!sessionActive ? <Button variant="onBlue" onClick={() => onOpenReconnect()}>Reconnect</Button>: <></>}
                </HStack>
                <Spacer />
                <ViewIcon color="white" />
                <Switch colorScheme="murfey" id="monitor" />
                {/* <Button aria-label="Subscribe to notifications" rightIcon={<MdEmail/>} variant="onBlue">
                            Subscribe
                        </Button> */}
              </HStack>
            </VStack>
          </VStack>
        </Box>
        <Box mt="1em" w="95%" justifyContent={"center"} alignItems={"center"}>
          <Flex align="stretch">
            <Stack w="100%" spacing={5} py="0.8em" px="1em">
              {rsync && rsync.length > 0 ? (
                rsync.map((r) => {
                  return RsyncCard(r);
                })
              ) : (
                <GridItem colSpan={5}>
                  <Heading textAlign="center" py={4} variant="notFound">
                    No RSyncers Found
                  </Heading>
                </GridItem>
              )}
            </Stack>
            <Spacer />
            <Stack spacing={5} py="0.8em" px="1em">
              <Link
                w={{ base: "100%", md: "19.6%" }}
                key="data_collections"
                _hover={{ textDecor: "none" }}
                as={LinkRouter}
                to={`../sessions/${sessid}/data_collection_groups`}
              >
              <Button rightIcon={<MdOutlineGridOn />} padding="20px">
                Data Collections
              </Button>
              </Link>
              <Link
                w={{ base: "100%", md: "19.6%" }}
                key="gain_ref"
                _hover={{ textDecor: "none" }}
                as={LinkRouter}
                to={`../sessions/${sessid}/gain_ref_transfer?sessid=${sessid}`}
              >
                <Button rightIcon={<MdFileUpload />} padding="20px">
                  Transfer Gain Reference
                </Button>
              </Link>
              <InstrumentCard />
              <UpstreamVisitCard sessid={parseInt(sessid ?? "0")} />
            </Stack>
          </Flex>
        </Box>
      </Box>
    </div>
  );
};

export { Session };
