import { client } from 'utils/api/client'

export const createSilence = async (
  instrumentName: string,
  proposedEndTime: Date
) => {
  const response = await client.post(
    `session_info/silences/${instrumentName}?end_time=${proposedEndTime.toISOString()}`,
    {}
  )
  console.log(response.status)
  console.log(response.data)
  console.log(response)
  if (response.status !== 200) {
    return null
  }
  return response.data
}
