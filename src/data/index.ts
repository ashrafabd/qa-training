import { ASSESSMENTS, BRANDS, CHANNELS, META, PHASES, RESOURCES, UI, VIDEOS } from "./core";
import { PHASE_1_WEEKS } from "./phase1";
import { PHASE_2_WEEKS } from "./phase2";
import { PHASE_3_WEEKS } from "./phase3";
import { PHASE_4_WEEKS } from "./phase4";

export const WEEKS = [
  ...PHASE_1_WEEKS,
  ...PHASE_2_WEEKS,
  ...PHASE_3_WEEKS,
  ...PHASE_4_WEEKS
];

export { ASSESSMENTS, BRANDS, CHANNELS, META, PHASES, RESOURCES, UI, VIDEOS };
