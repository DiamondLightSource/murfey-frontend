import { Card, CardBody, Button, CardHeader } from '@chakra-ui/react'

import { getUpstreamVisits, upstreamDataDownloadRequest } from 'loaders/general'
import { MdFileDownload } from 'react-icons/md'

import React, { useEffect } from 'react'

interface SessionId {
    sessid: number
}

const UpstreamVisitCard = ({ sessid }: SessionId) => {
    const [upstreamVisits, setUpstreamVisits] = React.useState<Record<string, any>>({})

    const resolveVisits = async () => {
        const visits = await getUpstreamVisits(sessid)
        setUpstreamVisits(visits)
        console.log(upstreamVisits)
    }
    useEffect(() => {
        resolveVisits()
    }, [])

    const keys = Object.keys(upstreamVisits);

    if (keys.length == 0) {
        return <div> No visits available to download data for</div>
    }

    return <Card alignItems="center">
        <CardHeader>Upstream Visit Data Download</CardHeader>
        {keys.map((visitName) =>
            <CardBody>
                <Button
                    rightIcon={<MdFileDownload />}
                    onClick={() =>
                        upstreamDataDownloadRequest(visitName, sessid)
                    }
                >
                    {visitName}
                </Button>
            </CardBody>
        )
        }
    </Card>
}

export { UpstreamVisitCard }
