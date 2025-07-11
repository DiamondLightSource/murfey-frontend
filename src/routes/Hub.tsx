import {
  Card,
  CardBody,
  CardHeader,
  Image,
  Text,
  HStack,
  Heading,
  VStack,
  Box,
  SimpleGrid,
} from '@chakra-ui/react'

import { TbMicroscope, TbSnowflake } from 'react-icons/tb'
import { useLoaderData, useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'

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
      navigate(
        `/home?instrumentName=${encodeURIComponent(iinfo.instrument_name)}`
      )
    } else {
      navigate(`/login`, { replace: true })
    }
  }

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
          </HStack>
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
        {instrumentInfo ? (
          instrumentInfo.map((ini) => {
            return (
              <Card
                w={{ base: '100%', md: '19.6%' }}
                _hover={{ textDecor: 'none' }}
                align="center"
                onClick={() => navigateToInstrumentHome(ini)}
              >
                <CardHeader>
                  <Image
                    src={getUrl(`instrument/${ini.instrument_name}/image`)}
                  />
                </CardHeader>
                <CardBody>
                  <Text>{ini.display_name}</Text>
                </CardBody>
              </Card>
            )
          })
        ) : (
          <></>
        )}
      </SimpleGrid>
    </Box>
  )
}
