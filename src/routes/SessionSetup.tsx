import { Button, Box, FormControl, FormLabel, Input, RadioGroup, Radio, Stack, Link, VStack, Heading } from "@chakra-ui/react";
import { getForm } from "components/forms";
import { Link as LinkRouter, useParams, useLoaderData } from "react-router-dom";
import { SetupStepper } from "components/setupStepper";
import { components } from "schema/main";
import { getProcessingParameterData } from "loaders/processingParameters";

import React from "react";

type SessionClients = components["schemas"]["SessionClients"];

const SessionSetup = () => {
    const session = useLoaderData() as SessionClients | null;
    const [expType, setExpType] = React.useState('spa');
    const [procParams, setProcParams] = React.useState();
    const { sessid } = useParams();

    if(session) getProcessingParameterData(session.session.id.toString()).then(params => setProcParams(params));
    const activeStep = session ? procParams ? 3: session.session.visit ? 2: 0: 2
    return (
        <div className='rootContainer'>
        <Box mt='-1em' mx='-7.3vw' bg='murfey.50' flex='1 0 auto'>
            <Box w='100%' overflow='hidden'>
                <VStack className='homeRoot'>
                    <VStack bg='murfey.700' justifyContent='start' alignItems='start'>
                        <Heading size='xl' color='murfey.50'>
                            Processing parameters
                        </Heading>
                    </VStack>
                </VStack>
            </Box>
        <Stack>
        <Box mt='1em' ml='2em' w='80%' justifyContent={'center'} alignItems={'center'} >
        <SetupStepper activeStepIndex={activeStep} />
        </Box>
        <Box mt='1em' ml='3em' w='95%' justifyContent={'left'} alignItems={'left'} display={'flex'}>
        <RadioGroup onChange={setExpType} value={expType} colorScheme="murfey" isDisabled={activeStep !== 2 ? true: false}>
            <Stack>
            <Radio value='spa'>SPA</Radio>
            <Radio value='tomography'>Tomography</Radio>
            </Stack>
        </RadioGroup>
        </Box>
        <Box mt='1em' ml='3em' w='95%' borderWidth='1px' borderRadius='lg' overflow='hidden' padding='10px' display='flex' borderColor={'murfey.400'}>
        {getForm(expType)}
        </Box>
        <Box mt='1em' ml='3em' w='95%' justifyContent={'left'} alignItems={'left'} display={'flex'}>
        <Link
            w={{ base: "100%", md: "19.6%" }}
            key={sessid}
            _hover={{ textDecor: "none" }}
            as={LinkRouter}
            to={`../new_session/setup/${sessid}`}
        >
        <Button>Save</Button>
        </Link>
        </Box>
        </Stack>
        </Box>
        </div>
    )
}

export { SessionSetup };
