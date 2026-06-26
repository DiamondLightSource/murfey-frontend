import {
  Box,
  Button,
  Card,
  Checkbox,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getUpstreamVisits, upstreamDataDownloadRequest } from 'loaders/general'
import { getInstrumentInfo } from 'loaders/general'
import { getMachineConfigData } from 'loaders/machineConfig'
import React, { useCallback, useEffect } from 'react'
import { MdFileDownload } from 'react-icons/md'
import { components } from 'schema/main'

type MachineConfig = components['schemas']['MachineConfig']

const InstrumentUpstreamVisitsCard = ({
  sessid,
  instrumentName,
  displayName,
  instrumentVisits,
  searchStrings,
}: {
  sessid: number
  instrumentName: string
  displayName: string
  instrumentVisits: Record<string, string>
  searchStrings: string[]
}) => {
  // Sort visits in ascending order
  const sortedVisits = Object.fromEntries(
    Object.entries(instrumentVisits).sort(([keyA], [keyB]) => {
      const [stringA, numberA] = keyA.split('-')
      const [stringB, numberB] = keyB.split('-')

      // Sort by visit name
      const stringComparison = stringA.localeCompare(stringB)
      if (stringComparison !== 0) return stringComparison

      // Sort by visit number
      return parseInt(numberA) - parseInt(numberB)
    })
  )

  // Choose which search strings to perform the download with
  const [visitName, setVisitName] = React.useState<string>('')
  const [visitPath, setVisitPath] = React.useState<string>('')
  const [selectedSearchStrings, setSelectedSearchStrings] = React.useState<
    string[]
  >([])
  const {
    isOpen: isOpenSelectSearchStrings,
    onOpen: onOpenSelectSearchStrings,
    onClose: onCloseSelectSearchStrings,
  } = useDisclosure()

  const toggleSelectedSearchStrings = (value: string) => {
    setSelectedSearchStrings((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const resetValues = () => {
    // Set states back to default values
    setVisitName('')
    setVisitPath('')
    setSelectedSearchStrings([])
  }

  const handleCloseSelectSearchStrings = () => {
    resetValues()
    onCloseSelectSearchStrings()
  }

  const handleUpstreamDataDownloadRequest = () => {
    // Request upstream data download
    upstreamDataDownloadRequest(
      instrumentName,
      sessid,
      visitName,
      visitPath,
      searchStrings.filter((item) => selectedSearchStrings.includes(item))
    )
    handleCloseSelectSearchStrings()
  }

  return (
    // Display upstream visits for a single instrument
    // Parameters to take: instrument name and upstream visits dict
    <Card
      w="100%"
      p={4}
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
    >
      {/* Logic for pop-up components */}
      <Modal
        isOpen={isOpenSelectSearchStrings}
        onClose={handleCloseSelectSearchStrings}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select search strings</ModalHeader>
          <ModalBody>
            Select the search strings you would like to use to find and download
            files with
            <Box
              display="flex"
              flexDirection="column"
              alignItems="left"
              justifyContent="start"
            >
              {searchStrings.map((item) => (
                <Checkbox
                  key={item}
                  isChecked={selectedSearchStrings.includes(item)}
                  onChange={() => toggleSelectedSearchStrings(item)}
                  pl={2}
                >
                  {item}
                </Checkbox>
              ))}
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleCloseSelectSearchStrings}
            >
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => handleUpstreamDataDownloadRequest()}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="start"
        justifyContent="start"
        gap={4}
      >
        <Heading fontSize="md" fontWeight="bold" lineHeight={1}>
          {displayName}
        </Heading>
        {/* Map each visit to a button */}
        {/* Allow buttons to wrap horizontally*/}
        <Box
          w="100%"
          display="grid"
          gridTemplateColumns="repeat(auto-fit, 16ch)"
          justifyContent="center"
          gap={4}
        >
          {!!Object.keys(sortedVisits).length ? (
            Object.entries(sortedVisits).map(
              ([visitName, visitPath]: [string, string]) => {
                return (
                  <Button
                    maxW="16ch"
                    variant="default"
                    rightIcon={<MdFileDownload />}
                    cursor="pointer"
                    onClick={() => {
                      setVisitName(visitName)
                      setVisitPath(visitPath)
                      setSelectedSearchStrings(searchStrings)
                      onOpenSelectSearchStrings()
                    }}
                    fontSize="md"
                  >
                    {visitName}
                  </Button>
                )
              }
            )
          ) : (
            <>No related visits found</>
          )}
        </Box>
      </Box>
    </Card>
  )
}

export const UpstreamVisitsCard = ({ sessid }: { sessid: number }) => {
  const [upstreamVisits, setUpstreamVisits] = React.useState<
    Record<string, Record<string, string>>
  >({})

  // Load all visits associated with current session
  const resolveVisits = useCallback(async () => {
    const visits = await getUpstreamVisits(sessid)
    if (!visits) return // Handle null or false-y cases
    setUpstreamVisits(visits)
  }, [sessid])

  useEffect(() => {
    resolveVisits()
  }, [sessid, resolveVisits])

  // Set up queryClient to load names of all instruments
  type InstrumentInfo = {
    instrument_name: string
    display_name: string
    instrument_url: string
  }
  const { data: instrumentInfo } = useQuery<InstrumentInfo[]>({
    queryKey: ['instrumentInfo'],
    queryFn: getInstrumentInfo,
    staleTime: 60000,
  })

  // Set up function to get the corresponding display name of the instrument
  const getDisplayName = (instrumentName: string) => {
    if (!instrumentInfo) return instrumentName
    const result = instrumentInfo.find(
      (item) => item.instrument_name === instrumentName
    )
    // Use instrument name if no results were found or if display name wasn't set
    return result
      ? result.display_name
        ? result.display_name
        : instrumentName
      : instrumentName
  }

  // Set up queryClient to get the current instrument's machine config
  const { data: machineConfig } = useQuery<MachineConfig>({
    queryKey: ['machineConfig'],
    queryFn: getMachineConfigData,
    staleTime: 60000,
  })
  const getUpstreamDataSearchStrings = (instrumentName: string) => {
    // Early returns if the key or instrument doesn't exist
    if (!machineConfig?.upstream_data_search_strings) return []
    if (!machineConfig.upstream_data_search_strings[instrumentName]) return []
    // Return filtered list of strings
    return Array.from(
      new Set(machineConfig.upstream_data_search_strings[instrumentName])
    )
  }

  return !!Object.keys(upstreamVisits).length && !!instrumentInfo ? (
    <Card
      w="100%"
      p={4}
      cursor="default"
      _hover={{
        cursor: 'default',
        borderColor: 'murfey.400',
      }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        alignItems="start"
        justifyContent="start"
        gap={4}
      >
        <Heading fontSize="md" fontWeight="bold" lineHeight={1}>
          Download Upstream Visit Data
        </Heading>
        {/* Map each instrument to its own card */}
        {Object.entries(upstreamVisits).map(
          ([instrumentName, instrumentVisits]: [
            string,
            Record<string, string>,
          ]) => {
            return (
              <InstrumentUpstreamVisitsCard
                sessid={sessid}
                instrumentName={instrumentName}
                displayName={getDisplayName(instrumentName)}
                instrumentVisits={instrumentVisits}
                searchStrings={getUpstreamDataSearchStrings(instrumentName)}
              />
            )
          }
        )}
      </Box>
    </Card>
  ) : (
    <></>
  )
}
