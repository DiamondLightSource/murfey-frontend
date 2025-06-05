import { components } from "schema/main";

export type Session = components['schemas']['Session'];
export type InstrumentInfo = {
    instrument_name: string;
    display_name: string;
    instrument_url: string;
};

export type ProcessingDetails = components['schemas']['ProcessingDetails']
export type RSyncerInfo = components['schemas']['RSyncerInfo']
export type MachineConfig = components['schemas']['MachineConfig']
export type MultigridWatcherSpec = components['schemas']['MultigridWatcherSetup']