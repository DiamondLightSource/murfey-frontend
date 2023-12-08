import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Flex,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Link,
    Spinner,
    Stack,
    StackDivider,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
  } from "@chakra-ui/react";

import { Link as LinkRouter, useLoaderData, useParams } from "react-router-dom";
import { MdCheck, MdClose } from "react-icons/md";
import { FiActivity } from "react-icons/fi";
import { components } from "schema/main";

type RsyncInstance= components["schemas"]["RsyncInstance"];

const RsyncCard = (rsyncer: RsyncInstance) => {
    return (
        <Card>
            <CardHeader>
                <Flex> <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'> <HStack spacing='3em'> <Text>RSync Instance</Text> {rsyncer.transferring && <Spinner />} </HStack> </Flex> <IconButton aria-label="Stop rsync" icon={<MdClose/>}/> </Flex>
            </CardHeader>
            <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                        Source 
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                        {rsyncer.source}
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                        Destination
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                        {rsyncer.destination ?? ""}
                        </Text>
                    </Box>
                    <Box>
                        <Stat>
                            <StatLabel>Transfer progress</StatLabel>
                            <StatNumber>{rsyncer.files_transferred} / {rsyncer.files_counted}</StatNumber>
                            <StatHelpText>{((rsyncer.files_transferred ?? 0)  >= (rsyncer.files_counted ?? 0)) ? <HStack><MdCheck/><Text>Up to date</Text></HStack>: <HStack><FiActivity/><Text>Working on it</Text></HStack>}</StatHelpText>
                        </Stat>
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    )
}

const Session = () => {
    const rsync = useLoaderData() as RsyncInstance[] | null;
    const { sessid } = useParams();
    return (
        <div className='rootContainer'>
        <Box mt='-1em' mx='-7.3vw' bg='murfey.50' flex='1 0 auto'>
            <Box w='100%' overflow='hidden'>
                <VStack className='homeRoot'>
                    <VStack bg='murfey.700' justifyContent='start' alignItems='start'>
                        <Heading size='xl' color='murfey.50'>
                            Session {sessid}
                        </Heading>
                    </VStack>
                </VStack>
            </Box>
            <Box mt='1em' w='95%' justifyContent={'center'} alignItems={'center'} display={'flex'}>
            <Stack w='100%' spacing={5} py='0.8em' px='1em'>
                {rsync && rsync.length > 0 ? (
                rsync.map((r) => {
                return RsyncCard(r);
                })): (
                    <GridItem colSpan={5}>
                      <Heading textAlign='center' py={4} variant='notFound'>
                        No RSyncers Found
                      </Heading>
                    </GridItem>
                  )}
            </Stack>
            </Box>
        </Box>
        </div>
    );
};

export { Session };
