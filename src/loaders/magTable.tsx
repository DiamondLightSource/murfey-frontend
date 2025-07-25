import { QueryClient } from '@tanstack/react-query'
import { client } from 'utils/api/client'

const getMagTableData = async () => {
  const response = await client.get(`mag_table`)

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const addMagTableRow = async (
  magnification: number,
  pixelSize: number
) => {
  const response = await client.post(`mag_table/mag_table/`, [
    {
      magnification: magnification,
      pixel_size: pixelSize,
    },
  ])
  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const removeMagTableRow = async (magnification: number) => {
  const response = await client.delete(`mag_table/mag_table/${magnification}`)
  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const magTableLoader = (queryClient: QueryClient) => async () => {
  const queryKey = ['magTable']
  const queryFn = () => getMagTableData()
  const singleQuery = {
    queryKey: queryKey,
    queryFn: queryFn,
    staleTime: 60000,
  }

  return queryClient.ensureQueryData(singleQuery)
}
