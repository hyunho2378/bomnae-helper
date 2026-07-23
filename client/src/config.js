// 앱 전역 config 상수.
// [V9] OFFICIAL_EMAIL — 9명 이상 단체 문의 안내에 노출되는 팀 공식 메일.
//   ⚠️ 커밋 전 사용자 확인 대상(지시 [4]). 현재 값은 코드베이스 기존 표기(Ticket·Footer)와 동일.
export const OFFICIAL_EMAIL = 'official@gts.ac.kr';
export const PARTY_CONTACT_THRESHOLD = 9; // 이 인원 이상이면 Build 비활성 + 문의 안내
