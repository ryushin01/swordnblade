#!/usr/bin/env bash
# Vercel의 Ignored Build Step. 화면에 영향이 없는 변경이면 빌드를 건너뜁니다(종료 코드 0이 건너뛰기, 1이 빌드).
# 무료 요금제의 하루 배포 횟수를 아끼기 위한 것입니다.
# 마지막 커밋 하나가 아니라 직전에 배포한 커밋(VERCEL_GIT_PREVIOUS_SHA)부터의 변경을 봅니다.
# 그 커밋이 없거나 얕은 클론이라 찾을 수 없으면 안전하게 빌드합니다.
base="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$base" ] || ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  exit 1
fi
# 이름을 바꾼 파일은 옛 경로도 보도록 --no-renames를 씁니다. 비교가 실패하면 변경이 없다고 보지 않고 빌드합니다.
changed=$(git diff --no-renames --name-only "$base" HEAD) || exit 1
[ -z "$changed" ] && exit 0
if echo "$changed" | grep -qvE '(^docs/|\.md$|/e2e/|\.test\.tsx?$|\.stories\.tsx$|^\.github/)'; then
  exit 1
fi
exit 0
