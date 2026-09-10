import { ArrowForwardIcon } from '@chakra-ui/icons'
import {
  Box,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Select,
  Stack,
  VStack,
} from '@chakra-ui/react'
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
        return
      } else if (workflowName === 'sim') {
        navigate(
          `../sessions/${sessid}/otf_transfer?sessid=${sessid}&setup=true`
        )
        return
      }
    }
    // Otherwise, start the multigrid watcher
    await startMultigridWatcher(parseInt(sessid))
    navigate(`../sessions/${sessid}`)
    return
  }

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
                Select data directory
              </Heading>
            </VStack>
          </VStack>
        </Box>
        <Box
          mt="1em"
          px="10vw"
          w="100%"
          justifyContent={'center'}
          alignItems={'center'}
          display={'flex'}
        ></Box>
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
          px="10vw"
          w="100%"
          justifyContent={'center'}
          alignItems={'center'}
          display={'flex'}
        >
          <VStack
            mt="0 !important"
            w="100%"
            px="10vw"
            justifyContent="start"
            alignItems="start"
          >
            <VStack w="100%" spacing={0}>
              <Stack w="100%" spacing={5} py="0.8em">
                <HStack>
                  <Select onChange={handleDirectorySelection}>
                    {machineConfig &&
                    machineConfig.data_directories.length > 0 ? (
                      machineConfig.data_directories.map((value) => {
                        return <option value={value}>{value}</option>
                      })
                    ) : (
                      <GridItem colSpan={5}>
                        <Heading textAlign="center" py={4} variant="notFound">
                          No Data Directories Found
                        </Heading>
                      </GridItem>
                    )}
                  </Select>
                  <IconButton
                    aria-label="select"
                    icon={<ArrowForwardIcon />}
                    onClick={handleConfirmSelection}
                  />
                </HStack>
              </Stack>
            </VStack>
          </VStack>
        </Box>
      </Box>
    </div>
  )
}

export { MultigridSetup }
