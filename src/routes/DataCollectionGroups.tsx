import { Table } from '@diamondlightsource/ui-components'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useNavigate, useLoaderData, useParams } from 'react-router-dom'
import { components } from 'schema/main'
import { colours } from 'styles/colours'

type DataCollectionGroup = components['schemas']['DataCollectionGroup']

const DataCollectionGroups = () => {
  const dataCollectionGroups = useLoaderData() as {
    [key: string]: DataCollectionGroup
  }
  const { sessid } = useParams()
  const navigate = useNavigate()

  const SelectDataCollectionGroup = async (
    data: Record<string, any>,
    index: number
  ) => {
    navigate(
      `/sessions/${sessid}/data_collection_groups/${data['id']}/grid_squares`
    )
  }

  return (
    <div className="rootContainer">
      <Box
        className="homeRoot"
        sx={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          bgcolor: colours.murfey[50].default,
        }}
      >
        <Box
          sx={{
            bgcolor: colours.murfey[700].default,
            width: '100%',
            px: { xs: 4, md: 8 },
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: colours.murfey[50].default, lineHeight: 1 }}
          >
            Data Collection Groups
          </Typography>
        </Box>
        <Box
          sx={{
            mt: '1em',
            px: { xs: 4, md: 8 },
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {dataCollectionGroups ? (
            <Table
              width="80%"
              data={Object.values(dataCollectionGroups)}
              headers={[
                { key: 'tag', label: 'Tag' },
                { key: 'id', label: 'ID' },
                { key: 'atlas', label: 'Atlas' },
              ]}
              label={'dataCollectionGroupsData'}
              onClick={SelectDataCollectionGroup}
            />
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </div>
  )
}

export { DataCollectionGroups }
