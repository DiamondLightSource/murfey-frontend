import { Box, Card, Image, Text } from '@chakra-ui/react'
import { getInstrumentName } from 'loaders/general'
import React, { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

const getUrl = (endpoint: string) => {
  return (
    (sessionStorage.getItem('murfeyServerURL') ??
      process.env.REACT_APP_API_ENDPOINT) + endpoint
  )
}

export const InstrumentCard = () => {
  const [instrumentName, setInstrumentName] = React.useState('')

  // const navigate = useNavigate()

  const resolveName = async () => {
    const name: string = await getInstrumentName()
    setInstrumentName(name)
  }
  useEffect(() => {
    resolveName()
  }, [])

  return (
    <Card
      key="mag_table"
      w="100%"
      p={4}
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
      // onClick={() => {
      //   navigate(`../mag_table`)
      // }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
        <Image
          src={getUrl(
            `display/instruments/${sessionStorage.getItem('instrumentName')}/image/`
          )}
          objectFit="contain"
          w="100%"
          h="100%"
        />
        <Text mt="auto" align="center">
          {instrumentName}
        </Text>
      </Box>
    </Card>
  )
}
