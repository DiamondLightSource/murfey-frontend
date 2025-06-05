
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack
} from '@chakra-ui/react'
import { formDataSPA } from './SpaForm'
import { angstromHtmlChar } from 'utils/constants'


// NOTE: is this necessary?
const formDataTomo: Record<string, any> = {
    type: 'tomo',
    dose_per_frame: 0.5,
    eer_fractionation: 20,
}


export const TomoForm = (submissionCallback: (arg0: any) => void) => {
    const setFormElement = (
        event: React.FormEvent<HTMLFormElement>,
        callback: (arg0: any) => void
    ) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        // NOTE is this correct? as formDataTomo is unused
        formDataSPA.dose_per_frame = formData.get('dose')
        formDataSPA.eer_fractionation = formData.get('eer-grouping')
        callback(formDataSPA)
    }
    return (
        <form onSubmit={(e) => setFormElement(e, submissionCallback)}>
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
                            <Input defaultValue="0.5" name="dose" />
                        </VStack>
                        <VStack align="start" width="100%" display="flex">
                            <FormLabel>
                                {
                                    'EER grouping (number of EER frames in each fraction)'
                                }
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
