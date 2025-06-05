import { Card, CardBody, CardHeader, Image, Link, Text } from '@chakra-ui/react'

import { getInstrumentName } from 'loaders/general'
import { Link as LinkRouter } from 'react-router-dom'

import { useEffect } from 'react'
import { getUrlFromSessionStorage } from './getUrlFromSessionStorage'



const InstrumentCard = () => {
    const [instrumentName, setInstrumentName] = useState<string>('')

    const resolveName = async () => {
        const name: string = await getInstrumentName()
        setInstrumentName(name)
    }
    useEffect(() => {
        resolveName()
    }, [])

    const imgUrl = getUrlFromSessionStorage(
        `display/instruments/${sessionStorage.getItem('instrumentName')}/image/`
    )
    return (
        <Link
            key="ag_table"
            _hover={{ textDecor: 'none' }}
            as={LinkRouter}
            to={`../mag_table`}
        >
            <Card align="center">
                <CardHeader>
                    <Image
                        src={imgUrl}
                    />
                </CardHeader>
                <CardBody>
                    <Text>{instrumentName}</Text>
                </CardBody>
            </Card>
        </Link>
    )
}

export { InstrumentCard }
