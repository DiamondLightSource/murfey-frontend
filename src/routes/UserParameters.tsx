import { Box, Radio, RadioGroup, Stack } from '@chakra-ui/react'
import { getForm } from 'components/forms'

import { useState } from 'react'
import { ExperimentType, isValidExpType } from 'utils/ExperimentType'

const UserParameters = () => {
    const [expType, setExpType] = useState<ExperimentType>('spa')
    const [procParams, setProcParams] = useState()
    return (
        <Stack>
            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                padding="10px"
                display="flex"
                borderColor={'murfey.400'}
            >
                <RadioGroup
                    onChange={(v) => {
                        if (isValidExpType(v)) {
                            setExpType(v as ExperimentType)
                        } else {
                            window.alert("wrong experiment type")
                        }
                    }
                    }
                    value={expType}
                    colorScheme="murfey"
                >
                    <Stack>
                        <Radio value="spa">SPA</Radio>
                        <Radio value="tomography">Tomography</Radio>
                    </Stack>
                </RadioGroup>
            </Box>
            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                padding="10px"
                display="flex"
                borderColor={'murfey.400'}
            >
                {getForm(expType, setProcParams)}
            </Box>
        </Stack >
    )
}

export { UserParameters }
