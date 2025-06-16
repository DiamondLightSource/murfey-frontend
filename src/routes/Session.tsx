import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Flex,
  GridItem,
  Heading,
  HStack,
  IconButton,
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
  StatLabel,
  StatNumber,
  Switch,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

import { useDisclosure } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

import { v4 as uuid4 } from "uuid";
import { Link as LinkRouter, useLoaderData, useParams, useNavigate } from "react-router-dom";
import {
  MdDensityMedium,
  MdFileUpload,
  MdOutlineGridOn,
  MdPause,
} from "react-icons/md";
import { components } from "schema/main";
import { getInstrumentName } from "loaders/general";
import { updateVisitEndTime, getSessionData } from "loaders/session_clients";
import { getMachineConfigData } from "loaders/machineConfig";
import { getRsyncerData, pauseRsyncer, restartRsyncer, removeRsyncer, finaliseRsyncer, finaliseSession, flushSkippedRsyncer } from "loaders/rsyncers";
import { getSessionProcessingParameterData } from "loaders/processingParameters";
import { sessionTokenCheck, sessionHandshake } from "loaders/jwt";
import { startMultigridWatcher, setupMultigridWatcher } from "loaders/multigridSetup";
import { InstrumentCard } from "components/instrumentCard";
import { UpstreamVisitCard } from "components/upstreamVisitsCard";
import useWebSocket from "react-use-websocket";

import React, { useEffect } from "react";
import { FaCalendar } from "react-icons/fa";

type RSyncerInfo = components["schemas"]["RSyncerInfo"];
type Session = components["schemas"]["Session"];
type MachineConfig = components["schemas"]["MachineConfig"];
type MultigridWatcherSpec = components["schemas"]["MultigridWatcherSetup"];


