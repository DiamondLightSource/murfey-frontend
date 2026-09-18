import { Button, Box, RadioGroup, Radio, Heading } from '@chakra-ui/react'
import { getForm } from 'components/forms'
import { SetupStepper } from 'components/setupStepper'
import { startMultigridWatcher } from 'loaders/multigridSetup'
import { getProcessingParameterData } from 'loaders/processingParameters'
import { updateSession } from 'loaders/sessionClients'
import { registerProcessingParameters } from 'loaders/sessionSetup'
import React from 'react'
import { useNavigate, useParams, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'

type SessionClients = components['schemas']['SessionClients']
type ProvidedProcessingParameters =
  components['schemas']['ProvidedProcessingParameters']

export const SessionSetup = () => {
  const sessionClients = useLoaderData() as SessionClients | null
  const [expType, setExpType] = React.useState('spa')
  const [procParams, setProcParams] = React.useState()
  const { sessid } = useParams()
  const [paramsSet, setParamsSet] = React.useState(false)

  const navigate = useNavigate()

  const handleSelection = (formData: any) => {
    if (typeof sessid !== 'undefined') {
      delete formData.type
      registerProcessingParameters(
        formData as ProvidedProcessingParameters,
        parseInt(sessid)
      )
      startMultigridWatcher(parseInt(sessid))
      setParamsSet(true)
    }
  }

  const handleSkip = async () => {
    if (sessid !== undefined) {
      await updateSession(parseInt(sessid), false)
      startMultigridWatcher(parseInt(sessid))
    }
  }

  if (sessionClients)
    getProcessingParameterData(sessionClients.session.id.toString()).then(
      (params) => setProcParams(params)
    )
  const activeStep = sessionClients
    ? procParams
      ? 4
      : sessionClients.session.visit
        ? 3
        : 0
    : 3
  return (
    <div className="rootContainer">
      {/* Parent container for page contents */}
      <Box
        className="homeRoot"
        overflow="auto"
        display="flex"
        flexDirection="column"
        flex="1"
        bg="murfey.50"
      >
        {/* Page title bar */}
        <Box
          bg="murfey.700"
          w="100%"
          px={{
            base: 8,
            md: 16,
          }}
          py={4}
          display="flex"
          flexDirection="column"
          alignItems="start"
          justifyContent="start"
          gap={2}
        >
          <Heading size="xl" color="murfey.50">
            Set Processing Parameters
          </Heading>
        </Box>
        {/* Overflow container for page contents */}
        <Box overflow="auto" minW={0} flex="1">
          {/* Page contents */}
          <Box
            w="100%"
            minW="1000px"
            p={8}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="start"
            gap={8}
          >
            {/* Setup steps progress indicator */}
            <Box w="80%" minW="960px">
              <SetupStepper activeStepIndex={1} />
            </Box>
            {/* Parameters forms */}
            <Box
              w="80%"
              minW="600px"
              display="flex"
              flexDirection="column"
              alignItems="start"
              justifyContent="start"
              gap={4}
            >
              {/* Toggle between SPA and tomography parameters */}
              <RadioGroup
                onChange={setExpType}
                value={expType}
                colorScheme="murfey"
                isDisabled={activeStep !== 3 ? true : false}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="start"
                  justifyContent="start"
                  gap={2}
                >
                  <Radio value="spa">SPA</Radio>
                  <Radio value="tomography">Tomography</Radio>
                </Box>
              </RadioGroup>
              {/* Selected processing parameters form */}
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={'murfey.400'}
                display={'flex'}
                justifyContent={'start'}
                alignItems={'start'}
              >
                {sessid ? getForm(expType, handleSelection) : <></>}
              </Box>
              {/* Bottom row of buttons */}
              <Box
                display={'flex'}
                flexDirection="row"
                alignItems={'left'}
                justifyContent={'left'}
                gap={4}
              >
                <Button
                  variant="default"
                  isDisabled={!paramsSet}
                  onClick={() => navigate(`../sessions/${sessid}`)}
                >
                  Go to Session
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSkip().then(() => {
                      navigate(`../sessions/${sessid}`)
                    })
                  }}
                >
                  Disable Processing
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  )
}
