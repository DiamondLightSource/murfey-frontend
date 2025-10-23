import { QueryClient } from '@tanstack/react-query'
import { client } from 'utils/api/client'

import { getInstrumentInfo } from './general'

const query = {
  queryKey: ['instrumentInfo'],
  queryFn: getInstrumentInfo,
  staleTime: 60000,
}

export const instrumentInfoLoader = (queryClient: QueryClient) => async () =>
  (await queryClient.getQueryData(query.queryKey)) ??
  (await queryClient.fetchQuery(query))
