import { client } from "utils/api/client";

export const getInstrumentName = async () => {
  
  const response = await client.get(`instrument_name`);

  if (response.status !== 200) {
    return null;
  }
  
  return response.data;
};


