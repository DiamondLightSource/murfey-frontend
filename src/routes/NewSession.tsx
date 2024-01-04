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
import { Table } from "@diamondlightsource/ui-components";
import { createSession } from "loaders/session_clients";
import { useNavigate } from 'react-router-dom';
import React, { ChangeEventHandler } from "react";

type Visit = components["schemas"]["Visit"];


const NewSession = () => {
    const currentVisits = useLoaderData() as Visit[] | null;
    const [selectedVisit, setSelectedVisit] = React.useState('');
    const [sessionReference, setSessionReference] = React.useState('');
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setSessionReference(event.target.value);

    function selectVisit(data: Record<string, any>, index: number) {
        setSelectedVisit(data.name);
        setSessionReference(data.name);
    }

    return (
        <div className='rootContainer'>
        <Box mt='-1em' mx='-7.3vw' bg='murfey.50' flex='1 0 auto'>
            <Box w='100%' overflow='hidden'>
                <VStack className='homeRoot'>
                    <VStack bg='murfey.700' justifyContent='start' alignItems='start'>
                        <Heading size='xl' color='murfey.50'>
                            Current visits
                        </Heading>
                    </VStack>
                </VStack>
            </Box>
            <Box mt='1em' w='95%' justifyContent={'center'} alignItems={'center'} display={'flex'}>
            <Table data={currentVisits} headers={[{'key': 'name', 'label': 'Name'}, {'key': 'start', 'label': 'Start Time'}, {'key': 'end', 'label': 'End Time'}, {'key': 'proposal_title', 'label': 'Description'}]} label={'visitData'} onClick={selectVisit} /> 
            </Box>
            <Box mt='1em' w='95%' justifyContent={'center'} alignItems={'center'} display={'flex'}>
            <Stack>
            <Input placeholder='Session reference' value={sessionReference} onChange={handleChange} />
            <Button isDisabled={selectedVisit === '' ? true: false} onClick={() => {createSession(selectedVisit, sessionReference).then(sid => {navigate(`parameters/${sid}`)})}}>Create session for visit {selectedVisit}</Button>
            </Stack>
            </Box>
        </Box>
        </div>
    );
};

export { NewSession };
