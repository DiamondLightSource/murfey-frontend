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
    const { sessid } = useParams();
    return (
        <div className='rootContainer'>
        <Box mt='1em' mx='-7.3vw' bg='murfey.50' flex='1 0 auto'>
            <Box w='100%' overflow='hidden'>
                <VStack className='homeRoot'>
                    <VStack bg='murfey.700' justifyContent='start' alignItems='start'>
                        <Heading size='xl' color='murfey.50'>
                            Session {sessid}
                        </Heading>
                        <Text>{sess && sess.clients.length > 0 ? sess.clients[0].visit: "Unknown visit"}</Text>
                    </VStack>
                </VStack>
            </Box>
        </Box>
        </div>
    );
};

export { Session };
