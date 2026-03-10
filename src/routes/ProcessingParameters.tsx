import { Table } from '@diamondlightsource/ui-components'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React from 'react'
import { MdEditNote } from 'react-icons/md'
import { useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type ProcessingDetails = components['schemas']['ProcessingDetails']

type ProcessingRow = {
  parameterName: string
  parameterValue?: string | number | boolean
}

type ProcessingTable = {
  processingRows: ProcessingRow[]
  tag: string
}

const nameLabelMap: Map<string, string> = new Map([
  ['pj_id', 'Processing Job ID'],
  ['angpix', 'Pixel Size [m]'],
  ['dose_per_frame', 'Dose per frame [e- / \u212B]'],
  ['gain_ref', 'Gain Reference'],
  ['voltage', 'Voltage [kV]'],
  ['motion_corr_binning', 'Motion correction binning factor'],
  ['eer_grouping', 'EER Grouping'],
  ['symmetry', 'Symmetry'],
  ['particle_diameter', 'Particle Diameter [\u212B]'],
  ['downscale', 'Downscaling During Extraction'],
  ['do_icebreaker_jobs', 'Perform IceBreaker Jobs'],
  ['boxsize', 'Box Size'],
  ['small_boxsize', 'Downscaled Box Size'],
  ['mask_diameter', 'Mask Diameter for Classification'],
  ['estimate_particle_diameter', 'Automatically Estimate Particle Diameter'],
  ['hold_class2d', '2D Classification Held'],
  ['rerun_class2d', 'First 2D Classification Batch Needs to be Rerun'],
  ['rerun_class3d', '3D Classification Needs to be Rerun'],
  ['class_selection_score', 'Class Selection Threshold'],
  ['star_combination_job', 'Job Number for Rebatching Job'],
  ['initial_model', 'Initial Model'],
  ['next_job', 'Next Job Number'],
  ['picker_murfey_id', 'Murfey ID of Picker for Use in ISPyB'],
  ['picker_ispyb_id', 'ISPyB Particle Picker ID'],
])

const ProcessingParameters = () => {
  const procParams = useLoaderData() as ProcessingDetails[] | null
  const [showExtra, setShowExtra] = React.useState(false)
  let tableRows = [] as ProcessingTable[]
  let tableRowsExtra = [] as ProcessingTable[]
  procParams?.forEach((p) => {
    let tr: ProcessingTable = {
      processingRows: [],
      tag: '',
    }
    let tre: ProcessingTable = {
      processingRows: [],
      tag: '',
    }
    Object.entries(p?.relion_params ? p?.relion_params : {}).forEach(
      ([key, value]) =>
        tr.processingRows.push({
          parameterName: nameLabelMap.get(key) ?? key,
          parameterValue:
            value === true ? 'True' : value === false ? 'False' : value,
        })
    )
    tr.tag = p?.relion_params.pj_id.toString()
    tableRows.push(tr)
    Object.entries(p?.feedback_params ? p?.feedback_params : {}).forEach(
      ([key, value]) =>
        tre.processingRows.push({
          parameterName: nameLabelMap.get(key) ?? key,
          parameterValue:
            value === true ? 'True' : value === false ? 'False' : value,
        })
    )
    tre.tag = p?.feedback_params.pj_id.toString()
    tableRowsExtra.push(tre)
  })
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowExtra(!showExtra)
  }
  return (
    <div className="rootContainer">
      <Box sx={{ width: '100%', bgcolor: colours.murfey[50].default }}>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <Stack className="homeRoot">
            <Stack
              alignItems="flex-start"
              justifyContent="flex-start"
              sx={{
                bgcolor: colours.murfey[700].default,
                width: '100%',
                px: '10vw',
                py: '1vh',
              }}
            >
              <Typography
                variant="h4"
                sx={{ color: colours.murfey[50].default }}
              >
                Processing Parameters
              </Typography>
              <Stack direction="row" alignItems="center">
                <Switch onChange={handleToggle} />
                <Typography sx={{ color: colours.murfey[50].default }}>
                  Show extra processing parameters
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>
        {tableRows.map((tr) => (
          <Accordion key={tr.tag}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: colours.murfey[400].default }}
            >
              Main Processing Parameters (Processing Job ID {tr.tag})
            </AccordionSummary>
            <AccordionDetails>
              <Table
                data={tr.processingRows}
                headers={[
                  { key: 'parameterName', label: 'Parameter' },
                  { key: 'parameterValue', label: 'Value' },
                ]}
                label={'processingParameterData'}
              />
            </AccordionDetails>
          </Accordion>
        ))}
        {showExtra &&
          tableRowsExtra.map((tre) => (
            <Accordion key={tre.tag}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: colours.murfey[500].default }}
              >
                Extra Processing Parameters (Processing Job ID {tre.tag})
              </AccordionSummary>
              <AccordionDetails>
                <IconButton aria-label="Edit parameters">
                  <MdEditNote />
                </IconButton>
                <Table
                  data={tre.processingRows}
                  headers={[
                    { key: 'parameterName', label: 'Parameter' },
                    { key: 'parameterValue', label: 'Value' },
                  ]}
                  label={'processingParameterData'}
                />
              </AccordionDetails>
            </Accordion>
          ))}
      </Box>
    </div>
  )
}

export { ProcessingParameters }
