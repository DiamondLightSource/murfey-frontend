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
    Circle,
} from '@chakra-ui/react'

import {
    Link as LinkRouter,
    useNavigate,
    useLoaderData,
    useSearchParams,
} from 'react-router-dom'
import { components } from 'schema/main'
import { Table } from '@diamondlightsource/ui-components'
import { SetupStepper } from 'components/setupStepper'
import {
    prepareGainReference,
    transferGainReference,
    updateCurrentGainReference,
} from 'loaders/possibleGainRefs'
import { getMachineConfigData } from 'loaders/machineConfig'
import { CircleLoader } from 'react-spinners'

import React from 'react'

type File = components['schemas']['File']

const GainRefTransfer = () => {
    const possibleGainRefs = useLoaderData() as File[] | null
    let [searchParams, setSearchParams] = useSearchParams()
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
            if (true) {
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
        if (setup)
            sessid ? navigate(`/new_session/setup/${sessid}`) : navigate('/')
        else sessid ? navigate(`/sessions/${sessid}`) : navigate('/')
        setProcessing(false)
    }

    if (!falconPreset) {
        setFalconPreset(true)
        getMachineConfigData().then((cfg) => setFalcon(cfg.camera === 'FALCON'))
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
                                    placeholder="Tag (optional)"
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
                                data={possibleGainRefs}
                                headers={[
                                    { key: 'name', label: 'Name' },
                                    { key: 'timestamp', label: 'Timestamp' },
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
                                <Button variant="onBlue">
                                    Skip gain reference
                                </Button>
                            </Link>
                        </VStack>
                    </HStack>
                </Box>
            </Box>
        </div>
    )
}

export { GainRefTransfer }
