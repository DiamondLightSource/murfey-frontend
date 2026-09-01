import { Box, Heading } from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { SetupStepper } from 'components/setupStepper'
import { useLoaderData, useSearchParams, useNavigate } from 'react-router-dom'
import { components } from 'schema/main'
import { formatUTCISOToUKLocal } from 'utils/generic'

type File = components['schemas']['File']

export const OTFFileTransfer = () => {
  const possibleOTFDirs = useLoaderData() as File[] | null
  // Add new columns with the formatted timestamps
  const possibleOTFDirsFormatted = possibleOTFDirs
    ? possibleOTFDirs.map((otfDirs) => ({
        ...otfDirs, // Preserve original table
        timestampFormatted: formatUTCISOToUKLocal(otfDirs.timestamp),
      }))
    : []
  let [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const selectOTFDir = async (data: Record<string, any>) => {
    const sessid = searchParams.get('sessid')
    const setup = searchParams.get('setup')
    if (sessid) {
      console.log(`Will transfer selected OTF directory ${data.full_path}`)
    }
    if (setup) {
      sessid ? navigate(`/new_session/setup/${sessid}`) : navigate('/')
    } else {
      sessid ? navigate(`/sessions/${sessid}`) : navigate('/')
    }
  }

  return (
    <div className="rootContainer">
      <Box w="100%" bg="murfey.50">
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
            onClick={selectOTFDir}
          />
        </Box>
      </Box>
    </div>
  )
}
