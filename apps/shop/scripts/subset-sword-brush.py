"""칼 이름에만 쓰는 붓글씨 글꼴을 이름에 쓰인 한글만 남겨 만듭니다.

원본: 나눔손글씨 붓(Nanum Brush Script, SIL OFL 1.1). OFL의 예약 이름(NanumBrush) 때문에
줄인 파일은 이름을 SwordBrush로 바꿉니다. 글자 목록은 sword-brush.test.ts가 만듭니다.

    pip install fonttools brotli
    pnpm --filter @snb/shop subset:sword-brush
"""

import io
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

SOURCE = "https://raw.githubusercontent.com/google/fonts/main/ofl/nanumbrushscript/NanumBrushScript-Regular.ttf"
FONTS = Path(__file__).resolve().parent.parent / "src" / "_app" / "fonts"
FAMILY = "SwordBrush"


def main() -> None:
    text = (FONTS / "sword-brush.chars.txt").read_text(encoding="utf-8").strip()
    with urllib.request.urlopen(SOURCE) as response:
        font = TTFont(io.BytesIO(response.read()))
    options = subset.Options()
    options.flavor = "woff2"
    options.name_IDs = ["*"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    for record in font["name"].names:
        if record.nameID in (1, 4, 16, 21):
            record.string = FAMILY
        elif record.nameID == 6:
            record.string = f"{FAMILY}-Regular"
        elif record.nameID == 3:
            record.string = f"{FAMILY} subset"
    font.flavor = "woff2"
    target = FONTS / "sword-brush.woff2"
    font.save(target)
    print(f"{target.name}: {len(text)}자, {target.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
