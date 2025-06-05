
export const EXPERIMENT_TYPES = ['spa', 'tomography'] as const;
export type ExperimentType = (typeof EXPERIMENT_TYPES)[number];
export const isValidExpType = (val: string): val is ExperimentType => EXPERIMENT_TYPES.includes(val as ExperimentType);
