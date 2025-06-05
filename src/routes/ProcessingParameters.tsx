import {
    Accordion,
    AccordionButton,
    AccordionPanel,
    AccordionItem,
    AccordionIcon,
    Box,
    Heading,
    IconButton,
    HStack,
    VStack,
    Switch,
    Text,
} from '@chakra-ui/react'

import { useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'
import { Table } from '@diamondlightsource/ui-components'
import { MdEditNote } from 'react-icons/md'
import { ChangeEvent, useState } from 'react'
import { nameLabelMap } from './nameLabelMap'
import { ProcessingDetails } from 'utils/types'


type ProcessingRow = {
    parameterName: string
    parameterValue?: string | number | boolean
}

export type ProcessingTable = {
    processingRows: ProcessingRow[]
    tag: string
}

export function getStartExtraRows(
    procParams: ProcessingDetails[] | null,
    tableRows: ProcessingTable[]
): ProcessingTable[] {
    const convertParams = (params: Record<string, any> | undefined): ProcessingRow[] =>
        Object.entries(params ?? {}).map(([key, value]) => ({
            parameterName: nameLabelMap.get(key) ?? key,
            parameterValue:
                value === true ? 'True' : value === false ? 'False' : value,
        }))

    const tableRowsExtra: ProcessingTable[] = []

    procParams?.forEach((p) => {
        const relionRows = convertParams(p.relion_params)
        const feedbackRows = convertParams(p.feedback_params)

        tableRows.push({
            processingRows: relionRows,
            tag: p.relion_params?.pj_id?.toString() ?? '',
        })

        tableRowsExtra.push({
            processingRows: feedbackRows,
            tag: p.feedback_params?.pj_id?.toString() ?? '',
        })
    })

    return tableRowsExtra
}

const ProcessingParameters = () => {
    const procParams = useLoaderData() as ProcessingDetails[] | null
    const [showExtra, setShowExtra] = useState(false)
    let tableRows = [] as ProcessingTable[]
    const tableRowsExtra = getStartExtraRows(procParams, tableRows)
    const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
        setShowExtra(!showExtra)
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
                                Processing Parameters
                            </Heading>
                            <HStack>
                                <Switch
                                    colorScheme="murfey"
                                    onChange={handleToggle}
                                />
                                <Text color="murfey.50">
                                    Show extra processing parameters
                                </Text>
                            </HStack>
                        </VStack>
                    </VStack>
                </Box>
                <Accordion>
                    {tableRows.map((tr) =>
                        <AccordionItem>
                            <AccordionButton bg="murfey.400">
                                <Box as="span" flex="1" textAlign="left">
                                    Main Processing Parameters (Processing
                                    Job ID {tr.tag})
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <Table
                                    data={tr.processingRows}
                                    headers={[
                                        {
                                            key: 'parameterName',
                                            label: 'Parameter',
                                        },
                                        {
                                            key: 'parameterValue',
                                            label: 'Value',
                                        },
                                    ]}
                                    label={'processingParameterData'}
                                />
                            </AccordionPanel>
                        </AccordionItem>
                    )}
                    {showExtra && tableRowsExtra.map((tre) => <AccordionItem>
                        <AccordionButton bg="murfey.500">
                            <Box
                                as="span"
                                flex="1"
                                textAlign="left"
                            >
                                Extra Processing Parameters
                                (Processing Job ID {tre.tag})
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <IconButton
                                aria-label="Edit parameters"
                                icon={<MdEditNote />}
                            />
                            <Table
                                data={tre.processingRows}
                                headers={[
                                    {
                                        key: 'parameterName',
                                        label: 'Parameter',
                                    },
                                    {
                                        key: 'parameterValue',
                                        label: 'Value',
                                    },
                                ]}
                                label={'processingParameterData'}
                            />
                        </AccordionPanel>
                    </AccordionItem>
                    )
                    }
                </Accordion>
            </Box>
        </div>
    )
}

export { ProcessingParameters }
