import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { keyframes } from '@emotion/react'
import { SetupStepper } from 'components/setupStepper'
import { startMultigridWatcher } from 'loaders/multigridSetup'
import { updateCurrentGainReference } from 'loaders/possibleGainRefs'
import { transferOTFDir } from 'loaders/possibleOTFDirs'
import React from 'react'
import {
  useLoaderData,
  useParams,
  useSearchParams,
  useNavigate,
} from 'react-router-dom'
import { components } from 'schema/main'
import { formatUTCISOToUKLocal } from 'utils/generic'

type File = components['schemas']['File']

export const OTFFileTransfer = () => {
  const possibleOTFDirs = useLoaderData() as File[] | null
  const { sessid } = useParams()
  const [searchParams] = useSearchParams()
  const setup = searchParams.get('setup')
  const navigate = useNavigate()

  const [processing, setProcessing] = React.useState(false)

  // Set up animation for the loading icon
  const bounce = keyframes`
    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
    40% { transform: scale(1); opacity: 1; }
  `

  // Add new columns with the formatted timestamps
  const possibleOTFDirsFormatted = possibleOTFDirs
    ? possibleOTFDirs.map((otfDirs) => ({
        ...otfDirs, // Preserve original table
        timestampFormatted: formatUTCISOToUKLocal(otfDirs.timestamp),
      }))
    : []

  // Process the selected OTF directory and navigate accordingly
  const handleSelectOTFDir = async (data: Record<string, any>) => {
    // Don't do anything if session ID is not set
    if (!!!sessid) return

    // Request the transfer
    setProcessing(true) // Activate transfer pop-up
    const transferStatus = await transferOTFDir(
      parseInt(sessid),
      data['full_path']
    )
    // If successful, update the database with the file path
    if (transferStatus.success && transferStatus.destination_path) {
      await updateCurrentGainReference(
        parseInt(sessid),
        transferStatus.destination_path
      )
    }
    setProcessing(false) // Deactivate transfer pop-up

    // If this is part of the initial setup process, start the multigrid watcher
    if (!!setup) {
      await startMultigridWatcher(parseInt(sessid))
    }
    // Navigate to the session page
    navigate(`../sessions/${sessid}`)
    return
  }

  return (
    <div className="rootContainer">
      {/* Pop-up for showing loading progress */}
      <Modal isOpen={processing} onClose={() => void 0}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transferring OTF files...</ModalHeader>
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
        bg="murfey.50"
        overflow="auto"
        display="flex"
        flexDirection="column"
        flex="1"
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
          justifyContent="start"
          alignItems="start"
          gap={2}
        >
          <Heading size="xl" color="murfey.50">
            Upload OTF Files
          </Heading>
        </Box>
        {/* Page contenst */}
        <Box
          overflow="auto"
          p={8}
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="start"
          gap={8}
        >
          {/* Setup steps progress indicator  */}
          {searchParams.get('setup') ? (
            <Box w="80%" minW="600px">
              <SetupStepper activeStepIndex={1} />
            </Box>
          ) : null}
          {/* Table showing OTF directory information */}
          <Box w="80%" minW="600px">
            <Table
              data={possibleOTFDirsFormatted}
              headers={[
                { key: 'name', label: 'Folder Name' },
                { key: 'timestampFormatted', label: 'Timestamp' },
                { key: 'full_path', label: 'Full Path' },
              ]}
              label={'otfDirData'}
              onClick={handleSelectOTFDir}
            />
          </Box>
        </Box>
      </Box>
    </div>
  )
}
