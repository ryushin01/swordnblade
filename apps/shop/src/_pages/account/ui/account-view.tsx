'use client';

import { useLocale, useTranslations } from 'next-intl';

import { canCustomerCancel, formatKRW, type Locale, type Order, orderStatusLabel } from '@snb/domain';

import { useLogout, useMe, useMyOrders, useSessionHydrated, useSessionStore } from '@/entities/session';
import { Link, useRouter } from '@/shared/i18n';
import { Button } from '@/shared/ui';

import { AvatarField } from './avatar-field';
import { CancelOrder } from './cancel-order';

function OrderItem({ order }: { order: Order }) {
  const t = useTranslations('Account');
  const locale = useLocale() as Locale;
  const [first, ...rest] = order.lines;
  const items = rest.length > 0 ? t('itemsCount', { name: first?.name ?? '', rest: rest.length }) : (first?.name ?? '');
  const date = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'medium' }).format(
    new Date(order.createdAt),
  );
  return (
    <li className="grid gap-1 border-b border-line py-4 last:border-b-0">
      <p className="flex flex-wrap items-baseline justify-between gap-x-4">
        <Link href={`/orders/${order.id}`} className="inline-block min-h-6 underline underline-offset-4">
          {t('orderLink', { id: order.id })}
        </Link>
        <span className="text-sm small-caps">{orderStatusLabel(order.status, locale)}</span>
      </p>
      <p className="text-sm text-ink-muted">
        {t('orderSummary', { date, items, total: formatKRW(order.amounts.total, locale) })}
      </p>
      {canCustomerCancel(order.status) ? <CancelOrder orderId={order.id} /> : null}
    </li>
  );
}

/** 내 계정: 회원 정보, 로그아웃, 내 주문. 로그인하지 않았으면 로그인 링크를 보여 줍니다. */
export function AccountView() {
  const t = useTranslations('Account');
  const auth = useTranslations('Auth');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const hydrated = useSessionHydrated();
  const token = useSessionStore((state) => state.token);
  const me = useMe();
  const orders = useMyOrders();
  const logout = useLogout();

  if (!hydrated || (token && me.isPending)) {
    return (
      <p role="status" className="text-center text-ink-muted">
        {t('loading')}
      </p>
    );
  }

  // 토큰은 있는데 네트워크·서버 오류로 못 불러온 경우입니다. 로그아웃 상태로 안내하지 않습니다.
  if (token && me.isError) {
    return (
      <div role="alert" className="grid justify-items-center gap-4 text-center">
        <p>{t('loadError')}</p>
        <Button type="button" variant="outline" className="min-h-11 rounded-sm" onClick={() => void me.refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!token || !me.data) {
    return (
      <div className="grid justify-items-center gap-4 text-center">
        <p>{t('needLogin')}</p>
        <p className="flex flex-wrap justify-center gap-4">
          <Link
            href={{ pathname: '/login', query: { next: '/account' } }}
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            {auth('submitLogin')}
          </Link>
          <Link href="/signup" className="inline-flex min-h-11 items-center underline underline-offset-4">
            {auth('submitSignup')}
          </Link>
        </p>
      </div>
    );
  }

  const user = me.data;
  const joined = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long' }).format(
    new Date(user.createdAt),
  );

  return (
    <div className="grid gap-10">
      <section aria-labelledby="account-profile" className="grid gap-4">
        <h2 id="account-profile" className="text-carved text-xl">
          {t('profile')}
        </h2>
        <AvatarField user={user} />
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-ink-muted">{auth('name')}</dt>
          <dd>{user.name}</dd>
          <dt className="text-ink-muted">{auth('email')}</dt>
          <dd className="break-all">{user.email}</dd>
          <dt className="text-ink-muted">{t('joined')}</dt>
          <dd>{joined}</dd>
        </dl>
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSettled: () => router.replace('/') })}
            className="min-h-11 rounded-sm small-caps"
          >
            {t('logout')}
          </Button>
        </div>
      </section>
      <section aria-labelledby="account-orders" className="grid gap-2">
        <h2 id="account-orders" tabIndex={-1} className="text-carved text-xl outline-none">
          {t('ordersTitle')}
        </h2>
        {orders.isPending ? (
          <p role="status" className="text-ink-muted">
            {t('loading')}
          </p>
        ) : orders.data && orders.data.length > 0 ? (
          <ul>
            {orders.data.map((order) => (
              <OrderItem key={order.id} order={order} />
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">{t('noOrders')}</p>
        )}
      </section>
    </div>
  );
}
