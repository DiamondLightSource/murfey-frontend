import { QueryClient } from '@tanstack/react-query'
import { client } from 'utils/api/client'

export const getMachineConfigData = async () => {
    const response = await client.get(
        `session_info/instruments/${sessionStorage.getItem('instrumentName')}/machine`
    )

    if (response.status !== 200) {
        return null
    }

    return response.data
}

const query = {
    queryKey: ['machineConfig'],
    queryFn: getMachineConfigData,
    staleTime: 60000,
}

export const machineConfigLoader = (queryClient: QueryClient) => async () =>
    (await queryClient.getQueryData(query.queryKey)) ??
    (await queryClient.fetchQuery(query))
