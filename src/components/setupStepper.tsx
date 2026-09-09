import {
  Box,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react'

interface StepperStartConditions {
  activeStepIndex: number
}

export const SetupStepper = ({ activeStepIndex }: StepperStartConditions) => {
  const steps = [
    { title: 'Visit', description: 'Select visit' },
    { title: 'Data location', description: 'Create or look for visits here' },
    { title: 'Reference files', description: 'Transfer and process files' },
    { title: 'Parameters', description: 'Configure processing parameters' },
  ]

  const { activeStep } = useSteps({
    index: activeStepIndex,
    count: steps.length,
  })

  return (
    <Stepper index={activeStep}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box flexShrink="0">
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </Stepper>
  )
}
