import { Step, StepLabel, Stepper } from '@mui/material'

interface StepperStartConditions {
  activeStepIndex: number
}

export const SetupStepper = ({ activeStepIndex }: StepperStartConditions) => {
  const steps = [
    { title: 'Visit', description: 'Select visit' },
    { title: 'Gain reference', description: 'Transfer and transform' },
    { title: 'Data location', description: 'Start data transfer' },
    { title: 'Parameters', description: 'For processing' },
  ]

  return (
    <Stepper activeStep={activeStepIndex}>
      {steps.map((step, index) => (
        <Step key={index}>
          <StepLabel optional={step.description}>{step.title}</StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}
