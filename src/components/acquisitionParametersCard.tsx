import { Card, Badge, Box, Button, Heading, IconButton, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react'

import { MdDensityMedium } from 'react-icons/md'

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
      bg='#00A6A6'
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
    >
      <Box
        w="100%"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
      >
        <Heading fontSize="md" fontWeight="bold" lineHeight={1}>
          Atlas Optics Settings: {atlasOptics.atlasOptics.name} ({atlasOptics.atlasOptics.id})
        </Heading>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Atlas optics settings control options"
              icon={<MdDensityMedium />}
            />
            <MenuList>
                <>
                  <MenuItem>
                    Delete settings
                  </MenuItem>
                </>
            </MenuList>
          </Menu>
        </Box>
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="start"
          justifyContent="start"
          gap={2}
        >
          <Text> Magnification: {atlasOptics.atlasOptics.mag} </Text>
          <Text> Number of atlas tiles: ({atlasOptics.atlasOptics.tiles_x}, {atlasOptics.atlasOptics.tiles_y}) </Text>
          <Text> Spot size: {atlasOptics.atlasOptics.spot_size} </Text>
          <Text> C2: {atlasOptics.atlasOptics.c2_percentage} % </Text>
      </Box>
    </Card>

  )
}

