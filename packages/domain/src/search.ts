/** 맥 등에서 입력한 한글은 자모가 나뉜 NFD로 올 수 있어 NFC로 맞추고, 대소문자와 띄어쓰기를 지웁니다. */
export const normalizeSearchText = (text: string): string => text.normalize('NFC').toLowerCase().replace(/\s+/g, '');
