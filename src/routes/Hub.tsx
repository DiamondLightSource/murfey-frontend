import {
    Box,
    HStack,
    Heading,
    SimpleGrid,
    VStack
} from '@chakra-ui/react'
import { InstrumentInfoCard } from 'components/InstrumentInfoCard'

import { TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { useLoaderData } from 'react-router-dom'
import { InstrumentInfo } from 'utils/types'

const Hub = () => {
    const instrumentInfo = useLoaderData() as InstrumentInfo[]

    const sessionStorageSetup = (ininfo: InstrumentInfo) => {
        sessionStorage.setItem('murfeyServerURL', ininfo.instrument_url + '/')
        sessionStorage.setItem('instrumentName', ininfo.instrument_name)
    }

    // Direct users to /login only if authenticating with 'password'
    return (
        <Box w="100%" overflow="hidden">
            <VStack
                justifyContent="start"
                alignItems="start"
                display="flex"
                w="100%"
                px="10vw"
                py="1vh"
                bg="murfey.700"
            >
                <Heading size="xl" w="100%" color="murfey.50">
                    <HStack>
                        {' '}
                        <TbSnowflake /> <TbMicroscope />{' '}
                    </HStack>{' '}
                    Murfey Hub
                </Heading>
            </VStack>
            <SimpleGrid
                minChildWidth="250px"
                spacing={10}
                p={3}
                justifyContent="start"
                alignItems="start"
                display="flex"
                w="100%"
            >
                {instrumentInfo.length !== 0 ? (
                    instrumentInfo.map((i) => <InstrumentInfoCard sessionStorageSetup={sessionStorageSetup} ini={i} />)
                ) : (
                    <Heading>No instrument info available</Heading>
                )}
            </SimpleGrid>
        </Box>
    )
}

export { Hub }
