import { Card, CardBody, Button, CardHeader } from '@chakra-ui/react'
import { getUpstreamVisits, upstreamDataDownloadRequest } from 'loaders/general'
import React, { useCallback, useEffect } from 'react'
import { MdFileDownload } from 'react-icons/md'

interface SessionId {
  sessid: number
}

export const UpstreamVisitCard = ({ sessid }: SessionId) => {
  const [upstreamVisits, setUpstreamVisits] = React.useState({})

  const resolveVisits = useCallback(async () => {
    const visits = await getUpstreamVisits(sessid)
    setUpstreamVisits(visits)
    console.log(visits)
  }, [sessid])
  useEffect(() => {
    resolveVisits()
  }, [sessid, resolveVisits])

  return upstreamVisits ? (
    <Card alignItems="center">
      <CardHeader>Upstream Visit Data Download</CardHeader>
      {Object.keys(upstreamVisits).map((k) => {
        return (
          <CardBody>
            <Button
              rightIcon={<MdFileDownload />}
              onClick={() => upstreamDataDownloadRequest(k, sessid)}
            >
              {k}
            </Button>
          </CardBody>
        )
      })}
    </Card>
  ) : (
    <></>
  )
}
