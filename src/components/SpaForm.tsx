
import {
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Switch,
    VStack
} from '@chakra-ui/react'
import { FormEvent } from 'react'
import { angstromHtmlChar } from 'utils/constants'


export const formDataSPA: Record<string, any> = {
    type: 'SPA',
    dose_per_frame: 1,
    symmetry: 'C1',
    particle_diameter: null,
    extract_downscale: true,
    eer_fractionation: 20,
}

export const SpaForm = (submissionCallback: (arg0: any) => void) => {
    const validateInt = (char: string) => {
        return /\d/.test(char)
    }
    const validateFloat = (char: string) => {
        return /^\d*\.?\d*$/.test(char)
    }
    const [symmetryType, setSymmetryType] = React.useState('C')
    const [particleDetection, setParticleDetection] = React.useState(true)
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSymmetryType(event.target.value)
    }
    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParticleDetection(!particleDetection)
    }
    const parseAndSendFormData = (formData: FormData
    ) => {
        formDataSPA.dose_per_frame = formData.get('dose')
        formDataSPA.symmetry = ['T', 'O'].includes(
            formData.get('symmetry1') as string
        )
            ? (formData.get('symmetry1') as string)
            : (((formData.get('symmetry1') as string) +
                formData.get('symmetry2')) as string)
        formDataSPA.particle_diameter = formData.get('detect-particle-size')
            ? null
            : formData.get('particle-diameter')
        formDataSPA.eer_fractionation = formData.get('eer-grouping')
        submissionCallback(formDataSPA)
    }

    const handleFormSubmission = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        parseAndSendFormData(formData)
    }

    return (
        <form onSubmit={handleFormSubmission}>
            <VStack align="start" spacing={10} width="100%" display="flex">
                <FormControl>
                    <VStack
                        align="start"
                        spacing={10}
                        width="100%"
                        display="flex"
                    >
                        <VStack align="start" width="100%" display="flex">
                            <FormLabel>
                                {`Dose per frame [${angstromHtmlChar} / pixel]`}
                            </FormLabel>
                            <Input defaultValue="1" name="dose" />
                        </VStack>
                        <VStack align="start" width="100%" display="flex">
                            <FormLabel>Symmetry</FormLabel>
                            <HStack align="start" width="100%" display="flex">
                                <Select
                                    defaultValue="C"
                                    onChange={handleChange}
                                    name="symmetry1"
                                >
                                    <option>C</option>
                                    <option>D</option>
                                    <option>T</option>
                                    <option>O</option>
                                    <option>I</option>
                                </Select>
                                <NumberInput
                                    defaultValue={1}
                                    min={1}
                                    isValidCharacter={validateInt}
                                    isDisabled={['T', 'O'].includes(
                                        symmetryType
                                    )}
                                    name="symmetry2"
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </HStack>
                        </VStack>
                        <VStack align="start" width="100%" display="flex">
                            <FormLabel>
                                {
                                    'EER grouping (number of EER frames in each fraction)'
                                }
                            </FormLabel>
                            <Input defaultValue="20" name="eer-grouping" />
                        </VStack>
                        <VStack align="start" width="100%" display="flex">
                            <HStack>
                                <FormLabel>
                                    Automatically detect particle size
                                </FormLabel>
                                <Switch
                                    defaultChecked
                                    colorScheme="murfey"
                                    onChange={handleSwitchChange}
                                    name="detect-particle-size"
                                />
                            </HStack>
                        </VStack>
                        {!particleDetection ? (
                            <VStack align="start" width="100%" display="flex">
                                <FormLabel>
                                    {`Particle diameter [${angstromHtmlChar}]`}
                                </FormLabel>
                                <Input
                                    defaultValue={200}
                                    name="particle-diameter"
                                />
                            </VStack>
                        ) : (
                            <></>
                        )}
                        <VStack align="start" width="100%" display="flex">
                            <HStack>
                                <FormLabel>Downscale in extraction</FormLabel>
                                <Switch
                                    defaultChecked
                                    colorScheme="murfey"
                                    name="downscale"
                                />
                            </HStack>
                        </VStack>
                    </VStack>
                </FormControl>
                <Button type="submit">Submit</Button>
            </VStack>
        </form>
    )
}