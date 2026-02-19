import { Card, Badge, Box, Button, Heading, Text } from '@chakra-ui/react'

import { components } from 'schema/main'

type AcquisitionParameters =
  components['schemas']['GridParameters']

export const AcquisitionParametersCard = (
  acquisitionParameters: AcquisitionParameters,  
) => {

  return (
    // Display upstream visits for a single instrument
    // Parameters to take: instrument name and upstream visits dict
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

