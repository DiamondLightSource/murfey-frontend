import { Table } from '@diamondlightsource/ui-components'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  updateSessionProcessingParameters,
  getSessionProcessingParameterData,
} from 'loaders/processingParameters'
import React from 'react'
import { Link as LinkRouter, useLoaderData, useParams } from 'react-router-dom'
import { components } from 'schema/main'
import { colours, onBlueButtonSx } from 'styles/colours'

type EditableSessionParameters =
  components['schemas']['EditableSessionProcessingParameters']

type ProcessingRow = {
  parameterName: string
  parameterValue?: string | number | boolean
}

type ProcessingTable = {
  processingRows: ProcessingRow[]
  tag: string
}

const nameLabelMap: Map<string, string> = new Map([
  ['dose_per_frame', 'Dose per frame [e- / \u212B]'],
  ['gain_ref', 'Gain Reference'],
  ['symmetry', 'Symmetry'],
  ['eer_fractionation_file', 'EER fractionation file (for motion correction)'],
  ['run_class3d', 'Run 3D classification?'],
])

export const SessionParameters = () => {
  // Load necessary data
  const { sessid } = useParams()
  const preloadedData = useLoaderData()
  const queryKey = ['processingParameters', sessid]
  const queryFn = () => getSessionProcessingParameterData(sessid)
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    initialData: preloadedData,
    staleTime: 0,
  })
  const sessionParams = data as EditableSessionParameters | null

  const queryClient = useQueryClient()

  // Set component hooks
  const [isOpen, setIsOpen] = React.useState(false)
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  // Construct parameters table to display
  let tableRows = [] as ProcessingRow[]
  type EditableParameter =
    | 'gain_ref'
    | 'dose_per_frame'
    | 'eer_fractionation_file'
    | 'symmetry'
    | 'run_class3d'
    | ''
  const [paramName, setParamName] = React.useState('')
  const [paramValue, setParamValue] = React.useState('')
  const [paramKey, setParamKey] = React.useState<EditableParameter>('')
  Object.entries(sessionParams ? sessionParams : {}).forEach(([key, value]) =>
    tableRows.push({
      parameterName: nameLabelMap.get(key) ?? key,
      parameterValue: value.toString(),
      parameterKey: key,
    } as ProcessingRow)
  )
  let table = { processingRows: tableRows, tag: 'Session' } as ProcessingTable

  const handleParameterEdit = async () => {
    const data = {
      gainRef: paramKey === 'gain_ref' ? paramValue : '',
      dosePerFrame:
        paramKey === 'dose_per_frame' ? parseFloat(paramValue) : null,
      eerFractionationFile:
        paramKey === 'eer_fractionation_file' ? paramValue : '',
      symmetry: paramKey === 'symmetry' ? paramValue : '',
      run_class3d: paramKey === 'run_class3d' ? paramValue : null,
    }
    await updateSessionProcessingParameters(sessid ?? '0', data)
    queryClient.refetchQueries({ queryKey: ['processingParameters', sessid] })
    onClose()
  }

  const editParameterDialogue = async (
    data: Record<string, any>,
    index: number
  ) => {
    setParamName(data['parameterName'])
    setParamValue(data['parameterValue'])
    console.log(data['parameterKey'])
    setParamKey(data['parameterKey'])
    onOpen()
  }

  if (isLoading) return <p>Loading processing parameters for session...</p>
  if (isError) return <p>Error loading processing parameters for session.</p>
  return (
    <div className="rootContainer">
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>
          Edit processing parameter
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>{paramName}</Typography>
          <TextField
            value={paramValue}
            autoFocus
            size="small"
            sx={{ width: '80%' }}
            onChange={(v) => setParamValue(v.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => handleParameterEdit()}
            sx={{ bgcolor: colours.murfey[600].default }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Box
        className="homeRoot"
        sx={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          bgcolor: colours.murfey[50].default,
        }}
      >
        <Box
          sx={{
            bgcolor: colours.murfey[700].default,
            width: '100%',
            px: { xs: 4, md: 8 },
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            gap: 1,
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: colours.murfey[50].default, lineHeight: 1 }}
          >
            Session Processing Parameters
          </Typography>
          <Button
            component={LinkRouter}
            to="extra_parameters"
            variant="outlined"
            sx={onBlueButtonSx}
          >
            Extra Parameters
          </Button>
        </Box>
        <Table
          data={table.processingRows}
          headers={[
            { key: 'parameterName', label: 'Parameter' },
            { key: 'parameterValue', label: 'Value' },
          ]}
          label={'sessionParameterData'}
          onClick={editParameterDialogue}
        />
      </Box>
    </div>
  )
}
