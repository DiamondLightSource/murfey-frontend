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
import { SetupStepper } from 'components/setupStepper'
import { startMultigridWatcher } from 'loaders/multigridSetup'
import { getProcessingParameterData } from 'loaders/processingParameters'
import { registerProcessingParameters } from 'loaders/sessionSetup'
import React from 'react'
import { Link as LinkRouter, useParams, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'

type AtlasOptics = components['schemas']['AtlasOptics']

export const AtlasOpticsSetup = () => {
  const atlasOpticsSettings = useLoaderData() as AtlasOptics[] | null
  const [atlasParams, setAtlasParams] = React.useState()
  const { sessid } = useParams()
  const [paramsSet, setParamsSet] = React.useState(false)

  const handleSelection = (formData: any) => {
    if (typeof sessid !== 'undefined') {
      delete formData.type
      registerAtlasOpticsParameters(
        formData as ProvidedAtlasOpticsParameters,
        parseInt(sessid)
      )
      setParamsSet(true)
    }
  }

  const activeStep = 5

  return (
    <div className="rootContainer">
      {
        atlasOpticsSettings && atlasOpticsSettings.length > 0 ? (
          atlasOpticsSettings.map((o) => (<AtlasOpticsSettingsCard atlasOptics={o}/>))
        ): <></>
      }
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
            <Link
              w={{ base: '100%', md: '19.6%' }}
              key={sessid}
              _hover={{ textDecor: 'none' }}
              as={LinkRouter}
              to={`../sessions/${sessid}`}
            >
              <Button variant="default" isDisabled={!paramsSet}>
                Next
              </Button>
            </Link>
            <Link
              w={{ base: '100%', md: '19.6%' }}
              key={sessid}
              _hover={{ textDecor: 'none' }}
              as={LinkRouter}
              to={`../sessions/${sessid}`}
            >
            </Link>
          </Box>
        </Stack>
      </Box>
    </div>
  )
}
