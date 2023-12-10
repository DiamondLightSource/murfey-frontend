import {
    AlertDialog,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogContent,
    Box,
    Button,
    Divider,
    GridItem,
    Heading,
    HStack,
    IconButton,
    Link,
    Stack,
    Input,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    Tooltip,
    VStack,
    TableContainer,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
  } from "@chakra-ui/react";

import { Link as LinkRouter, useLoaderData } from "react-router-dom";
import { components } from "schema/main";
import { MdAdd, MdHorizontalRule } from "react-icons/md";
import { useRef } from "react";
import { deleteSessionData } from "loaders/session_clients";

import React from "react";

type MagTableRow = components["schemas"]["MagnificationLookup"];


const MagTable = () => {
  const magTable = useLoaderData() as MagTableRow[] | null;
  const [numNewRows, setNumNewRows] = React.useState(0);

  const handleAddClick = () => {
    setNumNewRows(numNewRows + 1);
  }
  const handleRemoveClick = () => {
    setNumNewRows(numNewRows === 0 ? 0: numNewRows - 1);
  }

  return (
    <div className='rootContainer'>
      <title>Murfey</title>
      <Box mt="-1em" mx='-7.3vw' bg='murfey.50' flex='1 0 auto'>
        <Box w='100%' overflow='hidden'>
          <VStack className='homeRoot'>
            <VStack bg='murfey.700' justifyContent='start' alignItems='start'>
              <Heading size='xl' color='murfey.50'>
                Magnification Table
              </Heading>
            </VStack>

            <VStack mt='0 !important' w='100%' px='10vw' justifyContent='start' alignItems='start'>
            <TableContainer>
                <Table variant='simple'>
                    <TableCaption>Magnification Table</TableCaption>
                    <Thead>
                    <Tr>
                        <Th>Magnification</Th>
                        <Th>Pixel Size</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                {magTable && magTable.length > 0 ? (
                    magTable.map((row) => {
                        return (
                            <Tr>
                                <Td><Input defaultValue={row.magnification}></Input></Td>
                                <Td><Input defaultValue={row.pixel_size}></Input></Td>
                            </Tr>
                        )
                        }
                    ) ): <></>}
                    {Array(numNewRows).fill(0).map(i => {
                        return (
                            <Tr>
                                <Td><Input></Input></Td>
                                <Td><Input></Input></Td>
                            </Tr>
                        )
                    })}
                        </Tbody>
                        <Tfoot>
                            <HStack>
                            <IconButton aria-label='Add row to mag table' icon={<MdAdd/>} size='m' onClick={handleAddClick}></IconButton>
                            <IconButton aria-label='Remove added row from mag table' icon={<MdHorizontalRule/>} size='m' onClick={handleRemoveClick}></IconButton>
                            </HStack>
                        </Tfoot>
                    </Table>
                    </TableContainer>
            </VStack>
          </VStack>
        </Box>
      </Box>
    </div>
  );
};

export { MagTable };
