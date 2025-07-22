import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Link,
  VStack,
} from '@chakra-ui/react'
import { InstrumentCard } from 'components/instrumentCard'
import { SessionRow } from 'components/sessionRow'
import { Link as LinkRouter, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'

type Session = components['schemas']['Session']
export const Home = () => {
  // Set up loaders
  const sessions = useLoaderData() as {
    current: Session[]
  } | null

  return (
    <div className="rootContainer">
      <title>Murfey</title>
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack
              bg="murfey.700"
              justifyContent="start"
              alignItems="start"
              display="flex"
              w="100%"
              px="10vw"
              py="1vh"
            >
              <Heading size="xl" color="murfey.50">
                Murfey Sessions
              </Heading>
              <Heading pt="2vh" color="murfey.50" fontWeight="200" size="md">
                Microscope Data Transfer Control System
              </Heading>
              <Link
                w={{ base: '100%', md: '19.6%' }}
                _hover={{ textDecor: 'none' }}
                as={LinkRouter}
                to={`../instruments/${sessionStorage.getItem('instrumentName')}/new_session`}
              >
                <Button variant="onBlue">New session</Button>
              </Link>
            </VStack>

            <HStack w="100%" display="flex" px="10vw">
              <VStack mt="0 !important" w="100%" px="10vw" display="flex">
                <Heading textAlign="left" w="100%" size="lg">
                  {'Existing Sessions'}
                </Heading>
                <Divider borderColor="murfey.300" />
                {sessions && sessions.current.length > 0 ? (
                  sessions.current.map((current) => {
                    return (
                      <VStack w="100%" spacing={5}>
                        {SessionRow(current)}
                      </VStack>
                    )
                  })
                ) : (
                  <VStack w="100%">
                    <Heading w="100%" py={4} variant="notFound">
                      No sessions found
                    </Heading>
                  </VStack>
                )}
              </VStack>
              <InstrumentCard />
            </HStack>
          </VStack>
        </Box>
      </Box>
    </div>
  )
}
