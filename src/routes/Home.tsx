import { Box, Button, Divider, Heading } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { InstrumentCard } from 'components/instrumentCard'
import { SessionRow } from 'components/sessionRow'
import { getAllSessionsData } from 'loaders/sessionClients'
import React, { useEffect } from 'react'
import { useNavigate, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'

type Session = components['schemas']['Session']
export const Home = () => {
  const instrumentName = sessionStorage.getItem('instrumentName')
  const queryKey = ['homepageSessions', instrumentName]
  const queryFn = () => getAllSessionsData(instrumentName ? instrumentName : '')

  const preloadedData = useLoaderData()
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    initialData: preloadedData,
    enabled: !!instrumentName,
    staleTime: 0, // Always refetch on mount unless preloaded
  })

  const navigate = useNavigate()

  // Load sessions for current instrument and sort them by session ID
  const sessions = data as {
    current: Session[]
  } | null
  const [sortedSessions, setSortedSessions] = React.useState<Session[] | null>(
    null
  )
  useEffect(() => {
    // Skip if sessions is still null
    if (!sessions) return
    // Sort by session ID in descending order
    setSortedSessions([...sessions.current].sort((a, b) => b.id - a.id))
  }, [sessions])

  if (isLoading) return <p>Loading sessions...</p>
  if (isError || !data) return <p>Failed to load sessions.</p>

  return (
    <div className="rootContainer">
      <title>Murfey</title>
      {/* Parent container for page contents */}
      <Box
        className="homeRoot"
        overflow="auto"
        display="flex"
        flexDirection="column"
        flex="1"
      >
        {/* Sessions title bar */}
        <Box
          bg="murfey.700"
          w="100%"
          px={{
            base: 8,
            md: 16,
          }}
          py={4}
          display="flex"
          flexDirection="column"
          alignItems="start"
          justifyContent="start"
          gap={2}
        >
          <Heading color="murfey.50" fontSize="3xl" lineHeight={1}>
            Murfey Sessions
          </Heading>
          <Heading
            color="murfey.50"
            fontSize="md"
            fontWeight="200"
            lineHeight={1}
          >
            Microscope Data Transfer Control System
          </Heading>
          <Button
            variant="onBlue"
            maxW="200px"
            textAlign="center"
            onClick={() => {
              navigate(`../instruments/${instrumentName}/new_session`)
            }}
          >
            New Session
          </Button>
        </Box>
        {/* Sessions page contents */}
        <Box
          p={4}
          flex="1"
          display="flex"
          flexDirection="row"
          alignItems="start"
          justifyContent="space-evenly"
          gap={{
            base: 8,
            md: 32,
          }}
          overflow="auto"
        >
          {/* Left column showing known Murfey sessions */}
          <Box
            minW="400px"
            maxW="600px"
            flex="1"
            pl={{
              base: 12,
              md: 20,
            }}
            display="flex"
            flexDirection="column"
            alignItems="start"
            justifyContent="start"
            gap={4}
            overflow="auto"
          >
            <Heading
              textAlign="left"
              w="100%"
              fontSize="2xl"
              mt={12}
              lineHeight={1}
            >
              Existing Sessions
            </Heading>
            <Divider borderColor="murfey.300" />
            {/* Display sessions in descending order of session ID */}
            {sortedSessions && sortedSessions.length > 0 ? (
              sortedSessions.map((current) => {
                return (
                  <SessionRow
                    session={current}
                    instrumentName={instrumentName}
                  />
                )
              })
            ) : (
              <Heading w="100%" py={4} variant="notFound">
                No sessions found
              </Heading>
            )}
          </Box>
          {/* Right column showing instrument card */}
          <Box minW="300px" maxW="600px" flex="1" overflow="auto">
            <InstrumentCard />
          </Box>
        </Box>
      </Box>
    </div>
  )
}
