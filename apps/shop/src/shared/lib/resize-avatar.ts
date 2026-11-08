/** 프로필 사진을 가운데 정사각형으로 잘라 256px JPEG로 줄입니다. 실패하면 원본을 돌려줍니다. */
export async function resizeAvatar(file: File, size = 256): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const side = Math.min(bitmap.width, bitmap.height);
    canvas
      .getContext('2d')
      ?.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}
