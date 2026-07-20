// KR 사전 병합 index (PATTERNS §18).
import brand from './brand';
import common from './common';
import gate from './gate';
import legal from './legal';
import loop from './loop';

const ko = { ...common, ...gate, ...loop, ...brand, ...legal };
export default ko;
