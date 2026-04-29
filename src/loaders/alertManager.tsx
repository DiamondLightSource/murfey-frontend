import { client } from 'utils/api/client'

type Matcher = {
  isEqual: string
  isRegex: string
  name: string
  value: string
}
type Status = {
  state: string
}

export type Silence = {
  id: string
  status: Status
  updatedAt: string
  comment: string
  createdBy: string
  endsAt: Date
  matchers: Matcher[]
  startsAt: string
}

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

export const getSilences = async (instrumentName: string) => {
  //for testing
  instrumentName = 'm00'
  const response = await client.get(`session_info/silences/${instrumentName}`)
  //   console.log(response.status)
  //   console.log(response.data)
  //   console.log(response)
  if (response.status !== 200) {
    return null
  }
  //   console.log(response.data.replace(/'/ig,'"'))
  //   console.log(JSON.parse(response.data.replace(/'/ig,'"')))
  response.data = response.data.replaceAll('True', 'true')
  response.data = response.data.replaceAll('False', 'false')
  //   console.log(response.data)
  let silences: Silence[] = JSON.parse(response.data.replace(/'/gi, '"'))
  //   console.log(silences)
  //   console.log(silences[2])
  const activeSilences: Silence[] = silences.filter(
    (item: Silence) => item.status.state == 'active'
  )
  //   console.log(activeSilences)
  //   console.log(activeSilences[0].endsAt)

  return activeSilences
}

export const getLongestSilence = async (instrumentName: string) => {
  const activeSilences: Silence[] | null = await getSilences(instrumentName)
  if (activeSilences == null || activeSilences.length == 0) return null

  const longestSilence = activeSilences.reduce((a, b) =>
    a.endsAt > b.endsAt ? a : b
  )
  console.log(longestSilence)

  //   new Date(Math.max.apply(null, activeSilences.map(function(e) {
  //     return new Date(e.endsAt)
  //   })))
  return longestSilence
}
