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

import React from 'react'

interface StepperStartConditions {
    activeStepIndex: number
}


interface Step {
    title: string,
    description: string
}

const steps: Step[] = [
    { title: 'Visit', description: 'Select visit' },
    { title: 'Gain reference', description: 'Transfer and transform' },
    { title: 'Data location', description: 'Start data transfer' },
    { title: 'Parameters', description: 'For processing' },
]

type StepDisplayProps = {
    step: Step,
    index: number
}

function StepDisplay({ index, step }: StepDisplayProps) {
    return <Step key={index}>
        <StepIndicator>
            <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />} />
        </StepIndicator>

        <Box flexShrink="0">
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
        </Box>

        <StepSeparator />
    </Step>
}


const SetupStepper = ({ activeStepIndex }: StepperStartConditions) => {
    const { activeStep } = useSteps({
        index: activeStepIndex,
        count: steps.length,
    })

    return (
        <Stepper index={activeStep}>
            {steps.map((step, index) => (
                <StepDisplay step={step} index={index} />
            ))}
        </Stepper>
    )
}

export { SetupStepper }
