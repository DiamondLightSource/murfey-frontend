import { Box, Heading, Button } from '@chakra-ui/react'
import { Table } from '@diamondlightsource/ui-components'
import { useNavigate, useLoaderData, useParams } from 'react-router-dom'
import { components } from 'schema/main'

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
      {/* Parent container for page contents */}
      <Box
        className="homeRoot"
        overflow="auto"
        display="flex"
        flexDirection="column"
        flex="1"
      >
        {/* Page title bar */}
        <Box
          bg="murfey.700"
          w="100%"
          px={{
            base: 8,
            md: 16,
          }}
          py={4}
          display="flex"
          flexDirection="column"
          alignItems="start"
          justifyContent="start"
          gap={2}
        >
          <Heading size="xl" color="murfey.50">
            Data Collection Groups
          </Heading>
        </Box>
        {/* Overflow container for page contents */}
        <Box overflow="auto" minW={0} flex="1">
          {/* Page contents */}
          <Box
            w="100%"
            minW="1000px"
            p={8}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="start"
            gap={8}
          >
            {/* Table showing data collection groups */}
            {dataCollectionGroups ? (
              <Box w="80%" minW="800px">
                <Table
                  data={Object.values(dataCollectionGroups)}
                  headers={[
                    { key: 'tag', label: 'Tag' },
                    { key: 'id', label: 'ID' },
                    { key: 'atlas', label: 'Atlas' },
                  ]}
                  label={'dataCollectionGroupsData'}
                  onClick={SelectDataCollectionGroup}
                />
              </Box>
            ) : (
              <></>
            )}
            <Button
              variant="default"
              onClick={() => navigate(`../sessions/${sessid}`)}
            >
              Back to Session
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export { DataCollectionGroups }
