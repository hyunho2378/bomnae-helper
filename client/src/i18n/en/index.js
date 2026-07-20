// EN 사전 병합 index (PATTERNS §18). 네임스페이스: common(A)/gate(B)/loop·brand(C)/legal(A).
import brand from './brand';
import common from './common';
import gate from './gate';
import legal from './legal';
import loop from './loop';

const en = { ...common, ...gate, ...loop, ...brand, ...legal };
export default en;
