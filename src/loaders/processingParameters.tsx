import { QueryClient } from '@tanstack/react-query'
import { client } from 'utils/api/client'
import { Params } from 'react-router-dom'

export const getSessionProcessingParameterData = async (
    sessid: string = '0'
) => {
    const response = await client.get(
        `session_parameters/sessions/${sessid}/session_processing_parameters`
    )

    if (response.status !== 200) {
        return null
    }

    return response.data
}

const getProcessingParameterData = async (sessid: string = '0') => {
    const response = await client.get(
        `session_info/spa/sessions/${sessid}/spa_processing_parameters`
    )

    if (response.status !== 200) {
        return null
    }

    return response.data
}

export const updateSessionProcessingParameters = async (
    sessid: string,
    params: any = {}
) => {
    const response = await client.post(
        `session_parameters/sessions/${sessid}/session_processing_parameters`,
        {
            gain_ref: params['gainRef'] ?? '',
            dose_per_frame: params['dosePerFrame'] ?? null,
            eer_fractionation_file: params['eerFractionationFile'] ?? '',
            symmetry: params['symmetry'] ?? '',
        }
    )
    if (response.status !== 200) {
        return null
    }
    return response.data
}

const queryBuilder = (sessid: string = '0') => {
    return {
        queryKey: ['sessionId', sessid],
        queryFn: () => getProcessingParameterData(sessid),
        staleTime: 60000,
    }
}

const querySessionParamsBuilder = (sessid: string = '0') => {
    return {
        queryKey: ['sessionId', sessid],
        queryFn: () => getSessionProcessingParameterData(sessid),
        staleTime: 60000,
    }
}

export const processingParametersLoader =
    (queryClient: QueryClient) => async (params: Params) => {
        const singleQuery = queryBuilder(params.sessid)
        return (
            (await queryClient.getQueryData(singleQuery.queryKey)) ??
            (await queryClient.fetchQuery(singleQuery))
        )
    }

export const sessionParametersLoader =
    (queryClient: QueryClient) => async (params: Params) => {
        const singleQuery = querySessionParamsBuilder(params.sessid)
        return (
            (await queryClient.getQueryData(singleQuery.queryKey)) ??
            (await queryClient.fetchQuery(singleQuery))
        )
    }

export { getProcessingParameterData }
