import { QueryClient } from "@tanstack/react-query";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { Params } from "react-router-dom";

export const includePage = (endpoint: string, limit: number, page: number) =>
  `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page - 1}&limit=${limit}`;

const getSessionsData = async () => {
  
    const response = await client.get(`sessions`);

    if (response.status !== 200) {
      return null;
    }
  
    return {
      current: response.data,
    };
  };

const getSessionData = async (sessid: string = "0") => {
  
    const response = await client.get(`session/${sessid}`);

    if (response.status !== 200) {
      return null;
    }
  
    return response.data;
  };
  
  const query = {
    queryKey: ["homepageSessions"],
    queryFn: getSessionsData,
    staleTime: 60000,
  };


  export const sessionsLoader = (queryClient: QueryClient) => async () =>
    (await queryClient.getQueryData(query.queryKey)) ?? (await queryClient.fetchQuery(query));


const queryBuilder = (sessid: string = "0") => {
    return {
        queryKey: ["sessionId", sessid],
        queryFn: () => getSessionData(sessid),
        staleTime: 60000,
    };
    };
    
export const sessionLoader =
    (queryClient: QueryClient) => async (params: Params) => {
        const singleQuery = queryBuilder(params.sessid);
        return ((await queryClient.getQueryData(singleQuery.queryKey)) ?? (await queryClient.fetchQuery(singleQuery)));
    };
