import { Box, Heading, HStack, VStack, Input, Checkbox } from "@chakra-ui/react";

import { useNavigate, useLoaderData, useSearchParams } from "react-router-dom";
import { components } from "schema/main";
import { Table } from "@diamondlightsource/ui-components";
import { SetupStepper } from "components/setupStepper";
import { prepareGainReference, transferGainReference } from "loaders/possibleGainRefs";

import React from "react";

type File = components["schemas"]["File"];

const GainRefTransfer = () => {
  const possibleGainRefs = useLoaderData() as File[] | null;
  let [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tag, setTag] = React.useState("");
  const [falcon, setFalcon] = React.useState(false);

  const SelectGainRef = async (data: Record<string, any>, index: number) => {
    const sessid = searchParams.get("sessid");
    const setup = searchParams.get("setup");
    if (sessid) {
      const transferStatus = await transferGainReference(parseInt(sessid), data["full_path"]);
      if (transferStatus.success) prepareGainReference(parseInt(sessid), data["full_path"], false, falcon, tag);
    }
    if (setup)
      sessid ? navigate(`/new_session/parameters/${sessid}`) : navigate("/");
    else sessid ? navigate(`/sessions/${sessid}`) : navigate("/");
  };

  return (
    <div className="rootContainer">
      <Box w="100%" bg="murfey.50" >
        <Box w="100%" overflow="hidden">
          <VStack className="homeRoot">
            <VStack bg="murfey.700" justifyContent="start" alignItems="start" display="flex" w="100%" px="10vw" py="1vh">
              <Heading size="xl" color="murfey.50">
                Possible Gain Reference Files
              </Heading>
            </VStack>
          </VStack>
        </Box>
        <Box
          mt="1em"
          px="10vw"
          w="100%"
          justifyContent={"center"}
          alignItems={"center"}
        >
          {searchParams.get("setup") ? (
            <SetupStepper activeStepIndex={1} />
          ) : null}
        </Box>
        <Box
          mt="1em"
          w="100%"
          justifyContent={"center"}
          alignItems={"center"}
          display={"flex"}
        >
          <HStack>
          <VStack>
          <Table
            data={possibleGainRefs}
            headers={[
              { key: "name", label: "Name" },
              { key: "timestamp", label: "Timestamp" },
              { key: "size", label: "Size [GB]" },
              { key: "full_path", label: "Full path" },
            ]}
            label={"gainRefData"}
            onClick={SelectGainRef}
          />
          <Input placeholder="Tag (optional)" w="50%" display={"flex"} onChange={(e) => setTag(e.target.value)}/>
          </VStack>
            <Checkbox onChange={(e) => setFalcon(e.target.checked)}>Falcon</Checkbox>
          </HStack>
        </Box>
      </Box>
    </div>
  );
};

export { GainRefTransfer };
