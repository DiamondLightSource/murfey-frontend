import { ArrowForwardIcon } from '@chakra-ui/icons'
import { Box, Heading, IconButton, Select } from '@chakra-ui/react'
import { SetupStepper } from 'components/setupStepper'
import {
  setupMultigridWatcher,
  startMultigridWatcher,
} from 'loaders/multigridSetup'
import { getSessionData } from 'loaders/sessionClients'
import React, { useEffect } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { components } from 'schema/main'
import { determineWorkflowName } from 'utils/generic'

type MachineConfig = components['schemas']['MachineConfig']
type MultigridWatcherSpec = components['schemas']['MultigridWatcherSetup']
type Session = components['schemas']['Session']

const MultigridSetup = () => {
  const machineConfig = useLoaderData() as MachineConfig | null
  const navigate = useNavigate()
  const { sessid } = useParams()

  const [selectedDirectory, setSelectedDirectory] = React.useState<string>('')
  const [session, setSession] = React.useState<Session>()
  const [workflowName, setWorkflowName] = React.useState<string>()
  const [needsGainRef, setNeedsGainRef] = React.useState<boolean>()
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(false)

  // Load session information using the session ID
  useEffect(() => {
    if (!!!sessid) return
    getSessionData(sessid).then((sess) => setSession(sess.session))
  }, [sessid])
  const activeStep = session != null ? (session.started ? 3 : 2) : 2

  // Set the React states using machine config and session information
  useEffect(() => {
    // Early returns if prerequisites are not ready
    if (!!!machineConfig) return
    if (!!!session) return

    // Determine the workflow associated with this instrument
    setWorkflowName(determineWorkflowName(machineConfig))

    // Set the initial directory
    machineConfig.data_directories.forEach((value) => {
      if (!!!selectedDirectory || selectedDirectory === '') {
        setSelectedDirectory(value)
      }
    })

    // Check if it needs a gain reference
    setNeedsGainRef(!!machineConfig.gain_reference_directory)
  }, [machineConfig, session, selectedDirectory])

  const handleDirectorySelection = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedDirectory(e.target.value)
  }

  const handleConfirmSelection = async () => {
    setButtonDisabled(true)
    if (sessid === undefined) return
    // Send request to setup multigrid watcher
    await setupMultigridWatcher(
      {
        source: selectedDirectory,
      } as MultigridWatcherSpec,
      parseInt(sessid)
    )
    // Check if it needs a reference file
    if (needsGainRef) {
      if (workflowName === 'tem') {
        navigate(
          `../sessions/${sessid}/gain_ref_transfer?sessid=${sessid}&setup=true`
        )
        setButtonDisabled(false)
        return
      } else if (workflowName === 'sim') {
        navigate(
          `../sessions/${sessid}/otf_transfer?sessid=${sessid}&setup=true`
        )
        setButtonDisabled(false)
        return
      }
    }
    // Otherwise, start the multigrid watcher
    await startMultigridWatcher(parseInt(sessid))
    navigate(`../sessions/${sessid}`)
    setButtonDisabled(false)
    return
  }

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
            Select Data Directory
          </Heading>
        </Box>
        {/* Page contents */}
        <Box
          overflow="auto"
          p={8}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="start"
          flex="1"
          gap={8}
        >
          {/* Setup steps progress indicator */}
          <Box w="80%" minW="600px">
            <SetupStepper activeStepIndex={activeStep} />
          </Box>
          {/* Drop-down menu for data directories */}
          <Box
            w="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            {machineConfig && machineConfig.data_directories.length > 0 ? (
              machineConfig.data_directories.map((value) => {
                return (
                  <Box
                    minW="600px"
                    maxW="800px"
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    gap={4}
                  >
                    <Select onChange={handleDirectorySelection}>
                      <option value={value}>{value}</option>
                    </Select>
                    <IconButton
                      aria-label="select"
                      icon={<ArrowForwardIcon />}
                      isDisabled={buttonDisabled}
                      onClick={handleConfirmSelection}
                    />
                  </Box>
                )
              })
            ) : (
              <Heading size="xl">No Data Directories Found</Heading>
            )}
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export { MultigridSetup }
