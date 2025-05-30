import {
  Box,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Link,
  Select,
  Stack,
  Switch,
  VStack,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

import { Link as LinkRouter, useLoaderData, useParams } from "react-router-dom";
import { components } from "schema/main";
import { setupMultigridWatcher, startMultigridWatcher } from "loaders/multigridSetup";
import { getSessionData } from "loaders/session_clients";
import { SetupStepper } from "components/setupStepper";
import React, { useEffect } from "react";

type MachineConfig = components["schemas"]["MachineConfig"];
type MultigridWatcherSpec = components["schemas"]["MultigridWatcherSetup"];
type Session = components["schemas"]["Session"];

const MultigridSetup = () => {
  const machineConfig = useLoaderData() as MachineConfig | null;
  const { sessid } = useParams();
  let initialDirectory = "";
  if (machineConfig)
    machineConfig.data_directories.forEach((value) => {
      if (initialDirectory === "")
        initialDirectory = value;
    });
  const [selectedDirectory, setSelectedDirectory] =
    React.useState(initialDirectory);
  const processByDefault = machineConfig ? machineConfig.process_by_default: true
  const [skipExistingProcessing, setSkipExistingProcessing] =
    React.useState(!processByDefault);
  const [session, setSession] = React.useState<Session>();

  useEffect(() => {
    getSessionData(sessid).then((sess) => setSession(sess.session));
  }, []);
  const activeStep = session != null ? (session.started ? 3 : 2) : 2;
  
  const handleDirectorySelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedDirectory(e.target.value);

  const recipesDefined = machineConfig ? machineConfig.recipes ? Object.keys(machineConfig.recipes).length !== 0: false: false;

  const handleSelection = async () => {
    if (typeof sessid !== "undefined"){
      await setupMultigridWatcher(
        {
          source: selectedDirectory,
          skip_existing_processing: skipExistingProcessing,
        } as MultigridWatcherSpec,
        parseInt(sessid),
      );
      if(!recipesDefined) await startMultigridWatcher(parseInt(sessid));
    }
  };

  return (
    <div className="rootContainer">
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack bg="murfey.700" justifyContent="start" alignItems="start" display="flex" w="100%" px="10vw" py="1vh">
              <Heading size="xl" color="murfey.50">
                Select data directory
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
          display={"flex"}
        ></Box>
        <Box
          mt="1em"
          px="10vw"
          w="100%"
          justifyContent={"center"}
          alignItems={"center"}
        >
          <SetupStepper activeStepIndex={activeStep} />
        </Box>
        <Box
          mt="1em"
          px="10vw"
          w="100%"
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}
        >
          <VStack
            mt="0 !important"
            w="100%"
            px="10vw"
            justifyContent="start"
            alignItems="start"
          >
            <VStack w="100%" spacing={0}>
              <Stack w="100%" spacing={5} py="0.8em">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Do not process existing data</FormLabel>
                  <Switch
                    id="skip-existing-processing"
                    isChecked={!processByDefault}
                    onChange={() => {
                      setSkipExistingProcessing(!skipExistingProcessing);
                    }}
                  />
                </FormControl>
                <HStack>
                  <Select onChange={handleDirectorySelection}>
                    {machineConfig &&
                    machineConfig.data_directories.length > 0 ? (
                      machineConfig.data_directories.map(
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
                  <Link
                    w={{ base: "100%", md: "19.6%" }}
                    _hover={{ textDecor: "none" }}
                    as={LinkRouter}
                    to={recipesDefined ? `../new_session/parameters/${sessid}`: `../sessions/${sessid}`}
                  >
                    <IconButton
                      aria-label="select"
                      icon={<ArrowForwardIcon />}
                      onClick={handleSelection}
                    />
                  </Link>
                </HStack>
              </Stack>
            </VStack>
          </VStack>
        </Box>
      </Box>
    </div>
  );
};

export { MultigridSetup };
