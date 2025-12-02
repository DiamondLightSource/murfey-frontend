import { Card, CardBody, Image, Text } from '@chakra-ui/react'
import { getInstrumentName } from 'loaders/general'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const getUrl = (endpoint: string) => {
  return (
    (sessionStorage.getItem('murfeyServerURL') ??
      process.env.REACT_APP_API_ENDPOINT) + endpoint
  )
}

export const InstrumentCard = () => {
  const [instrumentName, setInstrumentName] = React.useState('')

  const navigate = useNavigate()

  const resolveName = async () => {
    const name: string = await getInstrumentName()
    setInstrumentName(name)
  }
  useEffect(() => {
    resolveName()
  }, [])

  return (
    <Card
      key="ag_table"
      align="center"
      cursor="pointer"
      onClick={() => {
        navigate(`../mag_table`)
      }}
    >
      <CardBody
        h="100%"
        p={4}
        display="flex"
        flexDirection="column"
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
      </CardBody>
    </Card>
  )
}
