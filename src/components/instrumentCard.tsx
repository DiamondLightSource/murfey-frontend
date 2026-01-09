import { Box, Card, Image, Text } from '@chakra-ui/react'
import { getInstrumentName } from 'loaders/general'
import React, { useEffect } from 'react'

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
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
      // Mag table is disabled until backend is fixed
      // onClick={() => {
      //   navigate(`../mag_table`)
      // }}
    >
      <Box
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={4}
      >
        <Box
          w="100%"
          display="flex"
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Image
            src={getUrl(
              `display/instruments/${sessionStorage.getItem('instrumentName')}/image/`
            )}
            objectFit="contain"
            maxW="100%"
            maxH="500px"
          />
        </Box>
        <Text align="center">{instrumentName}</Text>
      </Box>
    </Card>
  )
}
