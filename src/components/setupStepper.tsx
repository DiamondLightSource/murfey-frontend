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
    { title: 'Visit', description: 'Select visit', active: true },
    { title: 'Gain reference', description: 'Transfer and transform', active: true },
    { title: 'Data location', description: 'Start data transfer', active: true },
    { title: 'Parameters', description: 'For processing', active: true },
    { title: 'Acquisition parameters', description: 'For automated acquisition', active: sessionStorage.getItem('serialemActive') },
  ]

  const { activeStep } = useSteps({
    index: activeStepIndex,
    count: steps.length,
  })

  return (
    <Stepper index={activeStep}>
      {steps.map((step, index) => {step.active ? (
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
      ): <></>}
      )}
    </Stepper>
  )
}
