
import {
    Card,
    CardBody,
    CardHeader,
    Image,
    Link,
    Text
} from '@chakra-ui/react'

import { Link as LinkRouter } from 'react-router-dom'
import { InstrumentInfo } from 'utils/types'


const getUrl = (endpoint: string) => {
    return process.env.REACT_APP_HUB_ENDPOINT + endpoint
}


type InstrumentInfoCardProps = {
    sessionStorageSetup: (ininfo: InstrumentInfo) => void
    ini: InstrumentInfo
}

export function InstrumentInfoCard({ sessionStorageSetup, ini }: InstrumentInfoCardProps) {
    const imgUrl = getUrl(
        `instrument/${ini.instrument_name}/image`
    )
    const linkTarget = process.env.REACT_APP_BACKEND_AUTH_TYPE ===
        'cookie'
        ? `/home`
        : `/login`

    return <Link
        w={{ base: '100%', md: '19.6%' }}
        _hover={{ textDecor: 'none' }}
        as={LinkRouter}
        to={linkTarget}
    >
        <Card
            align="center"
            onClick={() => sessionStorageSetup(ini)}
        >
            <CardHeader>
                <Image
                    src={imgUrl} />
            </CardHeader>
            <CardBody>
                <Text>{ini.display_name}</Text>
            </CardBody>
        </Card>
    </Link>
}
