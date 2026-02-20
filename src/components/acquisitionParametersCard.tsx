import { Card, Badge, Box, Button, Heading, Text } from '@chakra-ui/react'

import { components } from 'schema/main'

type AcquisitionParameters =
  components['schemas']['GridParameters']

type AtlasOptics = components['schemas']['AtlasOptics']

export const AcquisitionParametersCard = (
  acquisitionParameters: AcquisitionParameters,  
) => {

  return (
    <Card
      display="flex"
      p={4}
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="left"
        justifyContent="left"
        gap={4}
      >
        <Heading fontSize="md" fontWeight="bold" lineHeight={1}>
          {acquisitionParameters.id}
        </Heading>
          <Text> Number of atlas tiles: ({acquisitionParameters.atlas_x}, {acquisitionParameters.atlas_y}) </Text>
          { acquisitionParameters.afis ? <Badge variant="solid" colorScheme="green"> AFIS </Badge> : <></> }
      </Box>
    </Card>
  )
}

export const AtlasOpticsSettingsCard = (
  atlasOptics: AtlasOptics,
) => {

  return (
    <Card
      display="flex"
      p={4}
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="left"
        justifyContent="left"
        gap={4}
      >
        <Heading fontSize="md" fontWeight="bold" lineHeight={1}>
          {Atlas Optics Settings: atlasOptics.name}
        </Heading>
          <Text> Magnification: {atlasOptics.mag} </Text>
          <Text> Number of atlas tiles: ({atlasOptics.tiles_x}, {atlasOptics.tiles_y}) </Text>
          <Text> Spot size: {atlasOptics.spot_size} </Text>
      </Box>
    </Card>

  )
}

