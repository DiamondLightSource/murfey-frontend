import { QueryClient } from "@tanstack/react-query";
import { client } from "utils/api/client";

const getGainRefData = async () => {
  const response = await client.get(`possible_gain_references`);

  if (response.status !== 200) {
    return null;
  }

  return response.data;
};

export const transferGainReference = async (
  sessionId: number,
  gainRef: string,
) => {
  const response = await client.post(`sessions/${sessionId}/upload_gain_reference`, {
    gain_path: gainRef,
  });
  if (response.status !== 200) {
    return null;
  }
  return response.data;
};

export const prepareGainReference = async (
  sessionId: number,
  gainRef: string,
  rescale: boolean = false,
  eer: boolean = false,
  tag: string = "",
) => {
  const response = await client.post(`sessions/${sessionId}/process_gain`, {
    gain_ref: gainRef,
    rescale: rescale,
    eer: eer,
    tag: tag,
  });
  if (response.status !== 200) {
    return null;
  }
  return response.data;
};

const query = {
  queryKey: ["gainRefs"],
  queryFn: getGainRefData,
  staleTime: 60000,
};

export const gainRefLoader = (queryClient: QueryClient) => async () =>
  (await queryClient.getQueryData(query.queryKey)) ??
  (await queryClient.fetchQuery(query));
