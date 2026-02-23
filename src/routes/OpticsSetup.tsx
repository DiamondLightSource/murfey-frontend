import {
  Button,
  Box,
  RadioGroup,
  Radio,
  Stack,
  Link,
  VStack,
  Heading,
} from '@chakra-ui/react'
import { AtlasOpticsSettingsCard } from 'components/acquisitionParametersCard'
import { getForm } from 'components/forms'
import { HoleTemplate } from 'components/holeTemplate'
import { SetupStepper } from 'components/setupStepper'
import { addAtlasOpticsSettings } from 'loaders/acquisitionParameters'
import React from 'react'
import { Link as LinkRouter, useParams, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'

type AtlasOptics = components['schemas']['AtlasOptics']
type AtlasOpticsData = components['schemas']['AtlasOpticsData']

export const AtlasOpticsSetup = () => {
  const atlasOpticsSettings = useLoaderData() as AtlasOptics[] | null
  const [atlasParams, setAtlasParams] = React.useState()
  const { sessid } = useParams()

  console.log(atlasOpticsSettings)

  const handleSelection = (formData: any) => {
    if (typeof sessid !== 'undefined') {
      delete formData.type
      addAtlasOpticsSettings(
        formData as AtlasOpticsData,
        parseInt(sessid)
      )
    }
  }

  const activeStep = 5

  return (
    <div className="rootContainer">
      {atlasOpticsSettings && atlasOpticsSettings.length > 0 ? (
        atlasOpticsSettings.map((o) => (
          <AtlasOpticsSettingsCard atlasOptics={o} />
        ))
      ) : (
        <></>
      )}
      <Box w="100%" bg="murfey.50">
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack
              bg="murfey.700"
              justifyContent="start"
              alignItems="start"
              display="flex"
              w="100%"
              px="10vw"
              py="1vh"
            >
              <Heading size="xl" color="murfey.50">
                Acquisition parameters
              </Heading>
            </VStack>
          </VStack>
        </Box>
        <Stack>
          <Box
            mt="1em"
            px="10vw"
            w="100%"
            justifyContent={'center'}
            alignItems={'center'}
          >
            <SetupStepper activeStepIndex={activeStep} />
          </Box>
          <Box
            p={4}
            w="100%"
            flex="1"
            display="grid"
            gridTemplateColumns={{
              base: 'repeat(1, minmax(200px, 600px))',
              sm: 'repeat(2, minmax(200px, 600px))',
              md: 'repeat(3, minmax(200px, 600px))',
              lg: 'repeat(4, minmax(200px, 600px))',
            }}
            justifyContent="center"
            overflowY="auto"
            gap={4}
          >
          {
            atlasOpticsSettings && atlasOpticsSettings.length > 0 ? (
            atlasOpticsSettings.map((o) => (<AtlasOpticsSettingsCard atlasOptics={o}/>))
            ): <></>
          }
          </Box>
          <Box
            mt="1em"
            ml="10vw"
            w="80%"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            padding="10px"
            justifyContent={'left'}
            alignItems={'left'}
            display={'flex'}
            borderColor={'murfey.400'}
          >
            {sessid ? getForm('atlasoptics', handleSelection) : <></>}
          </Box>
          <Box
            mt="1em"
            px="10vw"
            w="100%"
            justifyContent={'left'}
            alignItems={'left'}
            display={'flex'}
          >
            <HoleTemplate width={200} height={200} />
          </Box>
          <Box
            mt="1em"
            px="10vw"
            w="100%"
            justifyContent={'left'}
            alignItems={'left'}
            display={'flex'}
          >
            <Link
              w={{ base: '100%', md: '19.6%' }}
              key={sessid}
              _hover={{ textDecor: 'none' }}
              as={LinkRouter}
              to={`../sessions/${sessid}`}
            >
              <Button variant="default">
                Add
              </Button>
            </Link>
            <Link
              w={{ base: '100%', md: '19.6%' }}
              key={sessid}
              _hover={{ textDecor: 'none' }}
              as={LinkRouter}
              to={`../sessions/${sessid}`}
            ></Link>
          </Box>
        </Stack>
      </Box>
    </div>
  )
}
