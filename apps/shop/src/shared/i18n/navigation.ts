import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/** 언어 경로(/en)를 알아서 붙이는 Link·router. 앱 안 이동에는 next/link 대신 이것을 씁니다. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
