import {
    Card,
    CardBody,
    CardHeader,
    Image,
    Link,
    Text,
  } from "@chakra-ui/react";

import { Link as LinkRouter } from "react-router-dom";
import { getInstrumentName } from "loaders/general";

import React from "react";

const getUrl = (endpoint: string) => {
    return process.env.REACT_APP_API_ENDPOINT + endpoint;
}


const InstrumentCard = () => {
    const [instrumentName, setInstrumentName] = React.useState('');

    const resolveName = async () => {
        const name: string = await getInstrumentName();
        setInstrumentName(name);
    }
    resolveName();

    return (
            <Link
                key="ag_table"
                _hover={{ textDecor: "none" }}
                as={LinkRouter}
                to={`../mag_table`}
            >
            <Card align='center'>
            <CardHeader>
            <Image src={getUrl('microscope_image/')} />
            </CardHeader>
            <CardBody>
            <Text>{instrumentName}</Text>
            </CardBody>
            </Card>
            </Link>
        );
};

export { InstrumentCard };
