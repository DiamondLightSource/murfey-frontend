import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { client } from 'utils/api/client'

export const getAcquisitionParameterData = async () => {
  const response = await client.get(
    `session_parameters/atlas_optics`
  )

  if (response.status !== 200) {
    return null
  }

  return response.data
}


export const addAtlasOpticsSettings = async (
  params: any = {}
) => {
  const response = await client.post(
    `session_parameters/atlas_optics`,
    {
      name: params['name'] ?? '',
      mag: params['mag'] ?? 0,
      tiles_x: params['tiles_x'] ?? 0,
      tiles_y: params['tiles_y'] ?? 0,
      spot_size: params['spot_size'] ?? 0,
      c2_percentage: params['c2_percentage'] ?? 100,
    }
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

