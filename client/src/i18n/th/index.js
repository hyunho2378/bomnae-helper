// TH 사전 병합 index (PATTERNS §18). 초안 번역, 네이티브 검수 대기.
import brand from './brand';
import common from './common';
import gate from './gate';
import legal from './legal';
import gts from './gts';
import loop from './loop';

const th = { ...common, ...gate, ...loop, ...brand, ...legal, ...gts };
export default th;
