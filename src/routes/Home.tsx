import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Link,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { InstrumentCard } from 'components/instrumentCard'
import { SessionRow } from 'components/sessionRow'
import { getAllSessionsData } from 'loaders/sessionClients'
import { Link as LinkRouter } from 'react-router-dom'
import { components } from 'schema/main'

type Session = components['schemas']['Session']
export const Home = () => {
  const instrumentName = sessionStorage.getItem('instrumentName')
  const queryKey = ['homepageSessions', instrumentName]
  const queryFn = () => getAllSessionsData(instrumentName ? instrumentName : '')

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    enabled: !!instrumentName,
    staleTime: 0, // Always refetch on mount unless preloaded
  })

  if (isLoading) return <p>Loading sessions...</p>
  if (isError || !data) return <p>Failed to load sessions.</p>

  const sessions = data as {
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
                to={`../instruments/${instrumentName}/new_session`}
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
                        <SessionRow
                          session={current}
                          instrumentName={instrumentName}
                        />
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
