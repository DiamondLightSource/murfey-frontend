import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'

export const getAcquisitionParameterData = async () => {
  const response = await client.get(
    `atlas_optics`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const acquisitionParametersLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {

    const queryKey = ['acquisitionParameters']
    const queryFn = () => getAcquisitionParameterData()
    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }
    return queryClient.ensureQueryData(singleQuery)
  }

