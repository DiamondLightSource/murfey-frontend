import { Card, CardBody, Button, CardHeader } from '@chakra-ui/react'
import { getUpstreamVisits, upstreamDataDownloadRequest } from 'loaders/general'
import React, { useCallback, useEffect } from 'react'
import { MdFileDownload } from 'react-icons/md'

interface SessionId {
  sessid: number
}

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
    <Card>
      <CardHeader>{instrumentName}</CardHeader>
      {/* Map each visit to a button */}
      {Object.entries(instrumentVisits).map(
        ([visitName, visitPath]: [string, string]) => {
          return (
            <CardBody>
              <Button
                rightIcon={<MdFileDownload />}
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
            </CardBody>
          )
        }
      )}
    </Card>
  )
}

export const UpstreamVisitsCard = ({ sessid }: SessionId) => {
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
    <Card alignItems="center">
      <CardHeader>Upstream Visit Data Download</CardHeader>
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
    </Card>
  ) : (
    <></>
  )
}
