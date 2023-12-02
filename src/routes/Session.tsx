import {
    Box,
    Button,
    Divider,
    GridItem,
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

type SessionClients = components["schemas"]["SessionClients"];

const Session = () => {
    const sess = useLoaderData() as SessionClients | null;
    console.log(sess);
    const { sessid } = useParams();
    return (
        <div className='rootContainer'>
        <Box mt='1em' mx='-7.3vw' bg='diamond.50' flex='1 0 auto'>
            <Box w='100%' overflow='hidden'>
                <VStack className='homeRoot'>
                    <VStack bg='diamond.700' justifyContent='start' alignItems='start'>
                        <Heading size='xl' color='diamond.50'>
                            Session {sessid}
                        </Heading>
                        <Text>{sess ? sess.clients[0].visit: "Unknown visit"}</Text>
                    </VStack>
                </VStack>
            </Box>
        </Box>
        </div>
    );
};

export { Session };
