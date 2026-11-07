'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import type { SwordCategory } from '@snb/domain';
import { CategoryNav } from './category-nav';

const CATEGORIES: SwordCategory[] = ['east', 'west', 'legend'];

export function HeaderNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get('category');
  const current = pathname === '/' && raw && CATEGORIES.includes(raw as SwordCategory) ? (raw as SwordCategory) : undefined;
  return <CategoryNav current={pathname === '/' ? current : undefined} />;
}
