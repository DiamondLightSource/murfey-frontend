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
      <Box w="100%" bg="murfey.50">
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
        {/* Title bar */}
        <Box
          bg="murfey.700"
          display="flex"
          justifyContent="start"
          alignItems="start"
          w="100%"
          px="10vw"
          py="1vh"
          overflow="hidden"
        >
          <Heading size="xl" color="murfey.50">
            Possible OTF Directories
          </Heading>
        </Box>
        {/* Setup steps progress indicator  */}
        {searchParams.get('setup') ? (
          <Box
            justifyContent="center"
            alignItems="center"
            w="100%"
            mt="1em"
            px="10vw"
          >
            <SetupStepper activeStepIndex={1} />
          </Box>
        ) : null}
        {/* Table showing OTF directory information */}
        <Box
          w="100%"
          mt="1em"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Table
            width="80%"
            data={possibleOTFDirsFormatted}
            headers={[
              { key: 'name', label: 'Name' },
              { key: 'timestampFormatted', label: 'Timestamp' },
              { key: 'full_path', label: 'Full path' },
            ]}
            label={'otfDirData'}
            onClick={handleSelectOTFDir}
          />
        </Box>
      </Box>
    </div>
  )
}
