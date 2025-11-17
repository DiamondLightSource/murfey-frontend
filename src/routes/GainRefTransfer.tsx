import {
  Button,
  Box,
  Heading,
  HStack,
  VStack,
  Input,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  Tooltip,
  Link,
} from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { SetupStepper } from 'components/setupStepper'
import { getMachineConfigData } from 'loaders/machineConfig'
import {
  prepareGainReference,
  transferGainReference,
  updateCurrentGainReference,
} from 'loaders/possibleGainRefs'
import React, { useEffect } from 'react'
import {
  Link as LinkRouter,
  useNavigate,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom'
import { CircleLoader } from 'react-spinners'
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
  let [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [processing, setProcessing] = React.useState(false)
  const [tag, setTag] = React.useState('')
  const [falcon, setFalcon] = React.useState(false)
  const [falconPreset, setFalconPreset] = React.useState(false)

  const SelectGainRef = async (data: Record<string, any>, index: number) => {
    setProcessing(true)
    const sessid = searchParams.get('sessid')
    const setup = searchParams.get('setup')
    if (sessid) {
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
    }
    if (setup) sessid ? navigate(`/new_session/setup/${sessid}`) : navigate('/')
    else sessid ? navigate(`/sessions/${sessid}`) : navigate('/')
    setProcessing(false)
  }

  if (!falconPreset) {
    setFalconPreset(true)
    getMachineConfigData().then((cfg) => setFalcon(cfg.camera === 'FALCON'))
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
                Possible Gain Reference Files
              </Heading>
            </VStack>
          </VStack>
        </Box>
        <Modal isOpen={processing} onClose={() => void 0}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Processing gain reference</ModalHeader>
            <ModalBody>
              <CircleLoader />
            </ModalBody>
          </ModalContent>
        </Modal>
        <Box
          mt="1em"
          px="10vw"
          w="100%"
          justifyContent={'center'}
          alignItems={'center'}
        >
          {searchParams.get('setup') ? (
            <SetupStepper activeStepIndex={1} />
          ) : null}
        </Box>
        <Box
          mt="1em"
          w="100%"
          justifyContent={'center'}
          alignItems={'center'}
          display={'flex'}
        >
          <HStack>
            <VStack>
              <Tooltip label="Tag appended to gain reference name">
                <Input
                  placeholder={tag}
                  w="50%"
                  display={'flex'}
                  onChange={(e) => setTag(e.target.value)}
                />
              </Tooltip>
              <Checkbox
                isChecked={falcon}
                onChange={(e) => setFalcon(e.target.checked)}
              >
                Falcon
              </Checkbox>
              <Table
                width="80%"
                data={possibleGainRefsFormatted}
                headers={[
                  { key: 'name', label: 'Name' },
                  { key: 'timestampFormatted', label: 'Timestamp' },
                  { key: 'size', label: 'Size [MB]' },
                  { key: 'full_path', label: 'Full path' },
                ]}
                label={'gainRefData'}
                onClick={SelectGainRef}
              />
              <Link
                w={{ base: '100%', md: '19.6%' }}
                _hover={{ textDecor: 'none' }}
                as={LinkRouter}
                to={`../new_session/setup/${searchParams.get('sessid')}`}
              >
                <Button variant="ghost">Skip gain reference</Button>
              </Link>
            </VStack>
          </HStack>
        </Box>
      </Box>
    </div>
  )
}
