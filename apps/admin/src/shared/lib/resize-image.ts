/** 긴 변이 max를 넘지 않게 비율을 지켜 줄인 크기 */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * 사진을 브라우저에서 줄여 JPEG로 바꿉니다(긴 변 1600px, 품질 0.85).
 * Mock 저장소 용량을 아끼고, 원본이 아주 커도 화면에 빨리 뜨게 합니다.
 */
export async function resizeImage(file: File, max = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('사진을 줄이지 못했습니다.'))),
      'image/jpeg',
      0.85,
    ),
  );
}
