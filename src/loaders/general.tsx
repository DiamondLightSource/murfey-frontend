import { client } from 'utils/api/client'

export const getInstrumentInfo = async () => {
  const response = await client.hub_get(`instruments`)

  if (response.status !== 200) {
    return null
  }

  return response.data
}

export const getInstrumentName = async () => {
  const response = await client.get(
    `display/instruments/${sessionStorage.getItem('instrumentName')}/instrument_name`
  )

  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const getInstrumentConnectionStatus = async () => {
  const response = await client.get(
    `instrument_server/instruments/${sessionStorage.getItem('instrumentName')}/instrument_server`,
    {},
    false
  )

  if (response.status !== 200) {
    return false
  }

  return response.data
}

export const getUpstreamVisits = async (
  sessid: number
): Promise<Record<string, Record<string, string>> | null> => {
  const response = await client.get(
    `session_info/correlative/sessions/${sessid}/upstream_visits`
  )

  if (response.status !== 200) {
    return null
  }
  return response.data
}

export const upstreamDataDownloadRequest = async (
  instrumentName: string,
  sessid: number,
  visitName: string,
  visitPath: string
) => {
  const response = await client.post(
    `instrument_server/visits/${visitName}/sessions/${sessid}/upstream_file_data_request`,
    {
      upstream_instrument: instrumentName,
      upstream_visit_path: visitPath,
    }
  )

  if (response.status !== 200) {
    return null
  }
  return response.data
}
