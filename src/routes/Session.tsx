import {
    Badge,
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
    Image,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Spacer,
    Spinner,
    Stack,
    StackDivider,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    VStack,
    useToast,
  } from "@chakra-ui/react";

import { useDisclosure } from "@chakra-ui/react";

import { Link as LinkRouter, useLoaderData, useParams } from "react-router-dom";
import { MdCheck, MdDensityMedium, MdFileUpload, MdEmail, MdOutlineWarning } from "react-icons/md";
import { FiActivity } from "react-icons/fi";
import { components } from "schema/main";
import { getInstrumentName } from "loaders/general";
import { stopRsyncer } from "loaders/rsyncers";
import { InstrumentCard } from "components/instrumentCard";
import useWebSocket from 'react-use-websocket';

import React from "react";

type RsyncInstance = components["schemas"]["RsyncInstance"];

function FinaliseRsyncer(rsyncer: RsyncInstance) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
          <Button onClick={onOpen}>Open Modal</Button>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Modal Title</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                etc
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button variant='ghost'>Secondary Action</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

const RsyncCard = (rsyncer: RsyncInstance) => {
    return (
        <Card width='100%' bg='murfey.400' borderColor='murfey.300'>
            <CardHeader>
                <Flex> <Flex flex='1' gap='4' alignItems='center' flexWrap='wrap'> <HStack spacing='3em'> 
                <Text>RSync Instance</Text> 
                {rsyncer.transferring && <Spinner color='murfey.700' />}
                <Badge colorScheme={rsyncer.tag === "fractions" ? "green": rsyncer.tag === "metadata" ? "purple": rsyncer.tag === "atlas" ? "yellow": "red"}>{rsyncer.tag}</Badge> 
                </HStack> 
                </Flex> 
                <Menu>
                    <MenuButton as={IconButton} aria-label="Rsync control options" icon={<MdDensityMedium/>}/>
                    <MenuList>
                        <MenuItem onClick={() => stopRsyncer(rsyncer.session_id, rsyncer.source)} isDisabled={!rsyncer.transferring}>Stop</MenuItem>
                        <MenuItem isDisabled={!rsyncer.transferring}>Kill</MenuItem>
                        <MenuItem onClick={() => FinaliseRsyncer(rsyncer)} isDisabled={!rsyncer.transferring}>Finalise</MenuItem>
                    </MenuList>
                </Menu> 
                </Flex>
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
                            <StatHelpText>{((rsyncer.files_transferred ?? 0)  >= (rsyncer.files_counted ?? 0)) ? <HStack><MdCheck/><Text>Up to date</Text></HStack>: rsyncer.transferring ? <HStack><FiActivity/><Text>Working on it</Text></HStack>: <HStack><MdOutlineWarning/><Text>Broken</Text></HStack>}</StatHelpText>
                        </Stat>
                    </Box>
                </Stack>
            </CardBody>
        </Card>
    )
}

const getUrl = (endpoint: string) => {
    return process.env.REACT_APP_API_ENDPOINT + endpoint;
}

const Session = () => {
    const rsync = useLoaderData() as RsyncInstance[] | null;
    const { sessid } = useParams();
    const [instrumentName, setInstrumentName] = React.useState('');
    const url = process.env.REACT_APP_API_ENDPOINT ? process.env.REACT_APP_API_ENDPOINT.replace("http", "ws"): "ws://localhost:8000"
    const toast = useToast();

    const parseWebsocketMessage = (message: any) => {
        let parsedMessage: any = {};
        try {
          parsedMessage = JSON.parse(message);
        }
        catch(err) {
            return
        }
        if (parsedMessage.message === "refresh") { 
            window.location.reload();
        }
        if (parsedMessage.message === "update" && typeof sessid !== "undefined" && parsedMessage.session_id === parseInt(sessid)) {
            return toast({title: "Update", description: parsedMessage.payload, isClosable: true, duration: parsedMessage.duration ?? null, status: parsedMessage.status ?? "info"});
        }
    }

    useWebSocket(url+"ws/test/0", {onOpen: () => {console.log('WebSocket connection established.');}, onMessage: (event) => {parseWebsocketMessage(event.data);}});

    const resolveName = async () => {
        const name: string = await getInstrumentName();
        setInstrumentName(name);
    }
    resolveName();

    return (
        <div className='rootContainer'>
        <Box mt='-1em' mx='-7.3vw' bg='murfey.50' flex='1 0 auto'>
            <Box w='100%' overflow='hidden'>
                <VStack className='homeRoot'>
                    <VStack bg='murfey.700' justifyContent='start' alignItems='start'>
                        <Heading size='xl' color='murfey.50'>
                            Session {sessid}
                        </Heading>
                        <HStack>
                        <Link
                            w={{ base: "100%", md: "19.6%" }}
                            _hover={{ textDecor: "none" }}
                            as={LinkRouter}
                            to={`processing_parameters`}
                        >
                        <Button variant="onBlue">
                        Processing Parameters
                        </Button>
                        </Link>
                        <Spacer/>
                        <Button aria-label="Subscribe to notifications" rightIcon={<MdEmail/>} variant="onBlue">
                            Subscribe
                        </Button>
                        </HStack>
                    </VStack>
                </VStack>
            </Box>
            <Box mt='1em' w='95%' justifyContent={'center'} alignItems={'center'}>
            <Flex align='stretch'>
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
            <Spacer/>
            <Stack spacing={5} py='0.8em' px='1em'>
            <Link
                w={{ base: "100%", md: "19.6%" }}
                key="gain_ref"
                _hover={{ textDecor: "none" }}
                as={LinkRouter}
                to={`../gain_ref_transfer?sessid=${sessid}`}
            >
            <Button rightIcon={<MdFileUpload/>} padding='20px'>Transfer Gain Reference</Button>
            </Link>
            <InstrumentCard />
            </Stack>
            </Flex>
            </Box>
        </Box>
        </div>
    );
};

export { Session };
