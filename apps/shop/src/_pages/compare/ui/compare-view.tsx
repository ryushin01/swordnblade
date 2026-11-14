'use client';

import Form from 'next/form';
import { useLocale, useTranslations } from 'next-intl';

import {
  categoryLabel,
  formatLength,
  formatWeight,
  kindLabel,
  type Locale,
  type Sword,
  SWORD_CATEGORIES,
  type SwordCategory,
} from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';

import { localizeForLocale, SwordPrice, useSwords } from '@/entities/sword';
import { getPathname, Link } from '@/shared/i18n';
import { selectClassName } from '@/shared/ui';

import type { ReactNode } from 'react';

export interface SwordOption {
  slug: string;
  name: string;
  category: SwordCategory;
}

const SLOTS = ['a', 'b', 'c'] as const;

interface CompareViewProps {
  slugs: string[];
  options: SwordOption[];
  initialSwords: Sword[];
}

/** GET 폼으로 고르므로 조건이 주소(?a=&b=&c=)에 남아 그대로 공유할 수 있습니다. */
export function CompareView({ slugs, options, initialSwords }: CompareViewProps) {
  const t = useTranslations('Compare');
  const locale = useLocale() as Locale;
  const { data } = useSwords();
  const list = data?.map((sword) => localizeForLocale(sword, locale));
  const available: SwordOption[] = list ?? options;
  const pool = list ?? initialSwords;
  const swords = slugs.flatMap((slug) => pool.filter((sword) => sword.slug === slug));

  return (
    <>
      <Form
        key={slugs.join()}
        action={getPathname({ href: '/compare', locale })}
        aria-label={t('formLabel')}
        className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
      >
        {SLOTS.map((slot, index) => (
          <div key={slot} className="grid min-w-0 gap-1.5">
            <label htmlFor={`compare-${slot}`} className="text-sm">
              {t('slot', { n: index + 1 })}
            </label>
            <select
              id={`compare-${slot}`}
              name={slot}
              defaultValue={slugs[index] ?? ''}
              className={`${selectClassName} w-full min-w-0`}
            >
              <option value="">{t('none')}</option>
              {SWORD_CATEGORIES.map((category) => (
                <optgroup key={category} label={categoryLabel(category, locale)}>
                  {available
                    .filter((option) => option.category === category)
                    .map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        ))}
        <button
          type="submit"
          className="h-11 rounded-sm bg-ink px-6 text-primary-foreground small-caps hover:bg-ink/90"
        >
          {t('submit')}
        </button>
      </Form>

      {swords.length === 0 ? (
        <p className="py-12 text-center text-ink-muted">{t('needPick')}</p>
      ) : (
        <>
          {/* 칸 너비를 언제나 3등분으로 고정해, 고른 수와 상관없이 그림의 축척이 같습니다. */}
          <ul className="grid grid-cols-3 gap-2">
            {swords.map((sword) => (
              <li key={sword.id} className="grid justify-items-center gap-1 text-center">
                <SwordRelief art={sword.art} frame="catalog" pigment={0.72} className="aspect-square w-full" />
                <Link
                  href={`/swords/${sword.slug}`}
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  {sword.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-center text-sm text-ink-muted">{t('scaleNote')}</p>
          <SpecTable swords={swords} locale={locale} />
        </>
      )}
    </>
  );
}

function SpecTable({ swords, locale }: { swords: Sword[]; locale: Locale }) {
  const t = useTranslations('Compare');
  const rows: Array<[label: string, value: (sword: Sword) => ReactNode]> = [
    [t('region'), (sword) => categoryLabel(sword.category, locale)],
    [t('type'), (sword) => kindLabel(sword.kind, locale)],
    [t('era'), (sword) => sword.era],
    [t('blade'), (sword) => formatLength(sword.specs.bladeLength, locale)],
    [t('total'), (sword) => formatLength(sword.specs.totalLength, locale)],
    [t('weight'), (sword) => formatWeight(sword.specs.weight, locale)],
    [t('material'), (sword) => sword.specs.material],
    [t('edge'), (sword) => t(sword.specs.edge)],
    [t('price'), (sword) => <SwordPrice sword={sword} />],
  ];
  return (
    // 좁은 화면에서 가로로 스크롤하므로 키보드로도 움직일 수 있게 초점을 받습니다.
    <div role="region" aria-label={t('scrollLabel')} tabIndex={0} className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <caption className="sr-only">{t('tableCaption')}</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="p-3 font-normal text-ink-muted">
              {t('specHeader')}
            </th>
            {swords.map((sword) => (
              <th key={sword.id} scope="col" className="p-3 font-normal">
                {sword.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-line">
              <th scope="row" className="p-3 font-normal text-ink-muted">
                {label}
              </th>
              {swords.map((sword) => (
                <td key={sword.id} className="p-3 tabular-nums">
                  {value(sword)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
