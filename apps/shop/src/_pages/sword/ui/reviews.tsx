'use client';

import { type FormEvent, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useMe, useMyOrders } from '@/entities/session';
import { Link, usePathname } from '@/shared/i18n';
import { Avatar, Button } from '@/shared/ui';

import { useCreateReview, useReviews } from '../api/reviews';

import type { Locale, Review } from '@snb/domain';

function ReviewItem({ review }: { review: Review }) {
  const t = useTranslations('Reviews');
  const locale = useLocale() as Locale;
  const date = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'medium' }).format(
    new Date(review.createdAt),
  );
  return (
    <li className="flex gap-4 border-b border-line py-5 last:border-b-0">
      <Avatar src={review.avatarUrl} name={review.authorName} />
      <div className="grid min-w-0 gap-1">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span>{review.authorName}</span>
          <span className="text-sm text-ink-muted">{date}</span>
        </p>
        <p className="text-accent">
          <span aria-hidden="true">{'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</span>
          <span className="sr-only">{t('ratingOf', { n: review.rating })}</span>
        </p>
        <p className="whitespace-pre-line leading-relaxed">{review.text}</p>
      </div>
    </li>
  );
}

function ReviewForm({ slug }: { slug: string }) {
  const t = useTranslations('Reviews');
  const create = useCreateReview(slug);
  const [error, setError] = useState<string | null>(null);
  const lockRef = useRef(false);
  const errorId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lockRef.current) return;
    const form = new FormData(event.currentTarget);
    const rating = Number(form.get('rating'));
    const text = String(form.get('text') ?? '').trim();
    if (!rating) return setError(t('errorRating'));
    if (!text) return setError(t('errorText'));
    setError(null);
    lockRef.current = true;
    create.mutate(
      { rating, text },
      {
        // 성공하면 이 폼이 사라지므로 잠금은 실패했을 때만 풉니다.
        onSuccess: () => toast.success(t('saved')),
        onError: () => {
          lockRef.current = false;
          setError(t('failed'));
        },
      },
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-4" aria-describedby={error ? errorId : undefined}>
      <h3 className="text-carved text-lg">{t('formTitle')}</h3>
      <fieldset className="grid gap-1.5">
        <legend className="text-sm">{t('rating')}</legend>
        <div className="flex flex-wrap gap-x-4">
          {[5, 4, 3, 2, 1].map((n) => (
            <label key={n} className="inline-flex min-h-11 items-center gap-1.5">
              <input type="radio" name="rating" value={n} />
              {t('ratingOption', { n })}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-1.5">
        <label htmlFor="review-text" className="text-sm">
          {t('text')}
        </label>
        <textarea
          id="review-text"
          name="text"
          rows={4}
          maxLength={500}
          aria-describedby="review-text-hint"
          className="rounded-sm border border-input bg-wall-raised p-3 text-base"
        />
        <p id="review-text-hint" className="text-sm text-ink-muted">
          {t('hint')}
        </p>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={create.isPending} className="min-h-11 rounded-sm">
          {create.isPending ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  );
}

/** 구매한 회원의 후기. 지어낸 후기는 넣지 않으므로 처음에는 비어 있습니다. */
export function Reviews({ slug, swordId }: { slug: string; swordId: string }) {
  const t = useTranslations('Reviews');
  const pathname = usePathname();
  const { data: reviews } = useReviews(slug);
  const me = useMe();
  const orders = useMyOrders();
  const purchased = orders.data?.some(
    (order) => order.status !== 'cancelled' && order.lines.some((line) => line.swordId === swordId),
  );
  const written = reviews?.some((review) => review.userId === me.data?.id);

  let action = (
    <p className="text-sm text-ink-muted">
      {t('needLogin')}{' '}
      <Link
        href={{ pathname: '/login', query: { next: pathname } }}
        className="inline-flex min-h-6 items-center underline underline-offset-4"
      >
        {t('login')}
      </Link>
    </p>
  );
  if (me.data) {
    if (written) action = <p className="text-sm text-ink-muted">{t('already')}</p>;
    else if (purchased) action = <ReviewForm slug={slug} />;
    else action = <p className="text-sm text-ink-muted">{t('needPurchase')}</p>;
  }

  return (
    <section aria-labelledby="reviews-title" className="mx-auto grid max-w-3xl gap-6 px-4 py-12 sm:px-8">
      <h2 id="reviews-title" className="text-carved text-center text-2xl">
        {t('title')}
        {reviews && reviews.length > 0 ? (
          <span className="ml-2 text-base">{t('count', { count: reviews.length })}</span>
        ) : null}
      </h2>
      {reviews && reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-ink-muted">{t('empty')}</p>
      )}
      {action}
    </section>
  );
}
