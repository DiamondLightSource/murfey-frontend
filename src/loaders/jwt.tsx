import { client } from "utils/api/client";

type LoginDetails = {
  username: string;
  password: string;
};

export const getJWT = async (loginDetails: LoginDetails) => {
  const formData = new FormData();
  formData.append("username", loginDetails.username);
  formData.append("password", loginDetails.password);

  const response = await client.post(`auth/token`, formData);
  if (response.status !== 200) {
    return null;
  }

  return response.data;
};

export const handshake = async () => {
  const response = await client.post(`instrument_server/instruments/${sessionStorage.getItem("instrumentName")}/activate_instrument_server`, {});
  if (response.status !== 200) {
    return null;
  }

  return response.data;
}

export const sessionHandshake = async (sessid: number) => {
  const response = await client.post(`instrument_server/instruments/${sessionStorage.getItem("instrumentName")}/sessions/${sessid}/activate_instrument_server`, {});
  return response.data;
}

export const sessionTokenCheck = async (sessid: number) => {
  const response = await client.get(`instrument_server/instruments/${sessionStorage.getItem("instrumentName")}/sessions/${sessid}/active`);
  return response.data.active;
}
