import {
  Box,
  Button,
  Divider,
  GridItem,
  Input,
  Heading,
  HStack,
  Link,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";

import { Link as LinkRouter, useLoaderData, useParams } from "react-router-dom";
import { components } from "schema/main";
import { SetupStepper } from "components/setupStepper";
import { Table } from "@diamondlightsource/ui-components";
import { createSession } from "loaders/session_clients";
import { sessionHandshake } from "loaders/jwt";
import { useNavigate } from "react-router-dom";
import React, { ChangeEventHandler } from "react";

type Visit = components["schemas"]["Visit"];

const NewSession = () => {
  const currentVisits = useLoaderData() as Visit[] | null;
  const [selectedVisit, setSelectedVisit] = React.useState("");
  const [sessionReference, setSessionReference] = React.useState("");
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSessionReference(event.target.value);

  function selectVisit(data: Record<string, any>, index: number) {
    setSelectedVisit(data.name);
    setSessionReference(data.name);
  }

  const instrumentName = sessionStorage.getItem("instrumentName");

  const startMurfeySession = async (iName: string) => {
    const sid = await createSession(selectedVisit, sessionReference, iName);
    sessionHandshake(sid);
    return sid;
  }

  return instrumentName ? (
    <div className="rootContainer">
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack bg="murfey.700" justifyContent="start" alignItems="start" display="flex" w="100%" px="10vw" py="1vh">
              <Heading size="xl" color="murfey.50">
                Current visits
              </Heading>
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
            data={currentVisits}
            headers={[
              { key: "name", label: "Name" },
              { key: "start", label: "Start Time" },
              { key: "end", label: "End Time" },
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
            <Button
              isDisabled={selectedVisit === "" ? true : false}
              onClick={() => {
                startMurfeySession(instrumentName).then((sid: number) => {
                  navigate(`../sessions/${sid}/gain_ref_transfer?sessid=${sid}&setup=true`);
                });
              }}
            >
              Create session for visit {selectedVisit}
            </Button>
          </Stack>
        </Box>
      </Box>
    </div>
  ): <></>;
};

export { NewSession };
