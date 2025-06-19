import {
  Box,
  Button,
  Card,
  CardBody,
  Input,
  Heading,
  Link,
  Stack,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalCloseButton,
  ModalBody,
  IconButton,
  Tooltip,
  Text,
} from "@chakra-ui/react";

import { useDisclosure } from "@chakra-ui/react";
import { Link as LinkRouter, useLoaderData } from "react-router-dom";
import { components } from "schema/main";
import { SetupStepper } from "components/setupStepper";
import { Table } from "@diamondlightsource/ui-components";
import { createSession, getSessionDataForVisit } from "loaders/session_clients";
import { sessionTokenCheck, sessionHandshake } from "loaders/jwt";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { getMachineConfigData } from "loaders/machineConfig";
import { FaCalendar } from "react-icons/fa";
import { convertUTCToUKNaive, convertUKNaiveToUTC, formatUTCISOToUKLocal } from "utils/generic";


type Visit = components["schemas"]["Visit"];
type MachineConfig = components["schemas"]["MachineConfig"];
type Session = components["schemas"]["Session"];

const NewSession = () => {

  // Load visits and add columns where they are formatted
  const currentVisits = useLoaderData() as Visit[] | null;
  const formattedVisits: Visit[] = currentVisits
    ? currentVisits.map(visit => ({
      ...visit,
      // Add new columns with the formatted timestamps for use in the table
      startFormatted: formatUTCISOToUKLocal(visit.start),
      endFormatted: formatUTCISOToUKLocal(visit.end),
    }))
  : [];

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenVisitCheck, onOpen: onOpenVisitCheck, onClose: onCloseVisitCheck } = useDisclosure();
  const { isOpen: isOpenCalendar, onOpen: onOpenCalendar, onClose: onCloseCalendar } = useDisclosure();
  const [selectedVisit, setSelectedVisit] = React.useState("");
  const [sessionReference, setSessionReference] = React.useState("");
  const [activeSessionsForVisit, setActiveSessionsForVisit] = React.useState<(Session | null)[]>([]);
  const [gainRefDir, setGainRefDir] = React.useState<string | null>();
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [proposedEndTime, setProposedEndTime] = React.useState<Date | null>(null);

  const [acqusitionSoftware, setAcquistionSoftware] = React.useState<string[]>([]);
  const navigate = useNavigate();

  // Upon initialisation, zero out seconds field
  const defaultVisitEndTime = (() => {
    let now = new Date();
    let timestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0, // Set seconds to 0
      0  // Set milliseconds to 0
    ).toISOString();
    return timestamp;
  })();

  const handleMachineConfig = (mcfg: MachineConfig) => {
    setGainRefDir(mcfg.gain_reference_directory);
    setAcquistionSoftware(mcfg.acquisition_software);
  }

  const instrumentName = sessionStorage.getItem("instrumentName");

  const alreadyActiveSessions = async () => {
    const sessionsToCheck: Session[] = await getSessionDataForVisit(selectedVisit, instrumentName ?? "");
    return Promise.all(sessionsToCheck.map(async (session) => {return await sessionTokenCheck(session.id) ? session: null}));
  }

  useEffect(() => {getMachineConfigData().then((mcfg) => handleMachineConfig(mcfg))}, []);
  useEffect(() => {alreadyActiveSessions().then((sessions) => setActiveSessionsForVisit(sessions))}, [selectedVisit]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSessionReference(event.target.value);

  const handleVisitNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVisit(event.target.value);
    setSessionReference(event.target.value);
  }

  function selectVisit(data: Record<string, any>, index: number) {
    setSelectedVisit(data.name);
    setSessionReference(data.name);
    // Add an hour to the listed end time
    const endTime = new Date(new Date(data.end).getTime() + (3600 * 1000));
    setEndTime(endTime);
  }

  const startMurfeySession = async (iName: string) => {
    const sid = await createSession(selectedVisit, sessionReference, iName, endTime);
    await sessionHandshake(sid);
    return sid;
  }

  const handleCreateSession = async (iName: string) => {
    if((!activeSessionsForVisit.length) || (activeSessionsForVisit.every((elem) => {return elem === null}))){
      const sid = await startMurfeySession(iName);
      gainRefDir ? navigate(`../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true`): navigate(`/new_session/setup/${sid}`);
    }
    else onOpenVisitCheck();
  }

  return instrumentName ? (
    <div className="rootContainer">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create visit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Session name"
              onChange={handleVisitNameChange}
            />
            <Input
              placeholder="Session reference"
              value={sessionReference}
              onChange={handleChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={selectedVisit === "" ? true : false}
              onClick={() => {
                handleCreateSession(instrumentName);
              }}
            >
              Create session
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenVisitCheck} onClose={onCloseVisitCheck}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>An active session already exists for this visit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            You may want to edit one of the following sessions instead (otherwise you may start multiple transfers for the same source)
            <VStack>
              {activeSessionsForVisit.map((session) => {
                return session ? <Link
                  w={{ base: "100%", md: "19.6%" }}
                  key="gain_ref"
                  _hover={{ textDecor: "none" }}
                  as={LinkRouter}
                  to={`/sessions/${session.id}`}
                >
                <Button>
                  {session.id}
                </Button>
                </Link>: <></>
              })}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={selectedVisit === "" ? true : false}
              onClick={() => {
                startMurfeySession(instrumentName).then((sid: number) => {
                  gainRefDir ? navigate(`../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true`): navigate(`/new_session/setup/${sid}`);
                });
              }}
            >
              Ignore and continue
            </Button>
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
              // Convert UTC into local UK time, and set seconds to 0
              defaultValue={convertUTCToUKNaive(defaultVisitEndTime).slice(0, 16) + ":00"}
              onChange={(e) => {
                // The seconds field is removed when it's 0, so add it back
                let timestamp = e.target.value
                timestamp += ":00"
                // Find the equivalent UTC time and save that
                let newEndTime = new Date(convertUKNaiveToUTC(timestamp))
                setProposedEndTime(newEndTime)
                }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue" mr={3}
              onClick={() => {
                onCloseCalendar();
                setProposedEndTime(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (proposedEndTime) {
                  setEndTime(proposedEndTime)
                  onCloseCalendar()
                }
              }}
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
                Current visits
              </Heading>
              <Button variant="onBlue" onClick={() => onOpen()}>Create visit</Button>
            </VStack>
          </VStack>
        </Box>
        <Box
          mt="1em"
          px="10vw"
          w="100%"
          justifyContent={"center"}
          alignItems={"center"}
        >
          <SetupStepper activeStepIndex={0} />
        </Box>
        <Box
          mt="1em"
          w="100%"
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}
        >
          <Table
            data={formattedVisits}
            headers={[
              { key: "name", label: "Name" },
              { key: "startFormatted", label: "Start Time" },
              { key: "endFormatted", label: "End Time" },
              { key: "proposal_title", label: "Description" },
            ]}
            label={"visitData"}
            onClick={selectVisit}
          />
        </Box>
        <Box
          mt="1em"
          w="100%"
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}
        >
          <Stack>
            <Input
              placeholder="Session reference"
              value={sessionReference}
              onChange={handleChange}
            />
            <VStack>
                <Card>
                <CardBody>
                <HStack>
                <VStack>
                <Text>Transfers will stop after:</Text>
                <Text>
                  {endTime
                    ? new Intl.DateTimeFormat("en-GB", {
                      timeZone: "Europe/London",
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZoneName: "short",
                      hour12: false,
                    }).format(endTime)
                    : "NOT SET"}
                </Text>
                </VStack>
                <Tooltip label="Set end time for data transfer">
                <IconButton aria-label="calendar-for-end-time" onClick={() => onOpenCalendar()}>
                  <FaCalendar/>
                </IconButton>
                </Tooltip>
                </HStack>
                </CardBody>
                </Card>
              <Button
                isDisabled={selectedVisit === "" ? true : false}
                onClick={() => {
                  handleCreateSession(instrumentName);
                }}
              >
                Create session for visit {selectedVisit}
              </Button>
            </VStack>
          </Stack>
        </Box>
      </Box>
    </div>
  ): <></>;
};

export { NewSession };
