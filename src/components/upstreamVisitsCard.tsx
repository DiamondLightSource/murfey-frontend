import { Card, Box, Button, Heading } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getUpstreamVisits, upstreamDataDownloadRequest } from 'loaders/general'
import { getInstrumentInfo } from 'loaders/general'
import React, { useCallback, useEffect } from 'react'
import { MdFileDownload } from 'react-icons/md'

const InstrumentUpstreamVisitsCard = ({
  sessid,
  instrumentName,
  displayName,
  instrumentVisits,
}: {
  sessid: number
  instrumentName: string
  displayName: string
  instrumentVisits: Record<string, string>
}) => {
  // Sort visits in ascending order
  const sortedVisits = Object.fromEntries(
    Object.entries(instrumentVisits).sort(([keyA], [keyB]) => {
      const [stringA, numberA] = keyA.split('-')
      const [stringB, numberB] = keyB.split('-')

      // Sort by visit name
      const stringComparison = stringA.localeCompare(stringB)
      if (stringComparison !== 0) return stringComparison

      // Sort by visit number
      return parseInt(numberA) - parseInt(numberB)
    })
  )

  return (
    // Display upstream visits for a single instrument
    // Parameters to take: instrument name and upstream visits dict
    <Card
      w="100%"
      p={4}
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="start"
        justifyContent="start"
        gap={4}
      >
        <Heading fontSize="md" fontWeight="bold" lineHeight={1}>
          {displayName}
        </Heading>
        {/* Map each visit to a button */}
        {/* Allow buttons to wrap horizontally*/}
        <Box
          flex="1"
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="start"
          justifyContent="start"
          gap={4}
        >
          {!!Object.keys(sortedVisits).length ? (
            Object.entries(sortedVisits).map(
              ([visitName, visitPath]: [string, string]) => {
                return (
                  <Button
                    variant="default"
                    rightIcon={<MdFileDownload />}
                    cursor="pointer"
                    onClick={() =>
                      upstreamDataDownloadRequest(
                        instrumentName,
                        sessid,
                        visitName,
                        visitPath
                      )
                    }
                  >
                    {visitName}
                  </Button>
                )
              }
            )
          ) : (
            <>No related visits found</>
          )}
        </Box>
      </Box>
    </Card>
  )
}

export const UpstreamVisitsCard = ({ sessid }: { sessid: number }) => {
  const [upstreamVisits, setUpstreamVisits] = React.useState<
    Record<string, Record<string, string>>
  >({})

  // Load all visits associated with current session
  const resolveVisits = useCallback(async () => {
    const visits = await getUpstreamVisits(sessid)
    if (!visits) return // Handle null or false-y cases
    setUpstreamVisits(visits)
  }, [sessid])

  useEffect(() => {
    resolveVisits()
  }, [sessid, resolveVisits])

  // Set up queryClient to load names of all instruments
  type InstrumentInfo = {
    instrument_name: string
    display_name: string
    instrument_url: string
  }
  const { data: instrumentInfo } = useQuery<InstrumentInfo[]>({
    queryKey: ['instrumentInfo'],
    queryFn: getInstrumentInfo,
    staleTime: 60000,
  })

  // Set up function to get the corresponding display name of the instrument
  const getDisplayName = (instrumentName: string) => {
    if (!instrumentInfo) return instrumentName
    const result = instrumentInfo.find(
      (item) => item.instrument_name === instrumentName
    )
    // Use instrument name if no results were found or if display name wasn't set
    return result
      ? result.display_name
        ? result.display_name
        : instrumentName
      : instrumentName
  }

  return !!Object.keys(upstreamVisits).length && !!instrumentInfo ? (
    <Card
      w="100%"
      p={4}
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="start"
        justifyContent="start"
        gap={4}
      >
        <Heading fontSize="md" fontWeight="bold" lineHeight={1}>
          Upstream Visit Data Download
        </Heading>
        {/* Map each instrument to its own card */}
        {Object.entries(upstreamVisits).map(
          ([instrumentName, instrumentVisits]: [
            string,
            Record<string, string>,
          ]) => {
            return (
              <InstrumentUpstreamVisitsCard
                sessid={sessid}
                instrumentName={instrumentName}
                displayName={getDisplayName(instrumentName)}
                instrumentVisits={instrumentVisits}
              />
            )
          }
        )}
      </Box>
    </Card>
  ) : (
    <></>
  )
}
