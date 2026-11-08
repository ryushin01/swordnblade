import { buildCatalog } from './build';
import { EAST_ENTRIES } from './east';
import { LEGEND_A } from './legend-a';
import { LEGEND_B } from './legend-b';
import { LEGEND_C } from './legend-c';
import { MIDDLE_ENTRIES } from './middle';
import { TRAINING_ENTRIES } from './training';
import { WEST_ENTRIES } from './west';

/**
 * 시드 16점 뒤에 더하는 도검 목록(역사 도검 85점, 신화·전설 107점).
 * 나무위키 「고대~근세기 무기」「전설의 무기」의 도검류 목록을 바탕으로, 이미 있는 16점과 겹치는 것은 뺐습니다.
 */
export const CATALOG_SWORDS = buildCatalog([
  ...EAST_ENTRIES,
  ...MIDDLE_ENTRIES,
  ...WEST_ENTRIES,
  ...TRAINING_ENTRIES,
  ...LEGEND_A,
  ...LEGEND_B,
  ...LEGEND_C,
]);
