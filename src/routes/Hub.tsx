import {
  Card,
  CardBody,
  Flex,
  Image,
  Text,
  HStack,
  Heading,
  VStack,
  Box,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { useLoaderData, useNavigate } from 'react-router-dom'

const getUrl = (endpoint: string) => {
  return process.env.REACT_APP_HUB_ENDPOINT + endpoint
}

type InstrumentInfo = {
  instrument_name: string
  display_name: string
  instrument_url: string
}

export const Hub = () => {
  const instrumentInfo = useLoaderData() as InstrumentInfo[]
  const navigate = useNavigate()

  // When first landing on this page, clear stored session info from browser
  useEffect(() => {
    sessionStorage.removeItem('murfeyServerURL')
    sessionStorage.removeItem('instrumentName')
  }, [])

  const navigateToInstrumentHome = (iinfo: InstrumentInfo) => {
    // Update browser session storage info
    sessionStorage.setItem('murfeyServerURL', iinfo.instrument_url + '/')
    sessionStorage.setItem('instrumentName', iinfo.instrument_name)

    // Direct users to /login only if authenticating with 'password'
    if (process.env.REACT_APP_BACKEND_AUTH_TYPE === 'cookie') {
      navigate(`/home`)
    } else {
      navigate(`/login`, { replace: true })
    }
  }

  return (
    // Start with a Box spanning width and height of browser window
    <Box
      w="100vw"
      h="100vh"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Title Bar */}
      <VStack
        alignItems="start"
        justifyContent="center"
        display="flex"
        w="100%"
        h={24}
        px={{
          base: 8,
          md: 32,
        }}
        py={4}
        bg="murfey.700"
      >
        <Heading fontSize="3xl" w="100%" color="murfey.50">
          <HStack>
            <TbSnowflake />
            <TbMicroscope />
          </HStack>
          Murfey Hub
        </Heading>
      </VStack>
      {/* Main body of Hub page showing the instruments */}
      {/* Allow horizontal overflow of instrument Cards*/}
      <Box w="100%" flex="1" overflowX="auto" overflowY="hidden">
        <Flex direction="row" align="stretch" h="80%" p={4} gap={4} mr={4}>
          {instrumentInfo ? (
            instrumentInfo.map((ini) => {
              return (
                <Card
                  minW="300px"
                  maxW="600px"
                  h="100%"
                  cursor="pointer"
                  onClick={() => navigateToInstrumentHome(ini)}
                >
                  <CardBody
                    p={4}
                    gap={4}
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    height="100%"
                  >
                    <Image
                      src={getUrl(`instrument/${ini.instrument_name}/image`)}
                      objectFit="contain"
                      w="100%"
                      h="100%"
                    />
                    <Text mt="auto" align="center">
                      {ini.display_name}
                    </Text>
                  </CardBody>
                </Card>
              )
            })
          ) : (
            <></>
          )}
        </Flex>
      </Box>
    </Box>
  )
}
