/** 주소의 같은 이름 값이 반복되면(?q=a&q=b) Next.js는 배열을 줍니다. 첫 값만 씁니다. */
export const firstParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;
