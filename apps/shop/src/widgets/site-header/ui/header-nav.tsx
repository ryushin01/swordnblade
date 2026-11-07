'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { CategoryNav } from './category-nav';

import type { SwordCategory } from '@snb/domain';

const CATEGORIES: SwordCategory[] = ['east', 'west', 'legend'];

export function HeaderNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get('category');
  const current =
    pathname === '/' && raw && CATEGORIES.includes(raw as SwordCategory) ? (raw as SwordCategory) : undefined;
  return <CategoryNav current={pathname === '/' ? current : undefined} />;
}
