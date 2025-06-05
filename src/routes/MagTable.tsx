import {
    Box,
    Button,
    FormControl,
    Heading,
    HStack,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    useDisclosure,
    VStack
} from '@chakra-ui/react'


import { addMagTableRow, removeMagTableRow } from 'loaders/magTable'
import { MdAdd, MdHorizontalRule } from 'react-icons/md'
import { useLoaderData } from 'react-router-dom'
import { components } from 'schema/main'

import { FormEvent } from 'react'

type MagTableRow = components['schemas']['MagnificationLookup']

const MagTable = () => {
    const magTable = useLoaderData() as MagTableRow[] | null
    const { isOpen, onOpen, onClose } = useDisclosure()
    // todo unused variable
    // const [numNewRows, setNumNewRows] = useState(0)

    const handleRemoveRow = (mag: number) => {
        removeMagTableRow(mag)
        window.location.reload()
    }

    const handleForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const mag = parseInt(formData.get('magnification') as string)
        const pixelSize = parseFloat(formData.get('pixelSize') as string)
        addMagTableRow(mag, pixelSize)
        window.location.reload()
    }

    return (
        <div className="rootContainer">
            <title>Murfey</title>
            <Box w="100%" bg="murfey.50">
                <Box w="100%" overflow="hidden">
                    <VStack className="homeRoot">
                        <VStack
                            bg="murfey.700"
                            justifyContent="start"
                            alignItems="start"
                            display="flex"
                            w="100%"
                            px="10vw"
                            py="1vh"
                        >
                            <Heading size="xl" color="murfey.50">
                                Magnification Table
                            </Heading>
                        </VStack>

                        <VStack
                            mt="0 !important"
                            w="100%"
                            px="10vw"
                            justifyContent="start"
                            alignItems="start"
                        >
                            <TableContainer>
                                <Table variant="simple">
                                    <TableCaption>
                                        Magnification Table
                                    </TableCaption>
                                    <Thead>
                                        <Tr>
                                            <Th>Magnification</Th>
                                            <Th>Pixel Size</Th>
                                            <Th>Remove</Th>
                                        </Tr>
                                    </Thead>
                                    <Modal isOpen={isOpen} onClose={onClose}>
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>
                                                Add Mag Table Row
                                            </ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                <form onSubmit={handleForm}>
                                                    <FormControl>
                                                        <HStack>
                                                            <Input
                                                                placeholder="Magnification"
                                                                name="magnification"
                                                            />
                                                            <Input
                                                                placeholder="Pixel size (Angstroms)"
                                                                name="pixelSize"
                                                            />
                                                        </HStack>
                                                    </FormControl>
                                                    <Button type="submit">
                                                        Submit
                                                    </Button>
                                                </form>
                                            </ModalBody>
                                        </ModalContent>
                                    </Modal>
                                    <Tbody>
                                        {magTable && magTable.length > 0 && magTable.map((row) => <MagTableRow row={row} handleRemoveRow={handleRemoveRow} />)}
                                    </Tbody>
                                    <Tfoot>
                                        <HStack>
                                            <IconButton
                                                aria-label="Add row to mag table"
                                                icon={<MdAdd />}
                                                size="m"
                                                onClick={onOpen}
                                            ></IconButton>
                                        </HStack>
                                    </Tfoot>
                                </Table>
                            </TableContainer>
                        </VStack>
                    </VStack>
                </Box>
            </Box>
        </div>
    )
}

export { MagTable }

type MagTableRowProps = {
    row: {
        magnification: number
        pixel_size: number
    }
    handleRemoveRow: (mag: number) => void
}

function MagTableRow({ row, handleRemoveRow }: MagTableRowProps) {
    return <Tr>
        <Td>
            <Text>
                {row.magnification}
            </Text>
        </Td>
        <Td>
            <Text>
                {row.pixel_size}
            </Text>
        </Td>
        <Td>
            <IconButton
                aria-label="Remove row from database"
                icon={<MdHorizontalRule />}
                onClick={() => handleRemoveRow(
                    row.magnification
                )}
            ></IconButton>
        </Td>
    </Tr>
}

