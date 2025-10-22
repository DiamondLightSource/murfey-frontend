import {
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  VStack,
  Select,
  Switch,
} from '@chakra-ui/react'
import React, { ReactElement } from 'react'

const formDataSPA: { [key: string]: any } = {
  type: 'SPA',
  dose_per_frame: 1,
  symmetry: 'C1',
  particle_diameter: null,
  extract_downscale: true,
  eer_fractionation: 20,
  run_class3d: true,
}

const formDataTomo: { [key: string]: any } = {
  type: 'tomo',
  dose_per_frame: 0.5,
  eer_fractionation: 20,
}

const SpaForm = (submissionCallback: (arg0: any) => void) => {
  const validateInt = (char: string) => {
    return /\d/.test(char)
  }
  const [symmetryType, setSymmetryType] = React.useState('C')
  const [particleDetection, setParticleDetection] = React.useState(true)
  const [runClass3D, setRunClass3D] = React.useState(true)
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSymmetryType(event.target.value)
  }
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParticleDetection(!particleDetection)
  }
  const handleClass3DSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRunClass3D(!runClass3D)
  }
  const setFormElement = (
    event: React.FormEvent<HTMLFormElement>,
    callback: (arg0: any) => void
  ) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formDataSPA.dose_per_frame = formData.get('dose')
    formDataSPA.symmetry = ['T', 'O'].includes(
      formData.get('symmetry1') as string
    )
      ? (formData.get('symmetry1') as string)
      : (((formData.get('symmetry1') as string) +
          formData.get('symmetry2')) as string)
    formDataSPA.particle_diameter = particleDetection
      ? null
      : formData.get('particle-diameter')
    formDataSPA.eer_fractionation = formData.get('eer-grouping')
    formDataSPA.run_class3d = runClass3D
    callback(formDataSPA)
  }

  return (
    <form onSubmit={(e) => setFormElement(e, submissionCallback)}>
      <VStack align="start" spacing={10} width="100%" display="flex">
        <FormControl>
          <VStack align="start" spacing={10} width="100%" display="flex">
            <VStack align="start" width="100%" display="flex">
              <FormLabel>{'Dose per frame [\u212B / pixel]'}</FormLabel>
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
                  isDisabled={['T', 'O'].includes(symmetryType)}
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
                {'EER grouping (number of EER frames in each fraction)'}
              </FormLabel>
              <Input defaultValue="20" name="eer-grouping" />
            </VStack>
            <VStack align="start" width="100%" display="flex">
              <HStack>
                <FormLabel>Automatically detect particle size</FormLabel>
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
                <FormLabel>{'Particle diameter [\u212B]'}</FormLabel>
                <Input defaultValue={200} name="particle-diameter" />
              </VStack>
            ) : (
              <></>
            )}
            <VStack align="start" width="100%" display="flex">
              <HStack>
                <FormLabel>Run 3D classification</FormLabel>
                <Switch
                  defaultChecked
                  colorScheme="murfey"
                  onChange={handleClass3DSwitchChange}
                  name="run-class3d"
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

const TomoForm = (submissionCallback: (arg0: any) => void) => {
  const setFormElement = (
    event: React.FormEvent<HTMLFormElement>,
    callback: (arg0: any) => void
  ) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formDataTomo.dose_per_frame = formData.get('dose')
    formDataTomo.eer_fractionation = formData.get('eer-grouping')
    callback(formDataTomo)
  }
  return (
    <form onSubmit={(e) => setFormElement(e, submissionCallback)}>
      <VStack align="start" spacing={10} width="100%" display="flex">
        <FormControl>
          <VStack align="start" spacing={10} width="100%" display="flex">
            <VStack align="start" width="100%" display="flex">
              <FormLabel>{'Dose per frame [\u212B / pixel]'}</FormLabel>
              <Input defaultValue="0.5" name="dose" />
            </VStack>
            <VStack align="start" width="100%" display="flex">
              <FormLabel>
                {'EER grouping (number of EER frames in each fraction)'}
              </FormLabel>
              <Input defaultValue="20" name="eer-grouping" />
            </VStack>
          </VStack>
        </FormControl>
        <Button type="submit">Submit</Button>
      </VStack>
    </form>
  )
}

interface Forms {
  [expType: string]: ReactElement
}

export const getForm = (
  expType: string,
  submissionCallback: (arg0: any) => void
) => {
  let forms = {
    spa: SpaForm(submissionCallback),
    tomography: TomoForm(submissionCallback),
  } as Forms
  return forms[expType]
}
