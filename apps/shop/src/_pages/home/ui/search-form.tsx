import Form from 'next/form';
import { useLocale, useTranslations } from 'next-intl';

import { SWORD_SORTS, type SwordSort } from '@/entities/sword';
import { getPathname } from '@/shared/i18n';
import { selectClassName } from '@/shared/ui';

import type { SwordCategory } from '@snb/domain';

/**
 * 도검 찾기·정렬. GET 폼이라 자바스크립트 없이도 동작하고, 결과는 주소(?q=&sort=)에 남습니다.
 * 정렬을 바꿔도 바로 이동하지 않고 [찾기]를 눌러야 적용합니다(사용자 요구에 따른 실행).
 */
export function SearchForm({ category, q, sort }: { category?: SwordCategory; q: string; sort: SwordSort }) {
  const t = useTranslations('Home');
  const locale = useLocale();
  return (
    <Form
      action={getPathname({ href: '/', locale })}
      role="search"
      aria-label={t('searchLabel')}
      className="mx-auto flex max-w-[90rem] flex-wrap items-end gap-3 px-4 pb-6 sm:px-8"
    >
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <div className="grid min-w-0 flex-1 basis-56 gap-1.5">
        <label htmlFor="sword-q" className="text-sm">
          {t('queryLabel')}
        </label>
        <input
          id="sword-q"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t('queryPlaceholder')}
          autoComplete="off"
          className="h-11 rounded-sm border border-input bg-wall-raised px-3 text-base placeholder:text-ink-muted"
        />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="sword-sort" className="text-sm">
          {t('sortLabel')}
        </label>
        <select id="sword-sort" name="sort" defaultValue={sort} className={selectClassName}>
          {SWORD_SORTS.map((value) => (
            <option key={value} value={value}>
              {t(`sort.${value}`)}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="h-11 rounded-sm bg-ink px-6 text-primary-foreground small-caps hover:bg-ink/90">
        {t('submit')}
      </button>
    </Form>
  );
}
