import { QueryClient } from '@tanstack/react-query'
import { Params } from 'react-router-dom'
import { components } from 'schema/main'
import { client } from 'utils/api/client'
import { convertUKNaiveToUTC } from 'utils/generic'

type Visit = components['schemas']['Visit']
const getVisitData = async (instrumentName: string) => {
  const response = await client.get(
    `session_info/instruments/${instrumentName}/visits_raw`
  )
  if (response.status !== 200) {
    return null
  }

  // Convert naive times into UTC
  response.data = response.data.map((item: Visit) => ({
    ...item,
    start: convertUKNaiveToUTC(item.start),
    end: convertUKNaiveToUTC(item.end),
  }))

  return response.data
}

export const visitLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params }) => {
    const instrumentName = params.instrumentName
    if (!instrumentName) return null

    const queryKey = ['visits', instrumentName]
    const queryFn = () => getVisitData(instrumentName)
    const singleQuery = {
      queryKey: queryKey,
      queryFn: queryFn,
      staleTime: 60000,
    }

    return queryClient.ensureQueryData(singleQuery)
  }
