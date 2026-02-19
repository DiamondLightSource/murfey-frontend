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
import { getForm } from 'components/forms'
import { SetupStepper } from 'components/setupStepper'
import { startMultigridWatcher } from 'loaders/multigridSetup'
import { getProcessingParameterData } from 'loaders/processingParameters'
import { updateSession } from 'loaders/sessionClients'
import { registerProcessingParameters } from 'loaders/sessionSetup'
import React from 'react'
import { Link as LinkRouter, useParams, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'

type SessionClients = components['schemas']['SessionClients']
type ProvidedProcessingParameters =
  components['schemas']['ProvidedProcessingParameters']

export const AtlasOpticsSetup = () => {
  const sessionClients = useLoaderData() as SessionClients | null
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

  if (sessionClients)
    getProcessingParameterData(sessionClients.session.id.toString()).then(
      (params) => setProcParams(params)
    )
  const activeStep = sessionClients
    ? 5
      : sessionClients.session.visit
        ? 4
        : 0
  return (
    <div className="rootContainer">
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
