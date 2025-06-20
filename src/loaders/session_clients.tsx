import { QueryClient } from "@tanstack/react-query";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { Params } from "react-router-dom";
import { convertUTCToUKNaive, convertUKNaiveToUTC } from "utils/generic";

export const includePage = (endpoint: string, limit: number, page: number) =>
  `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page - 1}&limit=${limit}`;

const getSessionsData = async () => {
  const response = await client.get(`session_info/instruments/${sessionStorage.getItem("instrumentName")}/sessions`);

  if (response.status !== 200) {
    return null;
  }

  return {
    current: response.data,
  };
};

export const getSessionDataForVisit = async (visit: string, instrumentName: string) => {
  if(visit === "" || instrumentName === "") return [];
  const response = await client.get(`session_info/instruments/${instrumentName}/visits/${visit}/sessions`);
  if (response.status !== 200) {
    return [];
  }

  return response.data;
}

export const getSessionData = async (sessid: string = "0") => {
  const response = await client.get(`session_info/session/${sessid}`);

  if (response.status !== 200) {
    return null;
  }
  // Convert naive times into UTC, if set
  if (!response.data.session.visit_end_time) return response.data;
  response.data = {
    ...response.data,
    session: {
      ...response.data.session,
      visit_end_time: convertUKNaiveToUTC(response.data.session.visit_end_time),
    }
  };
  return response.data;
};

export const linkSessionToClient = async (
  client_id: number,
  sessionName: string,
) => {
  const response = await client.post(`session_info/clients/${client_id}/session`, {
    session_name: sessionName,
  });
  if (response.status !== 200) {
    return null;
  }
  return response.data;
};

export const createSession = async (visit: string, sessionName: string, instrumentName: string, sessionEndTime: Date | null) => {
  const ukEndTime = sessionEndTime
    ? convertUTCToUKNaive(sessionEndTime.toISOString())
    : null;
  const response = await client.post(
    `session_info/instruments/${instrumentName}/visits/${visit}/session/${sessionName}`,
    {"end_time": ukEndTime},
  );
  if (response.status !== 200) {
    return null;
  }
  return response.data;
};

export const updateSession = async (sessionID: number, process: boolean = true) => {
  const response = await client.post(
    `session_info/sessions/${sessionID}?process=${process ? 'true': 'false'}`,
    {},
  );
  if (response.status !== 200) {
    return null;
  }
  return response.data;
}

export const updateVisitEndTime = async (sessionID: number, sessionEndTime: Date) => {
  const ukEndTime = convertUTCToUKNaive(sessionEndTime.toISOString())
  const response = await client.post(
    `instrument_server/sessions/${sessionID}/multigrid_controller/visit_end_time?end_time=${ukEndTime}`,
    {},
  );
  if (response.status !== 200) {
    return null;
  }
  return response.data;
}

export const deleteSessionData = async (sessid: number) => {
  const response = await client.delete(`session_info/sessions/${sessid}`);
  if (response.status !== 200) {
    return null;
  }
  return response.data;
};

const query = {
  queryKey: ["homepageSessions", sessionStorage.getItem("instrumentName")],
  queryFn: getSessionsData,
  staleTime: 60000,
};

export const sessionsLoader = (queryClient: QueryClient) => async () =>
  (await queryClient.getQueryData(query.queryKey)) ??
  (await queryClient.fetchQuery(query));


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
    return (
      (await queryClient.getQueryData(singleQuery.queryKey)) ??
      (await queryClient.fetchQuery(singleQuery))
    );
  };
