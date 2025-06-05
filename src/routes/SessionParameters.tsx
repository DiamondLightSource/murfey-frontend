import {
    Box,
    Button,
    Heading,
    Input,
    Link,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    VStack,
} from '@chakra-ui/react'

import { useDisclosure } from '@chakra-ui/react'
import { Link as LinkRouter, useLoaderData, useParams } from 'react-router-dom'
import { components } from 'schema/main'
import { Table } from '@diamondlightsource/ui-components'
import { updateSessionProcessingParameters } from 'loaders/processingParameters'

import React, { useState } from 'react'
import { angstromHtmlChar } from 'utils/constants'

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
    ['dose_per_frame', `Dose per frame [e- / ${angstromHtmlChar}]`],
    ['gain_ref', 'Gain Reference'],
    ['symmetry', 'Symmetry'],
    [
        'eer_fractionation_file',
        'EER fractionation file (for motion correction)',
    ],
])

// todo possibly derive this from the map keys
type EditableParameter =
    | 'gain_ref'
    | 'dose_per_frame'
    | 'eer_fractionation_file'
    | 'symmetry'
    | ''

const SessionParameters = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { sessid } = useParams()
    const sessionParams = useLoaderData() as EditableSessionParameters | null
    let tableRows = [] as ProcessingRow[]
    const [paramName, setParamName] = useState('')
    const [paramValue, setParamValue] = useState('')
    const [paramKey, setParamKey] = useState<EditableParameter>('')
    Object.entries(sessionParams ? sessionParams : {}).forEach(([key, value]) =>
        tableRows.push({
            parameterName: nameLabelMap.get(key) ?? key,
            parameterValue: value,
            parameterKey: key,
        } as ProcessingRow)
    )
    let table = { processingRows: tableRows, tag: 'Session' } as ProcessingTable

    const handleParameterEdit = () => {
        const data = {
            gainRef: paramKey === 'gain_ref' ? paramValue : '',
            dosePerFrame: paramKey === 'dose_per_frame' ? paramValue : null,
            eerFractionationFile:
                paramKey === 'eer_fractionation_file' ? paramValue : '',
            symmetry: paramKey === 'symmetry' ? paramValue : '',
        }
        updateSessionProcessingParameters(sessid ?? '0', data)
        onClose()
        window.location.reload()
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

    return (
        <div className="rootContainer">
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
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => handleParameterEdit()}
                        >
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
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
                                Session Processing Parameters
                            </Heading>
                            <Link
                                w={{ base: '100%', md: '19.6%' }}
                                _hover={{ textDecor: 'none' }}
                                as={LinkRouter}
                                to={`extra_parameters`}
                            >
                                <Button variant="onBlue">
                                    Extra Parameters
                                </Button>
                            </Link>
                        </VStack>
                    </VStack>
                </Box>
                <Table
                    data={table.processingRows}
                    headers={[
                        { key: 'parameterName', label: 'Parameter' },
                        {
                            key: 'parameterKey',
                            label: 'Parameter internal name',
                        },
                        { key: 'parameterValue', label: 'Value' },
                    ]}
                    label={'sessionParameterData'}
                    onClick={editParameterDialogue}
                />
            </Box>
        </div>
    )
}

export { SessionParameters }
