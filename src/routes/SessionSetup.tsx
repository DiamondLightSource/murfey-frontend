import {
    Button,
    Box,
    RadioGroup,
    Radio,
    Stack,
    Link,
    VStack,
    Heading,
} from '@chakra-ui/react'
import { getForm } from 'components/forms'
import { Link as LinkRouter, useParams, useLoaderData } from 'react-router-dom'
import { SetupStepper } from 'components/setupStepper'
import { components } from 'schema/main'
import { getProcessingParameterData } from 'loaders/processingParameters'
import { startMultigridWatcher } from 'loaders/multigridSetup'
import { getSessionData, updateSession } from 'loaders/session_clients'
import { registerProcessingParameters } from 'loaders/sessionSetup'

import { useEffect, useState } from 'react'

type SessionClients = components['schemas']['SessionClients']
type ProvidedProcessingParameters =
    components['schemas']['ProvidedProcessingParameters']
type Session = components['schemas']['Session']

// 1. Constant key list
export const EXPERIMENT_TYPES = ['spa', 'tomography'] as const

// 2. Type derived from the constant
export type ExperimentType = typeof EXPERIMENT_TYPES[number]

const isValidExpType = (val: string): val is ExperimentType =>
    EXPERIMENT_TYPES.includes(val as ExperimentType)


const SessionSetup = () => {
    const session = useLoaderData() as SessionClients | null
    const [expType, setExpType] = useState<ExperimentType>("spa")
    const [procParams, setProcParams] = useState()
    const { sessid } = useParams()
    const [paramsSet, setParamsSet] = useState(false)

    const [_session, setSession] = useState<Session>()

    useEffect(() => {
        getSessionData(sessid).then((sess) => setSession(sess.session))
    }, [])

    const handleSelection = (formData: any) => {
        if (typeof sessid !== 'undefined') {
            delete formData.type
            registerProcessingParameters(
                formData as ProvidedProcessingParameters,
                parseInt(sessid)
            )
            startMultigridWatcher(parseInt(sessid))
            setParamsSet(true)
        }
    }

    const handleSkip = async () => {
        if (sessid !== undefined) {
            await updateSession(parseInt(sessid), false)
            startMultigridWatcher(parseInt(sessid))
        }
    }

    if (session)
        getProcessingParameterData(session.session.id.toString()).then(
            (params) => setProcParams(params)
        )
    const activeStep = session
        ? procParams
            ? 4
            : session.session.visit
                ? 3
                : 0
        : 3
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
                                Processing parameters
                            </Heading>
                        </VStack>
                    </VStack>
                </Box>
                <Stack>
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
                        justifyContent={'left'}
                        alignItems={'center'}
                        display={'flex'}
                    >
                        <RadioGroup
                            onChange={v => {
                                if (isValidExpType(v)) {
                                    setExpType(v as ExperimentType)
                                } else {
                                    window.alert("wrong experiment type")
                                }
                            }
                            }
                            value={expType}
                            colorScheme="murfey"
                            isDisabled={activeStep !== 3 ? true : false}
                        >
                            <Stack>
                                <Radio value={EXPERIMENT_TYPES[0]}>SPA</Radio>
                                <Radio value={EXPERIMENT_TYPES[1]}>Tomography</Radio>
                            </Stack>
                        </RadioGroup>
                    </Box>
                    <Box
                        mt="1em"
                        ml="10vw"
                        w="80%"
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        padding="10px"
                        justifyContent={'left'}
                        alignItems={'left'}
                        display={'flex'}
                        borderColor={'murfey.400'}
                    >
                        {sessid ? getForm(expType, handleSelection) : <></>}
                    </Box>
                    <Box
                        mt="1em"
                        px="10vw"
                        w="100%"
                        justifyContent={'left'}
                        alignItems={'left'}
                        display={'flex'}
                    >
                        <Link
                            w={{ base: '100%', md: '19.6%' }}
                            key={sessid}
                            _hover={{ textDecor: 'none' }}
                            as={LinkRouter}
                            to={`../sessions/${sessid}`}
                        >
                            <Button isDisabled={!paramsSet}>Next</Button>
                        </Link>
                        <Link
                            w={{ base: '100%', md: '19.6%' }}
                            key={sessid}
                            _hover={{ textDecor: 'none' }}
                            as={LinkRouter}
                            to={`../sessions/${sessid}`}
                        >
                            <Button onClick={handleSkip}>
                                Disable Processing
                            </Button>
                        </Link>
                    </Box>
                </Stack>
            </Box>
        </div>
    )
}

export { SessionSetup }
