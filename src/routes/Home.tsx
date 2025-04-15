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
} from "@chakra-ui/react";

import { v4 as uuid4 } from "uuid";
import { Link as LinkRouter, useLoaderData } from "react-router-dom";
import { components } from "schema/main";
import { MdDelete } from "react-icons/md";
import { GiMagicBroom } from "react-icons/gi";
import { deleteSessionData } from "loaders/session_clients";
import { finaliseSession } from "loaders/rsyncers";
import { sessionTokenCheck } from "loaders/jwt";
import { InstrumentCard } from "components/instrumentCard";
import { PuffLoader } from "react-spinners";
import useWebSocket from "react-use-websocket";

import React, { useEffect } from "react";

type SessionClients = components["schemas"]["SessionClients"];

const SessionRow = (session_client: SessionClients) => {

  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();
  const { isOpen: isOpenCleanup, onOpen: onOpenCleanup, onClose: onCloseCleanup } = useDisclosure();

  const cleanupSession = async (sessid: number) => {
    await finaliseSession(sessid);
    onCloseCleanup();
  }

  const [sessionActive, setSessionActive] = React.useState(false);

  useEffect(() => {sessionTokenCheck(session_client.session.id).then((active) => setSessionActive(active))}, []);

  return (
    <VStack w="100%" spacing={0}>
      <Stack w="100%" spacing={5} py="0.8em">
        {session_client ?
            (
              <>
                <HStack>
                <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
                  <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Confirm removing session {session_client.session.name} from list</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>Are you sure you want to continue? This action is not reversible</ModalBody>
                      <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onCloseDelete}>
                          Close
                        </Button>
                        <Button variant="ghost" onClick={() => {deleteSessionData(session_client.session.id); window.location.reload();}}>Confirm</Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                  <Modal isOpen={isOpenCleanup} onClose={onCloseCleanup}>
                  <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Confirm removing files for session {session_client.session.name}</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>Are you sure you want to continue? This action is not reversible</ModalBody>
                      <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onCloseCleanup}>
                          Close
                        </Button>
                        <Button variant="ghost" onClick={() => {cleanupSession(session_client.session.id);}}>Confirm</Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                  <Tooltip
                    label={session_client.session.name}
                  >
                    <Link
                      key={session_client.session.id}
                      _hover={{ textDecor: "none" }}
                      as={LinkRouter}
                      display={'flex'}
                      to={`../sessions/${session_client.session.id ?? 0}`}
                    >
                      <Stat
                        _hover={{
                          borderColor: "murfey.400",
                        }}
                        bg={
                          "murfey.400"
                        }
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
                          {session_client.session.name}:{" "}
                          {session_client.session.id}
                        </StatLabel>
                        {sessionActive ? <PuffLoader size={25} color="red"/>: <></>}
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
            )
        : (
          <GridItem colSpan={5}>
            <Heading textAlign="center" py={4} variant="notFound">
              None Found
            </Heading>
          </GridItem>
        )
      }
      </Stack>
    </VStack>
  );
};

const Home = () => {
  const sessions = useLoaderData() as {
    current: SessionClients[];
  } | null;
  const [ UUID, setUUID ] = React.useState("");
  const baseUrl = sessionStorage.getItem("murfeyServerURL") ?? process.env.REACT_APP_API_ENDPOINT
  const url = baseUrl
    ? baseUrl.replace("http", "ws")
    : "ws://localhost:8000";
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
  };


  //const wsid = uuid1();
  useEffect(() => {setUUID(uuid4());}, []);
  useWebSocket(url + `ws/connect/${UUID}`, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    onMessage: (event) => {
      parseWebsocketMessage(event.data);
    },
  });


  return (
    <div className="rootContainer">
      <title>Murfey</title>
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack bg="murfey.700" justifyContent="start" alignItems="start" display="flex" w="100%" px="10vw" py="1vh">
              <Heading size="xl" color="murfey.50">
                Murfey Sessions
              </Heading>
              <Heading pt="2vh" color="murfey.50" fontWeight="200" size="md">
                Microscope Data Transfer Control System
              </Heading>
              <Link
                w={{ base: "100%", md: "19.6%" }}
                _hover={{ textDecor: "none" }}
                as={LinkRouter}
                to={`../instruments/${sessionStorage.getItem("instrumentName")}/new_session`}
              >
                <Button variant="onBlue">New session</Button>
              </Link>
            </VStack>

            <HStack w="100%" display="flex" px="10vw">
              <VStack mt="0 !important" w="100%" px="10vw" display="flex">
                <Heading textAlign="left" w="100%" size="lg">
                  {"Exisitng Sessions"}
                </Heading>
                <Divider borderColor="murfey.300" />
                {sessions && sessions.current.length > 0 ? sessions.current.map((current) => {
                  return <VStack w="100%" spacing={5}>
                    {SessionRow(current)}
                  </VStack>
                }) : (
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
  );
};

export { Home };
