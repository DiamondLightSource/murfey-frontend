import { Table } from '@diamondlightsource/ui-components'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { SetupStepper } from 'components/setupStepper'
import { getMachineConfigData } from 'loaders/machineConfig'
import {
  prepareGainReference,
  transferGainReference,
  updateCurrentGainReference,
} from 'loaders/possibleGainRefs'
import React, { useEffect } from 'react'
import {
  Link as LinkRouter,
  useNavigate,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom'
import { CircleLoader } from 'react-spinners'
import { components } from 'schema/main'
import { colours } from 'styles/colours'
import { convertUTCToUKNaive, formatUTCISOToUKLocal } from 'utils/generic'

type File = components['schemas']['File']

export const GainRefTransfer = () => {
  const possibleGainRefs = useLoaderData() as File[] | null
  // Add new columns with the formatted timestamps
  const possibleGainRefsFormatted = possibleGainRefs
    ? possibleGainRefs.map((gainRefs) => ({
        ...gainRefs, // Preserve original table
        timestampFormatted: formatUTCISOToUKLocal(gainRefs.timestamp),
      }))
    : []
  let [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [processing, setProcessing] = React.useState(false)
  const [tag, setTag] = React.useState('')
  const [falcon, setFalcon] = React.useState(false)
  const [falconPreset, setFalconPreset] = React.useState(false)

  const SelectGainRef = async (data: Record<string, any>, index: number) => {
    setProcessing(true)
    const sessid = searchParams.get('sessid')
    const setup = searchParams.get('setup')
    if (sessid) {
      const transferStatus = await transferGainReference(
        parseInt(sessid),
        data['full_path']
      )
      if (transferStatus.success) {
        const preparedGainReference = await prepareGainReference(
          parseInt(sessid),
          data['full_path'],
          !falcon,
          falcon,
          tag
        )
        await updateCurrentGainReference(
          parseInt(sessid),
          preparedGainReference.gain_ref
        )
      }
    }
    if (setup) sessid ? navigate(`/new_session/setup/${sessid}`) : navigate('/')
    else sessid ? navigate(`/sessions/${sessid}`) : navigate('/')
    setProcessing(false)
  }

  if (!falconPreset) {
    setFalconPreset(true)
    getMachineConfigData().then((cfg) => setFalcon(cfg.camera === 'FALCON'))
  }

  // Construct a default tag based on the current datetime upon loading page
  useEffect(() => {
    const currentISOTime = new Date().toISOString()
    const currentUKTime = convertUTCToUKNaive(currentISOTime)
      .replaceAll(':', '')
      .replaceAll('-', '')
    console.log(`Current time is ${currentUKTime}`)
    setTag(currentUKTime)
  }, [])

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
                Possible Gain Reference Files
              </Typography>
            </Box>
          </Box>
        </Box>
        <Dialog open={processing} onClose={() => void 0}>
          <DialogTitle>Processing gain reference</DialogTitle>
          <DialogContent>
            <CircleLoader />
          </DialogContent>
        </Dialog>
        <Box
          sx={{
            mt: '1em',
            px: '10vw',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {searchParams.get('setup') ? (
            <SetupStepper activeStepIndex={1} />
          ) : null}
        </Box>
        <Box
          sx={{
            mt: '1em',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Tooltip title="Tag appended to gain reference name">
              <TextField
                placeholder={tag}
                size="small"
                sx={{ width: '50%' }}
                onChange={(e) => setTag(e.target.value)}
              />
            </Tooltip>
            <FormControlLabel
              control={
                <Checkbox
                  checked={falcon}
                  onChange={(e) => setFalcon(e.target.checked)}
                />
              }
              label="Falcon"
            />
            <Table
              width="80%"
              data={possibleGainRefsFormatted}
              headers={[
                { key: 'name', label: 'Name' },
                { key: 'timestampFormatted', label: 'Timestamp' },
                { key: 'size', label: 'Size [MB]' },
                { key: 'full_path', label: 'Full path' },
              ]}
              label={'gainRefData'}
              onClick={SelectGainRef}
            />
            <Button
              variant="text"
              component={LinkRouter}
              to={`../new_session/setup/${searchParams.get('sessid')}`}
            >
              Skip gain reference
            </Button>
          </Stack>
        </Box>
      </Box>
    </div>
  )
}
