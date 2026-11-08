import { getTranslations, setRequestLocale } from 'next-intl/server';

import { categoryLabel, type Locale, SWORD_CATEGORIES } from '@snb/domain';
import { SEED_SWORDS } from '@snb/mocks';

import { localizeForLocale } from '@/entities/sword';
import { type AppLocale, languageAlternates, Link } from '@/shared/i18n';

import { type PeriodKey, periodOf, PERIODS } from '../model/period';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string }>;

export async function generateTimelineMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return { title: t('timeline'), alternates: languageAlternates('/timeline', locale as AppLocale) };
}

/** 시대(행)와 지역(열)의 표. 시드 도검으로 서버에서 그려 자바스크립트 없이도 보입니다. */
export async function TimelinePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Timeline');
  const regions = SWORD_CATEGORIES.filter((category) => category !== 'legend');
  const historical = SEED_SWORDS.filter((sword) => sword.category !== 'legend');
  const rows: PeriodKey[] = [...PERIODS.map((period) => period.key), 'unknown'];

  return (
    <div className="mx-auto grid w-full max-w-[90rem] gap-8 px-4 py-12 sm:px-8">
      <div className="grid justify-items-center gap-3 text-center">
        <h1 className="text-carved text-3xl">{t('title')}</h1>
        <p className="max-w-xl text-ink-muted">{t('intro')}</p>
      </div>
      <div role="region" aria-label={t('scrollLabel')} tabIndex={0} className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <caption className="sr-only">{t('caption')}</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-32 p-3 font-normal text-ink-muted">
                {t('period')}
              </th>
              {regions.map((region) => (
                <th key={region} scope="col" className="p-3 font-normal">
                  {categoryLabel(region, locale as Locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((period) => {
              const swords = historical.filter((sword) => periodOf(sword.era) === period);
              if (swords.length === 0) return null;
              return (
                <tr key={period} className="border-b border-line align-top">
                  <th scope="row" className="p-3 font-normal text-ink-muted">
                    {t(period)}
                  </th>
                  {regions.map((region) => (
                    <td key={region} className="p-3">
                      <ul className="grid gap-0.5">
                        {swords
                          .filter((sword) => sword.category === region)
                          .map((sword) => (
                            <li key={sword.id}>
                              <Link
                                href={`/swords/${sword.slug}`}
                                className="inline-block min-h-6 py-0.5 underline underline-offset-4"
                              >
                                {localizeForLocale(sword, locale as Locale).name}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
