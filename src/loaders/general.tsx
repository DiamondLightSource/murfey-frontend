import { client } from "utils/api/client";

export const getInstrumentName = async () => {
  const response = await client.get(`display/instruments/${sessionStorage.getItem("instrumentName")}/instrument_name`);

  if (response.status !== 200) {
    return null;
  }
  return response.data;
};

export const getInstrumentConnectionStatus = async () => {
  const response = await client.get(`instrument_server/instruments/${sessionStorage.getItem("instrumentName")}/instrument_server`, {}, false);

  if (response.status !== 200) {
    return false;
  }

  return response.data;
};

export const getUpstreamVisits = async (sessid: number) => {
  const response = await client.get(`session_info/correlative/sessions/${sessid}/upstream_visits`);

  if (response.status !== 200) {
    return null;
  }
  return response.data;
};

export const upstreamDataDownloadRequest = async (visitName: string, sessid: number) => {
  const response = await client.get(`session_info/correlative/visits/${visitName}/${sessid}/upstream_tiff_data_request`);

  if (response.status !== 200) {
    return null;
  }
  return response.data;
};
