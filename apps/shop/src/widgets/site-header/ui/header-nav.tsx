'use client';

import { useSearchParams } from 'next/navigation';

import { usePathname } from '@/shared/i18n';

import { CategoryNav } from './category-nav';

import type { SwordCategory } from '@snb/domain';

const CATEGORIES: SwordCategory[] = ['east', 'west', 'legend'];

export function HeaderNav() {
  // 언어 경로(/en)를 뺀 주소입니다.
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get('category');
  const current =
    pathname === '/' && raw && CATEGORIES.includes(raw as SwordCategory) ? (raw as SwordCategory) : undefined;
  return <CategoryNav current={current} />;
}
