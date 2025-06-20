import {
    Card,
    CardBody,
    CardHeader,
    Image,
    Link,
    Text,
    HStack,
    Heading,
    VStack,
    Box,
    SimpleGrid,
  } from "@chakra-ui/react";

import { TbMicroscope, TbSnowflake } from "react-icons/tb";
import { Link as LinkRouter, useLoaderData } from "react-router-dom";
import { getInstrumentName } from "loaders/general";

import React, { useEffect } from "react";

const getUrl = (endpoint: string) => {
  return process.env.REACT_APP_HUB_ENDPOINT + endpoint;
};

type InstrumentInfo = {
  "instrument_name": string,
  "display_name": string,
  "instrument_url": string,
}

export const Hub = () => {
  const instrumentInfo = useLoaderData() as InstrumentInfo[];
  const [sessionStorageInfo, setSessionStorageInfo] = React.useState<(InstrumentInfo | null)>(null);

  // When first landing on this page, clear stored session info from browser
  useEffect(() => {
    console.log("Resetting storage information")
    sessionStorage.removeItem("murfeyServerURL")
    sessionStorage.removeItem("instrumentName")
  }, []);

  // Saves the correct info into browser Session Storage
  useEffect(() => {
    if (!sessionStorageInfo) return;
    sessionStorage.setItem("murfeyServerURL", sessionStorageInfo.instrument_url + "/");
    sessionStorage.setItem("instrumentName", sessionStorageInfo.instrument_name);
  }, [sessionStorageInfo]);

  return (
    <Box w="100%" overflow="hidden">
    <VStack
      justifyContent="start"
      alignItems="start"
      display="flex"
      w="100%"
      px="10vw"
      py="1vh"
      bg="murfey.700"
    >
      <Heading size="xl" w="100%" color="murfey.50">
        <HStack> <TbSnowflake/> <TbMicroscope/> </HStack>
        Murfey Hub
      </Heading>
    </VStack>
    <SimpleGrid
      minChildWidth='250px'
      spacing={10}
      p={3}
      justifyContent="start"
      alignItems="start"
      display="flex"
      w="100%"
    >
      {instrumentInfo
        ? (instrumentInfo.map((ini) => {return (
          <Link
            w={{ base: "100%", md: "19.6%" }}
            _hover={{ textDecor: "none" }}
            as={LinkRouter}
            to={
              // Direct users to /login only if authenticating with 'password'
              process.env.REACT_APP_BACKEND_AUTH_TYPE === "cookie"
              ? `/home`
              : `/login`
            }
          >
            <Card align="center" onClick={() => setSessionStorageInfo(ini)}>
              <CardHeader>
                <Image src={getUrl(`instrument/${ini.instrument_name}/image`)} />
              </CardHeader>
              <CardBody>
                <Text>{ini.display_name}</Text>
              </CardBody>
            </Card>
          </Link>);
        }))
        : <></>
      }
    </SimpleGrid>
    </Box>
  );
};
