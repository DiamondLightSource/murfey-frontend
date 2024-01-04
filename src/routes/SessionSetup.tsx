import { Button, Box, FormControl, FormLabel, Input, RadioGroup, Radio, Stack, Link } from "@chakra-ui/react";
import { getForm } from "components/forms";
import { Link as LinkRouter, useParams } from "react-router-dom";

import React from "react";

const SessionSetup = () => {
    const [expType, setExpType] = React.useState('spa');
    const { sessid } = useParams();
    return (
        <Stack>
        <Box borderWidth='1px' borderRadius='lg' overflow='hidden' padding='10px' display='flex' borderColor={'murfey.400'}>
        <RadioGroup onChange={setExpType} value={expType} colorScheme="murfey">
            <Stack>
            <Radio value='spa'>SPA</Radio>
            <Radio value='tomography'>Tomography</Radio>
            </Stack>
        </RadioGroup>
        </Box>
        <Box borderWidth='1px' borderRadius='lg' overflow='hidden' padding='10px' display='flex' borderColor={'murfey.400'}>
        {getForm(expType)}
        </Box>
        <Link
            w={{ base: "100%", md: "19.6%" }}
            key={sessid}
            _hover={{ textDecor: "none" }}
            as={LinkRouter}
            to={`../new_session/setup/${sessid}`}
        >
        <Button>Save</Button>
        </Link>
        </Stack>
    )
}

export { SessionSetup };