const RsyncCard = ({
  rsyncer,
  onRemove,
  onFinalise,
}: {
  rsyncer: RSyncerInfo;
  onRemove: (id: number, source: string) => void;
  onFinalise: (id: number, source: string) => void;
}) => {

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
    if(action === "finalise") {
      await finaliseRsyncer(rsyncer.session_id, rsyncer.source);
      // Run the function passed in from 'Session'
      onFinalise(rsyncer.session_id, rsyncer.source);
    }
    else if(action === "remove") {
      await removeRsyncer(rsyncer.session_id, rsyncer.source);
      // Run the function passed in from 'Session'
      onRemove(rsyncer.session_id, rsyncer.source);
    }
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
              rsyncer.alive ? (
              <>
              <MenuItem
                onClick={() => pauseRsyncer(rsyncer.session_id, rsyncer.source)}
                isDisabled={rsyncer.stopping}
              >
                Pause
              </MenuItem>
              <MenuItem
                onClick={() => flushSkippedRsyncer(rsyncer.session_id, rsyncer.source)}
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
                onClick={() => {finalise()}}
                isDisabled={rsyncer.stopping}
              >
                Remove all source files and stop
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
              <StatNumber>
                {rsyncer.num_files_skipped} skipped
              </StatNumber>
              {
                rsyncer.analyser_alive ?
                <StatNumber>
                  {rsyncer.num_files_to_analyse} to analyse
                </StatNumber>
                : <></>
              }
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
  const { isOpen: isOpenCalendar, onOpen: onOpenCalendar, onClose: onCloseCalendar } = useDisclosure();
  const { sessid } = useParams();
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = React.useState(false);
  const [session, setSession] = React.useState<Session>();
  const [skipExistingProcessing, setSkipExistingProcessing] = React.useState(false);
  const [selectedDirectory, setSelectedDirectory] = React.useState("");
  const [visitEndTime, setVisitEndTime] = React.useState<Date>(new Date());
  const baseUrl = sessionStorage.getItem("murfeyServerURL") ?? process.env.REACT_APP_API_ENDPOINT

  // Set URL for websocket connection
  const url = baseUrl
    ? baseUrl.replace("http", "ws")
    : "ws://localhost:8000";

  // Set up UUID for websocket connection
  const [UUID, setUUID] = React.useState("");

  // Use existing UUID if present; otherwise, generate a new UUID
  useEffect(() => {
    if (!UUID) {
      setUUID(uuid4());
    }
  }, [UUID]);

  // Websocket helper function to parse incoming messages
  const toast = useToast();
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

  // Establish websocket connection to the backend
  useWebSocket(
    // 'null' is passed to 'useWebSocket()' if UUID is not yet set to
    // prevent malformed connections
    UUID ? url + `ws/connect/${UUID}` : null,
    UUID
      ? {
          onOpen: () => {
            console.log("WebSocket connection established.");
          },
          onMessage: (event) => {
            parseWebsocketMessage(event.data);
          },
        }
      : undefined
  );


  // Get machine config and set up related settings
  const [machineConfig, setMachineConfig] = React.useState<MachineConfig>();
  const handleMachineConfig = (mcfg: MachineConfig) => {
    setMachineConfig(mcfg);
    setSelectedDirectory(mcfg["data_directories"][0]);
  }

  const recipesDefined = machineConfig ? machineConfig.recipes ? Object.keys(machineConfig.recipes).length !== 0: false: false;

  useEffect(() => {getMachineConfigData().then((mcfg) => handleMachineConfig(mcfg))}, []);

  useEffect(() => {getSessionProcessingParameterData(sessid).then((params) => {if(params === null && recipesDefined && session !== undefined && session.process) navigate(`/new_session/parameters/${sessid}`);})})


  // Session helper function to update the page with data from backend
  const loadSession = async () => {
    const sess = await getSessionData(sessid);
    if (sess) {
      setSession(sess.session);
    }
  };

  // Load Session page upon initialisation
  useEffect(() => {
    loadSession();
  }, [sessid]);


  // Set up RSyncer handling
  const rsyncerLoaderData = useLoaderData() as RSyncerInfo[] | null;
  const [rsyncers, setRsyncers] = React.useState<RSyncerInfo[]>(rsyncerLoaderData ?? []);
  const [rsyncersPaused, setRsyncersPaused] = React.useState(false);

  // Poll Rsyncer every few seconds
  useEffect(() => {
    if (!sessid) return; // Don't run it until a Session has been successfully created

    const fetchData = async () => {
      try {
        const data = await getRsyncerData(sessid) ;
        setRsyncers(data)
      } catch (err) {
        console.error("Error polling rsyncers:", err)
      }
    };
    fetchData();  // Fetch data once

    // Set it to run every 2s
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [sessid]);

  // Other Rsync-related functions
  const handleRemoveRsyncer = async (sessionId: number, source: string) => {
    // Safely update the displayed Rsync cards after a 'remove' call is made
    try {
      await removeRsyncer(sessionId, source);
      const updatedData = await getRsyncerData(String(sessionId));
      setRsyncers(updatedData);
    } catch (err) {
      console.error("Failed to remove rsyncer:", err);
    }
  };

  const handleFinaliseRsyncer = async (sessionId: number, source: string) => {
    // Safely update the displayed Rsync cards after a 'finalise' call is made
    try {
      await finaliseRsyncer(sessionId, source);
      const updatedData = await getRsyncerData(String(sessionId));
      setRsyncers(updatedData);
    } catch (err) {
      console.error("Failed to finalise rsyncer:", err);
    }
  };

  const finaliseAll = async () => {
    if(sessid) await finaliseSession(parseInt(sessid));
    onClose();
  }

  const pauseAll = async () => {
    rsyncers?.map((r) => {
      pauseRsyncer(r.session_id, r.source);
    });
    setRsyncersPaused(true);
  }

  const checkRsyncStatus = async () => {
    setRsyncersPaused(rsyncers ? !rsyncers.every(getTransferring): true);
  }

  useEffect(() => {checkRsyncStatus()}, []);

  const getTransferring = (r: RSyncerInfo) => {return r.transferring;}


  // Get and set the instrument name
  const [instrumentName, setInstrumentName] = React.useState("");
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


  // Helper fnction format datetime to pass into input fields
  const formatDateTimeLocal = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hour}:${min}`;
  }

  // Set the default visit end time if none was provided
  const defaultVisitEndTime = session?.visit_end_time
    ? formatDateTimeLocal(new Date(session.visit_end_time))
    : formatDateTimeLocal(new Date());

  const registerEndTimeUpdate = async (newEndTime: Date) => {
    if(typeof sessid !== "undefined") {
      await updateVisitEndTime(parseInt(sessid), newEndTime);
      await loadSession();  // Refresh the page with new details
    }
    onCloseCalendar();
  }

  const handleDirectorySelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedDirectory(e.target.value);

  const handleReconnect = async () => {
    if (typeof sessid !== "undefined"){
      await sessionHandshake(parseInt(sessid));
      await setupMultigridWatcher(
        {
          source: selectedDirectory,
          skip_existing_processing: skipExistingProcessing,
          destination_overrides: rsyncers ? Object.fromEntries(rsyncers.map((r) => [r.source, r.destination])): {},
          rsync_restarts: rsyncers ? rsyncers.map((r) => r.source): [],
        } as MultigridWatcherSpec,
        parseInt(sessid),
      );
      await startMultigridWatcher(parseInt(sessid));
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
      <Modal isOpen={isOpenCalendar} onClose={onCloseCalendar} size={"xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select data transfer end time</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <input
              aria-label="Date and time"
              type="datetime-local"
              defaultValue={defaultVisitEndTime}
              onChange={(e) => setVisitEndTime(new Date(e.target.value))}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onCloseCalendar}>
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={() => registerEndTimeUpdate(visitEndTime)}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack bg="murfey.700" justifyContent="start" alignItems="start" display="flex" w="100%" px="10vw" py="1vh">
              <Heading size="xl" color="murfey.50">
                Session {sessid}: {session ? session.visit : null}
                {/* Display visit end time if set for this session */}
                {session?.visit_end_time && (
                  ` [Transfer ends at ${new Date(session.visit_end_time).toLocaleString(
                    undefined,
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  )}]`
                )}
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
                <HStack>
                  <IconButton aria-label="calendar-to-change-end-time" variant="onBlue" onClick={() => onOpenCalendar()}>
                    <FaCalendar/>
                  </IconButton>
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
              {rsyncers && rsyncers.length > 0 ? (
                rsyncers.map((r): React.ReactElement => (
                  <RsyncCard
                    key={`${r.session_id}-${r.source}`} // Used by 'map' for ID-ing elements
                    rsyncer={r}
                    // Pass the handler functions through to the RsyncCard object
                    onRemove={handleRemoveRsyncer}
                    onFinalise={handleFinaliseRsyncer}
                  />
                ))
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
