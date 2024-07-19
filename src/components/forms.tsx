import {
  Divider,
  Text,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  RadioGroup,
  Radio,
  HStack,
  VStack,
  Select,
  Switch,
} from "@chakra-ui/react";

import React, { ReactElement } from "react";

const SpaForm = () => {
  const validateInt = (char: string) => {
    return /\d/.test(char);
  };
  const validateFloat = (char: string) => {
    return /^\d*\.?\d*$/.test(char);
  };
  const [symmetryType, setSymmetryType] = React.useState("C");
  const [particleDetection, setParticleDetection] = React.useState(true);
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSymmetryType(event.target.value);
  };
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParticleDetection(!particleDetection);
  };

  return (
    <FormControl>
      <VStack align="start" spacing={10} width="100%" display="flex">
        <VStack align="start" width="100%" display="flex">
          <FormLabel>{"Dose per frame [\u212B / pixel]"}</FormLabel>
          <Input defaultValue="1" />
        </VStack>
        <VStack align="start" width="100%" display="flex">
          <FormLabel>Symmetry</FormLabel>
          <HStack align="start" width="100%" display="flex">
            <Select defaultValue="C" onChange={handleChange}>
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
              isDisabled={["T", "O"].includes(symmetryType)}
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
          <HStack>
            <FormLabel>Automatically detect particle size</FormLabel>
            <Switch
              defaultChecked
              colorScheme="murfey"
              onChange={handleSwitchChange}
            />
          </HStack>
        </VStack>
        {!particleDetection ? (
          <VStack align="start" width="100%" display="flex">
            <FormLabel>{"Particle diameter [\u212B]"}</FormLabel>
            <Input defaultValue={200} />
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
              onChange={handleSwitchChange}
            />
          </HStack>
        </VStack>
      </VStack>
    </FormControl>
  );
};

const TomoForm = () => {
  return (
    <FormControl>
      <FormLabel>{"Dose per frame [\u212B / pixel]"}</FormLabel>
      <Input defaultValue="1" />
    </FormControl>
  );
};

interface Forms {
  [expType: string]: ReactElement;
}

export const getForm = (expType: string) => {
  let forms = {
    spa: SpaForm(),
    tomography: TomoForm(),
  } as Forms;
  return forms[expType];
};
