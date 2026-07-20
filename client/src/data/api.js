// 데이터 접근 단일 창구 — 모든 페이지는 이 파일만 호출한다 (COMPONENTS A2).
// PHASE 3에서 내부만 fetch로 교체(페이지 코드 diff 0이 완료 조건)하므로 전부 async.
import lines from './lines';
import stops, { meetingPoints } from './stops';
import { getDepartures as calcDepartures } from './departures';

// in-memory 저장소 — 웹스토리지 금지(DESIGN §15). PHASE 3에서 서버로 이관.
const bookings = new Map();
const handsfreeOrders = new Map();

// 6자 코드 — 혼동 문자(I/L/O/0/1) 제외
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export async function getLines() {
  return lines;
}

export async function getLine(id) {
  return lines.find((line) => line.id === id) ?? null;
}

export async function getStops(lineId) {
  return stops
    .filter((stop) => stop.line_id === lineId)
    .sort((a, b) => a.order - b.order);
}

export async function getMeetingPoints() {
  return meetingPoints;
}

export async function getDepartures(lineId, date) {
  return calcDepartures(lineId, date);
}

// payload: {lineId, departure_id, date, time, adults, children, total}
export async function createBooking(payload) {
  const code = makeCode();
  const booking = { id: code, code, status: 'confirmed', ...payload };
  bookings.set(code, booking);
  return booking;
}

export async function getBooking(id) {
  return bookings.get(id) ?? null;
}

// payload: {terminal, date, bags, address, email, total}
export async function createHandsFree(payload) {
  const code = makeCode();
  const order = { id: code, code, status: 'received', ...payload };
  handsfreeOrders.set(code, order);
  return order;
}
