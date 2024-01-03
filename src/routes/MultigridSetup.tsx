import {
    Box,
    Button,
    Divider,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Link,
    Select,
    Stack,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
  } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

import { MdLink } from "react-icons/md";
import { Link as LinkRouter, useLoaderData, useParams } from "react-router-dom";
import { components } from "schema/main";
import { linkSessionToClient } from "loaders/session_clients";
import { useSearchParams } from "react-router-dom";
import { startMultigridWatcher } from "loaders/multigridSetup";
import React from "react";

type MachineConfig = components["schemas"]["MachineConfig"];
type MultigridWatcherSpec = components["schemas"]["MultigridWatcherSetup"];


const MultigridSetup = () => {
    const machineConfig = useLoaderData() as MachineConfig | null;
    const { sessid } = useParams();
    let initialDirectory = '';
    if (machineConfig) Object.entries(machineConfig.data_directories).forEach(([key, value]) => { if (initialDirectory === '' && value === "detector") initialDirectory=key;});
    const [selectedDirectory, setSelectedDirectory] = React.useState(initialDirectory);

    const handleDirectorySelection = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDirectory(e.target.value);

    const handleSelection = () => {
        console.log(sessid);
        console.log(selectedDirectory);
        if (typeof sessid !== "undefined") startMultigridWatcher({source: selectedDirectory, skip_existing_processing: false} as MultigridWatcherSpec, parseInt(sessid));
    };

    return (
        <div className='rootContainer'>
        <Box mt='-1em' mx='-7.3vw' bg='murfey.50' flex='1 0 auto'>
            <Box w='100%' overflow='hidden'>
                <VStack className='homeRoot'>
                    <VStack bg='murfey.700' justifyContent='start' alignItems='start'>
                        <Heading size='xl' color='murfey.50'>
                            Select data directory
                        </Heading>
                    </VStack>
                </VStack>
            </Box>
            <Box mt='1em' w='95%' justifyContent={'center'} alignItems={'center'} display={'flex'}>
            
            </Box>
            <Box mt='1em' w='95%' justifyContent={'center'} alignItems={'center'} display={'flex'}>
            <VStack mt='0 !important' w='100%' px='10vw' justifyContent='start' alignItems='start'>
            <VStack w='100%' spacing={0}>
            <Divider borderColor='murfey.300' />
            <Stack w='100%' spacing={5} py='0.8em'>
                <HStack>
                <Select onChange={handleDirectorySelection}>
                {machineConfig && Object.keys(machineConfig.data_directories).length > 0 ? (
                Object.entries(machineConfig.data_directories).map(([key, value]) => {
                    return (
                    (value === "detector") ?
                    <option value={key}>
                        {key}
                    </option>
                    : <></>
                );})
                ) : (
                <GridItem colSpan={5}>
                    <Heading textAlign='center' py={4} variant='notFound'>
                    No Data Directories Found
                    </Heading>
                </GridItem>
                )}
                </Select>
                <Link
                    w={{ base: "100%", md: "19.6%" }}
                    _hover={{ textDecor: "none" }}
                    as={LinkRouter}
                    to={`../sessions/${sessid}`}
                >
                <IconButton aria-label="select" icon={<ArrowForwardIcon />} onClick={handleSelection} />
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

