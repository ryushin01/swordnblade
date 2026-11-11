export const PERIODS = [
  { key: 'bc2000', until: -1000 },
  { key: 'bc1000', until: 0 },
  { key: 'ad1', until: 500 },
  { key: 'ad500', until: 1000 },
  { key: 'ad1000', until: 1300 },
  { key: 'ad1300', until: 1500 },
  { key: 'ad1500', until: 1700 },
  { key: 'ad1700', until: 1900 },
  { key: 'ad1900', until: Infinity },
] as const;

export type PeriodKey = (typeof PERIODS)[number]['key'] | 'unknown';

/** 시대 이름의 대략적인 시작 연도 */
const NAMED_ERAS: Array<[pattern: RegExp, year: number]> = [
  [/청동기/, -1000],
  [/헤이안/, 900],
  [/가마쿠라/, 1250],
  [/무로마치/, 1400],
  [/에도/, 1650],
  [/신라/, 500],
  [/고려/, 1000],
  [/조선/, 1450],
  [/중세/, 1200],
  [/근세/, 1600],
  [/오늘/, 2000],
];

/** 시대 글(한국어)에서 가장 이른 연도를 찾습니다. 연대를 알 수 없으면 null */
export function earliestYear(era: string): number | null {
  const years: number[] = [];
  for (const match of era.matchAll(/기원전\s*(\d+)\s*천년기/g)) years.push(-Number(match[1]) * 1000 + 500);
  const withoutMillennia = era.replace(/기원전\s*\d+\s*천년기/g, '');
  for (const match of withoutMillennia.matchAll(/기원전\s*(\d+)(?:~\d+)?세기/g)) {
    years.push(-Number(match[1]) * 100 + 50);
  }
  const ad = withoutMillennia.replace(/기원전\s*\d+(?:~\d+)?세기/g, '');
  for (const match of ad.matchAll(/(\d{1,2})(?:~\d{1,2})?세기/g)) years.push((Number(match[1]) - 1) * 100 + 50);
  for (const match of ad.matchAll(/\d{4}/g)) years.push(Number(match[0]));
  // 숫자로 적은 연대가 더 정확하므로, 없을 때만 시대 이름으로 어림합니다. 메이지는 '메이지~1934'처럼 시작을 숫자로 안 적어 따로 봅니다.
  if (/메이지/.test(era)) years.push(1870);
  if (years.length === 0) for (const [pattern, year] of NAMED_ERAS) if (pattern.test(era)) years.push(year);
  return years.length > 0 ? Math.min(...years) : null;
}

export function periodOf(era: string): PeriodKey {
  const year = earliestYear(era);
  if (year === null) return 'unknown';
  return PERIODS.find((period) => year < period.until)!.key;
}
