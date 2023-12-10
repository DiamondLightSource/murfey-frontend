import { QueryClient } from "@tanstack/react-query";
import { client } from "utils/api/client";

const getMagTableData = async () => {
  
  const response = await client.get(`mag_table`);

  if (response.status !== 200) {
    return null;
  }
  
  return response.data;
};

const query = {
  queryKey: ["magTable"],
  queryFn: getMagTableData,
  staleTime: 60000,
};

export const magTableLoader = (queryClient: QueryClient) => async () =>
(await queryClient.getQueryData(query.queryKey)) ?? (await queryClient.fetchQuery(query));
