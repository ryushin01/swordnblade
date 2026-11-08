#!/usr/bin/env bash
# Vercel의 Ignored Build Step. 화면에 영향이 없는 변경이면 빌드를 건너뜁니다(종료 코드 0이 건너뛰기, 1이 빌드).
# 무료 요금제의 하루 배포 횟수를 아끼기 위한 것입니다. 비교할 이전 커밋이 없으면 빌드합니다.
git rev-parse --verify HEAD^ >/dev/null 2>&1 || exit 1
changed=$(git diff --name-only HEAD^ HEAD)
[ -z "$changed" ] && exit 0
if echo "$changed" | grep -qvE '(^docs/|^README\.md$|^CHANGELOG\.md$|\.md$|/e2e/|\.test\.tsx?$|\.stories\.tsx?$|^\.github/)'; then
  exit 1
fi
exit 0
