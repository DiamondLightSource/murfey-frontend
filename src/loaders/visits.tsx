import { QueryClient } from "@tanstack/react-query";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { Params } from "react-router-dom";
import { parseDate} from "utils/generic"

const getVisitData = async () => {
  
  const response = await client.get(`visits_raw`);

  if (response.status !== 200) {
    return null;
  }
  
  return response.data;
};

const query = {
  queryKey: ["visits"],
  queryFn: getVisitData,
  staleTime: 60000,
};

export const visitLoader = (queryClient: QueryClient) => async () =>
(await queryClient.getQueryData(query.queryKey)) ?? (await queryClient.fetchQuery(query));
