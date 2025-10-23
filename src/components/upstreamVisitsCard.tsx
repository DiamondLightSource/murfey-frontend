import { Card, CardBody, Button, CardHeader } from '@chakra-ui/react'
import { getUpstreamVisits, upstreamDataDownloadRequest } from 'loaders/general'
import React, { useCallback, useEffect } from 'react'
import { MdFileDownload } from 'react-icons/md'

const InstrumentUpstreamVisitsCard = ({
  sessid,
  instrumentName,
  instrumentVisits,
}: {
  sessid: number
  instrumentName: string
  instrumentVisits: Record<string, string>
}) => {
  // Display upstream visits for a single instrument
  // Parameters to take: instrument name and upstream visits dict
  console.log(instrumentVisits)
  return (
    <Card alignItems="left" cursor={'default'}>
      <CardHeader fontWeight="bold" cursor="default">
        {instrumentName}
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
    console.log(visits)
  }, [sessid])

  useEffect(() => {
    resolveVisits()
  }, [sessid, resolveVisits])

  return upstreamVisits ? (
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
