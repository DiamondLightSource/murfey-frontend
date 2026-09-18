import {
  Box,
  Button,
  Heading,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  updateSessionProcessingParameters,
  getSessionProcessingParameterData,
} from 'loaders/processingParameters'
import React from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { components } from 'schema/main'

type EditableSessionParameters =
  components['schemas']['EditableSessionProcessingParameters']

type ProcessingRow = {
  parameterName: string
  parameterValue?: string | number | boolean
}

type ProcessingTable = {
  processingRows: ProcessingRow[]
  tag: string
}

const nameLabelMap: Map<string, string> = new Map([
  ['dose_per_frame', 'Dose per frame [e\u207B / \u212B\u00B2]'],
  ['gain_ref', 'Gain Reference'],
  ['symmetry', 'Symmetry'],
  ['eer_fractionation_file', 'EER fractionation file (for motion correction)'],
  ['run_class3d', 'Run 3D classification?'],
])

export const SessionParameters = () => {
  // Load necessary data
  const { sessid } = useParams()
  const preloadedData = useLoaderData()
  const queryKey = ['processingParameters', sessid]
  const queryFn = () => getSessionProcessingParameterData(sessid)
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    initialData: preloadedData,
    staleTime: 0,
  })
  const sessionParams = data as EditableSessionParameters | null

  const queryClient = useQueryClient()

  // Set component hooks
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Construct parameters table to display
  let tableRows = [] as ProcessingRow[]
  type EditableParameter =
    | 'gain_ref'
    | 'dose_per_frame'
    | 'eer_fractionation_file'
    | 'symmetry'
    | 'run_class3d'
    | ''
  const [paramName, setParamName] = React.useState('')
  const [paramValue, setParamValue] = React.useState('')
  const [paramKey, setParamKey] = React.useState<EditableParameter>('')

  const navigate = useNavigate()

  Object.entries(sessionParams ? sessionParams : {}).forEach(([key, value]) =>
    tableRows.push({
      parameterName: nameLabelMap.get(key) ?? key,
      parameterValue: value.toString(),
      parameterKey: key,
    } as ProcessingRow)
  )
  let table = { processingRows: tableRows, tag: 'Session' } as ProcessingTable

  const handleParameterEdit = async () => {
    const data = {
      gainRef: paramKey === 'gain_ref' ? paramValue : '',
      dosePerFrame:
        paramKey === 'dose_per_frame' ? parseFloat(paramValue) : null,
      eerFractionationFile:
        paramKey === 'eer_fractionation_file' ? paramValue : '',
      symmetry: paramKey === 'symmetry' ? paramValue : '',
      run_class3d: paramKey === 'run_class3d' ? paramValue : null,
    }
    await updateSessionProcessingParameters(sessid ?? '0', data)
    queryClient.refetchQueries({ queryKey: ['processingParameters', sessid] })
    onClose()
  }

  const editParameterDialogue = async (
    data: Record<string, any>,
    index: number
  ) => {
    setParamName(data['parameterName'])
    setParamValue(data['parameterValue'])
    console.log(data['parameterKey'])
    setParamKey(data['parameterKey'])
    onOpen()
  }

  if (isLoading) return <p>Loading processing parameters for session...</p>
  if (isError) return <p>Error loading processing parameters for session.</p>
  return (
    <div className="rootContainer">
      {/* Pop-up for submitting processing parameter edits */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit processing parameter</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {paramName}
            <Input
              value={paramValue}
              autoFocus
              w="80%"
              onChange={(v) => setParamValue(v.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="default" onClick={() => handleParameterEdit()}>
              Confirm
            </Button>
          </ModalFooter>
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
            Session Processing Parameters
          </Heading>
          <Button variant="onBlue" onClick={() => navigate(`extra_parameters`)}>
            Extra Parameters
          </Button>
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
            {/* Table showing processing parameters */}
            <Box
              overflow="auto"
              w="80%"
              minW="800px"
              display="flex"
              flexDirection="column"
              alignItems="start"
              justifyContent="start"
              gap={4}
            >
              <Table
                data={table.processingRows}
                headers={[
                  { key: 'parameterName', label: 'Parameter' },
                  { key: 'parameterValue', label: 'Value' },
                ]}
                label={'sessionParameterData'}
                onClick={editParameterDialogue}
              />
              <Button
                variant="default"
                onClick={() => navigate(`../sessions/${sessid}`)}
              >
                Back to Session
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  )
}
