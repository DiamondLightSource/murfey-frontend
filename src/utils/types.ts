import { components } from "schema/main";

export type Session = components['schemas']['Session'];
export type InstrumentInfo = {
    instrument_name: string;
    display_name: string;
    instrument_url: string;
};
