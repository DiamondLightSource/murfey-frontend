
import { ReactElement } from 'react'
import { SpaForm } from './SpaForm'
import { TomoForm } from './TomoForm'

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
