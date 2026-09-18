import {
  Button,
  Box,
  Heading,
  Input,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  Tooltip,
} from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { keyframes } from '@emotion/react'
import { SetupStepper } from 'components/setupStepper'
import { getMachineConfigData } from 'loaders/machineConfig'
import {
  prepareGainReference,
  transferGainReference,
  updateCurrentGainReference,
} from 'loaders/possibleGainRefs'
import React, { useEffect } from 'react'
import {
  useNavigate,
  useLoaderData,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { components } from 'schema/main'
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
  const { sessid } = useParams()
  const [searchParams] = useSearchParams()
  const setup = searchParams.get('setup')
  const navigate = useNavigate()

  const [processing, setProcessing] = React.useState(false)
  const [tag, setTag] = React.useState('')
  const [falcon, setFalcon] = React.useState(false)
  const [falconPreset, setFalconPreset] = React.useState(false)

  // Set up animation for the loading icon
  const bounce = keyframes`
    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
    40% { transform: scale(1); opacity: 1; }
  `

  const handleNextSetupPage = () => {
    !!setup
      ? // If going through initial setup, go to processing parameters
        navigate(`/new_session/parameters/${sessid}`)
      : // Otherwise, return to the session page
        navigate(`/sessions/${sessid}`)
    return
  }

  if (!falconPreset) {
    setFalconPreset(true)
    getMachineConfigData().then((cfg) => setFalcon(cfg.camera === 'FALCON'))
  }

  const handleSelectGainRef = async (data: Record<string, any>) => {
    // Early exit if session ID not found
    if (!!!sessid) return

    // Request for the gain reference transfer
    setProcessing(true)
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
    setProcessing(false)
    handleNextSetupPage()
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
      {/* Pop-up to show that gain reference is being processed */}
      <Modal isOpen={processing} onClose={() => void 0}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Processing gain reference...</ModalHeader>
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="2vw"
          >
            {/* Show three pulsing dots */}
            <Box display="flex" gap={1}>
              <Box
                w={2}
                h={2}
                bg="black"
                borderRadius="full"
                sx={{
                  animation: `${bounce} 1s infinite ease-in-out`,
                  animationDelay: '0.1s',
                }}
              />
              <Box
                w={2}
                h={2}
                bg="black"
                borderRadius="full"
                sx={{
                  animation: `${bounce} 1s infinite ease-in-out`,
                  animationDelay: '0.2s',
                }}
              />
              <Box
                w={2}
                h={2}
                bg="black"
                borderRadius="full"
                sx={{
                  animation: `${bounce} 1s infinite ease-in-out`,
                  animationDelay: '0.3s',
                }}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
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
            Upload Gain Reference File
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
            {searchParams.get('setup') ? (
              <Box w="80%" minW="960px">
                <SetupStepper activeStepIndex={2} />
              </Box>
            ) : null}
            {/* Input for the tag to append to the transferred gain reference */}
            <Box minW="400px" maxW="600px">
              <Tooltip label="Tag appended to gain reference name">
                <Input
                  placeholder={tag}
                  onChange={(e) => setTag(e.target.value)}
                />
              </Tooltip>
            </Box>
            {/* Checkbox to indicate if image is from a Falcon camera */}
            <Checkbox
              isChecked={falcon}
              onChange={(e) => setFalcon(e.target.checked)}
            >
              Falcon
            </Checkbox>
            <Box
              w="80%"
              minW="800px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Table
                data={possibleGainRefsFormatted}
                headers={[
                  { key: 'name', label: 'File Name' },
                  { key: 'timestampFormatted', label: 'Timestamp' },
                  { key: 'size', label: 'Size [MB]' },
                  { key: 'full_path', label: 'Full Path' },
                ]}
                label={'gainRefData'}
                onClick={handleSelectGainRef}
              />
              <Button variant="ghost" onClick={handleNextSetupPage}>
                Skip gain reference
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  )
}
