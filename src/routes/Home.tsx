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
    VStack,
  } from "@chakra-ui/react";

import { Link as LinkRouter, useLoaderData } from "react-router-dom";
import { components } from "schema/main";

type SessionClients = components["schemas"]["SessionClients"];

interface SessionRowProps {
  session_clients: SessionClients[];
  title: string;
}

const SessionRow = ({ session_clients, title }: SessionRowProps) => (
  <VStack w='100%' spacing={0}>
    <Heading textAlign='left' w='100%' size='lg'>
      {title}
    </Heading>
    <Divider borderColor='diamond.300' />
    <Stack direction={{ base: "column", md: "row" }} w='100%' spacing='0.5%' py='0.8em'>
      {session_clients && session_clients.length > 0 ? (
        session_clients.map((session_client) => (
          <Link
            w={{ base: "100%", md: "19.6%" }}
            key={session_client.session.id}
            _hover={{ textDecor: "none" }}
            as={LinkRouter}
            to={`sessions/${session_client.session.id ?? 0}`}
          >
            <Stat
              _hover={{
                borderColor: "diamond.400",
              }}
              bg={session_client['clients'].some(c => c.connected) ? 'diamond.500': 'diamond.400'}
              overflow='hidden'
              w='calc(100%)'
              p={2}
              border='1px solid grey'
              borderRadius={5}
            >
              <StatLabel whiteSpace='nowrap' textOverflow='ellipsis' overflow='hidden'>
                {session_client.session.name}: {session_client.session.id} 
              </StatLabel>
            </Stat>
          </Link>
        ))
      ) : (
        <GridItem colSpan={5}>
          <Heading textAlign='center' py={4} variant='notFound'>
            No {title} Found
          </Heading>
        </GridItem>
      )}
    </Stack>
  </VStack>
);

const Home = () => {
  const sessions = useLoaderData() as {
    current: SessionClients[];
  } | null;

  return (
    <div className='rootContainer'>
      <title>Murfey</title>
      <Box mt='1em' mx='-7.3vw' bg='diamond.50' flex='1 0 auto'>
        <Box w='100%' overflow='hidden'>
          <VStack className='homeRoot'>
            <VStack bg='diamond.700' justifyContent='start' alignItems='start'>
              <Heading size='xl' color='diamond.50'>
                Murfey Sessions 
              </Heading>
            </VStack>

            <VStack mt='0 !important' w='100%' px='10vw' justifyContent='start' alignItems='start'>
              {sessions ? (
                <VStack w='100%' spacing={5}>
                  <SessionRow title='Existing Sessions' session_clients={sessions.current} />
                </VStack>
              ) : (
                <VStack w='100%'>
                  <Heading w='100%' py={4} variant='notFound'>
                    No sessions found
                  </Heading>
                </VStack>
              )}
            </VStack>
            <Button>
              New session
            </Button>
          </VStack>
        </Box>
      </Box>
    </div>
  );
};

export { Home };

