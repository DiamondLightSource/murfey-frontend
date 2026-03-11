import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { SetupStepper } from 'components/setupStepper'
import {
  setupMultigridWatcher,
  startMultigridWatcher,
} from 'loaders/multigridSetup'
import { getSessionData } from 'loaders/sessionClients'
import React, { useEffect } from 'react'
import { Link as LinkRouter, useLoaderData, useParams } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type MachineConfig = components['schemas']['MachineConfig']
type MultigridWatcherSpec = components['schemas']['MultigridWatcherSetup']
type Session = components['schemas']['Session']

const MultigridSetup = () => {
  const machineConfig = useLoaderData() as MachineConfig | null
  const { sessid } = useParams()
  let initialDirectory = ''
  if (machineConfig)
    machineConfig.data_directories.forEach((value) => {
      if (initialDirectory === '') initialDirectory = value
    })
  const [selectedDirectory, setSelectedDirectory] =
    React.useState(initialDirectory)
  const processByDefault = machineConfig
    ? machineConfig.process_by_default
    : true
  const [skipExistingProcessing, setSkipExistingProcessing] =
    React.useState(!processByDefault)
  const [session, setSession] = React.useState<Session>()

  useEffect(() => {
    getSessionData(sessid).then((sess) => setSession(sess.session))
  }, [sessid])
  const activeStep = session != null ? (session.started ? 3 : 2) : 2

  const handleDirectorySelection = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedDirectory(e.target.value)

  const recipesDefined = machineConfig
    ? machineConfig.recipes
      ? Object.keys(machineConfig.recipes).length !== 0
      : false
    : false

  const handleSelection = async () => {
    if (typeof sessid !== 'undefined') {
      await setupMultigridWatcher(
        {
          source: selectedDirectory,
          skip_existing_processing: skipExistingProcessing,
        } as MultigridWatcherSpec,
        parseInt(sessid)
      )
      if (!recipesDefined) await startMultigridWatcher(parseInt(sessid))
    }
  }

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
                Select data directory
              </Typography>
            </Box>
          </Box>
        </Box>
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
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Box
            sx={{
              mt: 0,
              width: '100%',
              px: '10vw',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Stack sx={{ width: '100%', py: '0.8em' }} spacing={5}>
                <FormControlLabel
                  control={
                    <Switch
                      id="skip-existing-processing"
                      checked={!processByDefault}
                      onChange={() => {
                        setSkipExistingProcessing(!skipExistingProcessing)
                      }}
                    />
                  }
                  label="Do not process existing data"
                />
                <Stack direction="row" display="flex" spacing={2}>
                  <Select
                    native
                    onChange={
                      handleDirectorySelection as React.ChangeEventHandler<HTMLSelectElement>
                    }
                    sx={{ flexGrow: 1 }}
                  >
                    {machineConfig &&
                    machineConfig.data_directories.length > 0 ? (
                      machineConfig.data_directories.map((value) => {
                        return (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        )
                      })
                    ) : (
                      <option disabled>No Data Directories Found</option>
                    )}
                  </Select>
                  <Box sx={{ justifyContent: 'center'  }}>
                    <IconButton
                      aria-label="select"
                      component={LinkRouter}
                      to={
                        recipesDefined
                          ? `../new_session/parameters/${sessid}`
                          : `../sessions/${sessid}`
                      }
                      onClick={handleSelection}
                      sx={{ border: '2px solid grey' }}
                    >
                      <ArrowForwardIcon sx={{ color: colours.murfey[500].default }} />
                    </IconButton>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export { MultigridSetup }
