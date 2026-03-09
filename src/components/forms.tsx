import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import React, { ReactElement } from 'react'
import { colours } from 'styles/colours'

const formDataSPA: { [key: string]: any } = {
  type: 'SPA',
  dose_per_frame: 1,
  symmetry: 'C1',
  particle_diameter: null,
  extract_downscale: true,
  eer_fractionation: 20,
  run_class3d: true,
}

const formDataTomo: { [key: string]: any } = {
  type: 'tomo',
  dose_per_frame: 0.5,
  eer_fractionation: 20,
}

const SpaForm = (submissionCallback: (arg0: any) => void) => {
  const validateInt = (char: string) => {
    return /\d/.test(char)
  }
  const [symmetryType, setSymmetryType] = React.useState('C')
  const [symmetryNum, setSymmetryNum] = React.useState(1)
  const [particleDetection, setParticleDetection] = React.useState(true)
  const [runClass3D, setRunClass3D] = React.useState(true)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSymmetryType(event.target.value)
  }
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParticleDetection(!particleDetection)
  }
  const handleClass3DSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRunClass3D(!runClass3D)
  }
  const setFormElement = (
    event: React.FormEvent<HTMLFormElement>,
    callback: (arg0: any) => void
  ) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formDataSPA.dose_per_frame = formData.get('dose')
    formDataSPA.symmetry = ['T', 'O'].includes(
      formData.get('symmetry1') as string
    )
      ? (formData.get('symmetry1') as string)
      : (((formData.get('symmetry1') as string) +
          formData.get('symmetry2')) as string)
    formDataSPA.particle_diameter = particleDetection
      ? null
      : formData.get('particle-diameter')
    formDataSPA.eer_fractionation = formData.get('eer-grouping')
    formDataSPA.run_class3d = runClass3D
    callback(formDataSPA)
  }

  return (
    <form onSubmit={(e) => setFormElement(e, submissionCallback)}>
      <Stack spacing={4} alignItems="start" width="100%">
        <FormControl fullWidth>
          <Stack spacing={4} alignItems="start" width="100%">
            <Stack spacing={1} alignItems="start" width="100%">
              <FormLabel>{'Dose per frame [\u212B / pixel]'}</FormLabel>
              <TextField defaultValue="1" name="dose" fullWidth />
            </Stack>
            <Stack spacing={1} alignItems="start" width="100%">
              <FormLabel>Symmetry</FormLabel>
              <Stack direction="row" spacing={2} width="100%">
                <FormControl fullWidth>
                  <InputLabel>Symmetry type</InputLabel>
                  <Select
                    defaultValue="C"
                    onChange={(e) =>
                      handleChange(e as React.ChangeEvent<HTMLInputElement>)
                    }
                    name="symmetry1"
                    label="Symmetry type"
                  >
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="D">D</MenuItem>
                    <MenuItem value="T">T</MenuItem>
                    <MenuItem value="O">O</MenuItem>
                    <MenuItem value="I">I</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  value={symmetryNum}
                  type="number"
                  inputProps={{
                    min: 1,
                    onKeyPress: (e: React.KeyboardEvent) => {
                      if (!validateInt(e.key)) e.preventDefault()
                    },
                  }}
                  onChange={(e) =>
                    setSymmetryNum(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  disabled={['T', 'O'].includes(symmetryType)}
                  name="symmetry2"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          size="small"
                          disabled={
                            ['T', 'O'].includes(symmetryType) ||
                            symmetryNum <= 1
                          }
                          onClick={() =>
                            setSymmetryNum((n) => Math.max(1, n - 1))
                          }
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          disabled={['T', 'O'].includes(symmetryType)}
                          onClick={() => setSymmetryNum((n) => n + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Stack>
            <Stack spacing={1} alignItems="start" width="100%">
              <FormLabel>
                {'EER grouping (number of EER frames in each fraction)'}
              </FormLabel>
              <TextField defaultValue="20" name="eer-grouping" fullWidth />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  onChange={handleSwitchChange}
                  name="detect-particle-size"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colours.murfey[600].default,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: colours.murfey[600].default,
                    },
                  }}
                />
              }
              label="Automatically detect particle size"
            />
            {!particleDetection && (
              <Stack spacing={1} alignItems="start" width="100%">
                <FormLabel>{'Particle diameter [\u212B]'}</FormLabel>
                <TextField
                  defaultValue={200}
                  name="particle-diameter"
                  fullWidth
                />
              </Stack>
            )}
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  onChange={handleClass3DSwitchChange}
                  name="run-class3d"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colours.murfey[600].default,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: colours.murfey[600].default,
                    },
                  }}
                />
              }
              label="Run 3D classification"
            />
          </Stack>
        </FormControl>
        <Button
          variant="contained"
          type="submit"
          sx={{
            backgroundColor: colours.murfey[600].default,
            '&:hover': { backgroundColor: colours.murfey[700].default },
          }}
        >
          Submit
        </Button>
      </Stack>
    </form>
  )
}

const TomoForm = (submissionCallback: (arg0: any) => void) => {
  const setFormElement = (
    event: React.FormEvent<HTMLFormElement>,
    callback: (arg0: any) => void
  ) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formDataTomo.dose_per_frame = formData.get('dose')
    formDataTomo.eer_fractionation = formData.get('eer-grouping')
    callback(formDataTomo)
  }
  return (
    <form onSubmit={(e) => setFormElement(e, submissionCallback)}>
      <Stack spacing={4} alignItems="start" width="100%">
        <FormControl fullWidth>
          <Stack spacing={4} alignItems="start" width="100%">
            <Stack spacing={1} alignItems="start" width="100%">
              <FormLabel>{'Dose per frame [\u212B / pixel]'}</FormLabel>
              <TextField defaultValue="0.5" name="dose" fullWidth />
            </Stack>
            <Stack spacing={1} alignItems="start" width="100%">
              <FormLabel>
                {'EER grouping (number of EER frames in each fraction)'}
              </FormLabel>
              <TextField defaultValue="20" name="eer-grouping" fullWidth />
            </Stack>
          </Stack>
        </FormControl>
        <Button
          variant="contained"
          type="submit"
          sx={{
            backgroundColor: colours.murfey[600].default,
            '&:hover': { backgroundColor: colours.murfey[700].default },
          }}
        >
          Submit
        </Button>
      </Stack>
    </form>
  )
}

interface Forms {
  [expType: string]: ReactElement
}

export const getForm = (
  expType: string,
  submissionCallback: (arg0: any) => void
) => {
  let forms = {
    spa: SpaForm(submissionCallback),
    tomography: TomoForm(submissionCallback),
  } as Forms
  return forms[expType]
}
