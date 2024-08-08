import {
    Card,
    CardBody,
    CardHeader,
    Image,
    Link,
    Text,
    HStack,
  } from "@chakra-ui/react";
  
  import { Link as LinkRouter, useLoaderData } from "react-router-dom";
  import { getInstrumentName } from "loaders/general";
  
  import React from "react";
  
  const getUrl = (endpoint: string) => {
    return process.env.REACT_APP_HUB_ENDPOINT + endpoint;
  };
  
  type InstrumentInfo = {
    "instrument_name": string,
    "display_name": string,
    "instrument_url": string,
  }

  const Hub = () => {
    const instrumentInfo = useLoaderData() as InstrumentInfo[];
  
    return (
    <HStack w="100%" spacing={3} p={3}>
        {instrumentInfo ? (instrumentInfo.map((ini) => {return (
        <Link w={{ base: "100%", md: "19.6%" }}
          _hover={{ textDecor: "none" }}
          as={LinkRouter}
          to={`/login`}>
        <Card align="center" onClick={() => sessionStorage.setItem("murfeyServerURL", ini.instrument_url + "/")}>
            <CardHeader>
                <Image src={getUrl(`instrument/${ini.instrument_name}/image`)} />
            </CardHeader>
            <CardBody>
            <Text>{ini.display_name}</Text>
            </CardBody>
        </Card>
        </Link>);
        })) : <></>}
    </HStack>
    );
  };
  
  export { Hub };