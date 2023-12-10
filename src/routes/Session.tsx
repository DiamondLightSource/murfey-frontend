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
  } from "@chakra-ui/react";

import { useDisclosure } from "@chakra-ui/react";

import { Link as LinkRouter, useLoaderData, useParams } from "react-router-dom";
import { MdCheck, MdDensityMedium, MdFileUpload } from "react-icons/md";
import { FiActivity } from "react-icons/fi";
import { components } from "schema/main";
import { getInstrumentName } from "loaders/general";
import { InstrumentCard } from "components/instrumentCard";

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
                </HStack> 
                </Flex> 
                <Menu>
                    <MenuButton as={IconButton} aria-label="Rsync control options" icon={<MdDensityMedium/>}/>
                    <MenuList>
                        <MenuItem>Stop</MenuItem>
                        <MenuItem>Kill</MenuItem>
                        <MenuItem onClick={() => FinaliseRsyncer(rsyncer)}>Finalise</MenuItem>
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
                            <StatHelpText>{((rsyncer.files_transferred ?? 0)  >= (rsyncer.files_counted ?? 0)) ? <HStack><MdCheck/><Text>Up to date</Text></HStack>: <HStack><FiActivity/><Text>Working on it</Text></HStack>}</StatHelpText>
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
