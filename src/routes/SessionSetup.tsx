import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getForm } from 'components/forms'
import { SetupStepper } from 'components/setupStepper'
import { startMultigridWatcher } from 'loaders/multigridSetup'
import { getProcessingParameterData } from 'loaders/processingParameters'
import { updateSession } from 'loaders/sessionClients'
import { registerProcessingParameters } from 'loaders/sessionSetup'
import React from 'react'
import { Link as LinkRouter, useParams, useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type SessionClients = components['schemas']['SessionClients']
type ProvidedProcessingParameters =
  components['schemas']['ProvidedProcessingParameters']

export const SessionSetup = () => {
  const sessionClients = useLoaderData() as SessionClients | null
  const [expType, setExpType] = React.useState('spa')
  const [procParams, setProcParams] = React.useState()
  const { sessid } = useParams()
  const [paramsSet, setParamsSet] = React.useState(false)

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
      <Box sx={{ width: '100%', bgcolor: colours.murfey[50].default }}>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Box className="homeRoot">
            <Box
              sx={{
                bgcolor: colours.murfey[700].default,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                px: '10vw',
                py: '1vh',
              }}
            >
              <Typography
                variant="h4"
                sx={{ color: colours.murfey[50].default }}
              >
                Processing parameters
              </Typography>
            </Box>
          </Box>
        </Box>
        <Stack>
          <Box
            sx={{
              mt: '1em',
              px: '10vw',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SetupStepper activeStepIndex={activeStep} />
          </Box>
          <Box
            sx={{
              mt: '1em',
              px: '10vw',
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <RadioGroup
              onChange={(e) => setExpType(e.target.value)}
              value={expType}
            >
              <Stack>
                <FormControlLabel
                  value="spa"
                  control={<Radio disabled={activeStep !== 3} />}
                  label="SPA"
                />
                <FormControlLabel
                  value="tomography"
                  control={<Radio disabled={activeStep !== 3} />}
                  label="Tomography"
                />
              </Stack>
            </RadioGroup>
          </Box>
          <Box
            sx={{
              mt: '1em',
              ml: '10vw',
              width: '80%',
              border: '1px solid',
              borderRadius: 1,
              overflow: 'hidden',
              padding: '10px',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              display: 'flex',
              borderColor: colours.murfey[400].default,
            }}
          >
            {sessid ? getForm(expType, handleSelection) : <></>}
          </Box>
          <Box
            sx={{
              mt: '1em',
              px: '10vw',
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              display: 'flex',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              disabled={!paramsSet}
              component={LinkRouter}
              to={`../sessions/${sessid}`}
              sx={{ bgcolor: colours.murfey[600].default }}
            >
              Next
            </Button>
            <Button
              variant="text"
              component={LinkRouter}
              to={`../sessions/${sessid}`}
              onClick={handleSkip}
            >
              Disable Processing
            </Button>
          </Box>
        </Stack>
      </Box>
    </div>
  )
}
