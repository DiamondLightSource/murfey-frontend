import { Card, CardBody, Button, CardHeader } from '@chakra-ui/react'
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
  // Display upstream visits for a single instrument
  // Parameters to take: instrument name and upstream visits dict
  return (
    <Card alignItems="left" cursor={'default'}>
      <CardHeader fontWeight="bold" cursor="default">
        {displayName}
      </CardHeader>
      <CardBody cursor="default">
        {/* Map each visit to a button */}
        {Object.entries(instrumentVisits).map(
          ([visitName, visitPath]: [string, string]) => {
            return (
              <Button
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
        )}
      </CardBody>
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

  return upstreamVisits && instrumentInfo ? (
    <Card alignItems="left" cursor={'default'}>
      <CardHeader fontWeight="bold" cursor="default">
        Upstream Visit Data Download
      </CardHeader>
      <CardBody cursor="default">
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
      </CardBody>
    </Card>
  ) : (
    <></>
  )
}
