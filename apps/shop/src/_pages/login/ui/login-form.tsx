'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { isValidEmail } from '@snb/domain';

import { useLogin } from '@/entities/session';
import { ApiRequestError } from '@/shared/api';
import { Link, useRouter } from '@/shared/i18n';
import { Button, PasswordField, TextField } from '@/shared/ui';

type Field = 'email' | 'password';

export function LoginForm({ next }: { next: string }) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const login = useLogin();
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);

  const show = (nextErrors: Partial<Record<Field, string>>, nextMessage: string) => {
    setErrors(nextErrors);
    setMessage(nextMessage);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lockRef.current) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const nextErrors: Partial<Record<Field, string>> = {};
    if (!isValidEmail(email)) nextErrors.email = t('errors.email');
    if (!password) nextErrors.password = t('errors.passwordRequired');
    if (Object.keys(nextErrors).length > 0) return show(nextErrors, t('checkError'));

    lockRef.current = true;
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.replace(next),
        onError: (error) => {
          lockRef.current = false;
          show({}, error instanceof ApiRequestError && error.status === 401 ? t('loginFailed') : t('genericError'));
        },
      },
    );
  };

  const fieldList = (Object.keys(errors) as Field[]).filter((field) => errors[field]);

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5" aria-busy={login.isPending}>
      {message ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="login-error-title"
          className="rounded-sm border-2 border-danger bg-wall-raised p-4 text-danger"
        >
          <h2 id="login-error-title" className="text-base">
            {message}
          </h2>
          {fieldList.length > 0 ? (
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
              {fieldList.map((field) => (
                <li key={field}>
                  <a href={`#login-${field}`} className="inline-block min-h-6 py-0.5 underline underline-offset-4">
                    {t(field)}: {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <TextField
        id="login-email"
        label={t('email')}
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        error={errors.email}
      />
      <PasswordField
        id="login-password"
        label={t('password')}
        name="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />
      <Button type="submit" size="lg" disabled={login.isPending} className="h-12 rounded-sm text-base small-caps">
        {login.isPending ? t('submitting') : t('submitLogin')}
      </Button>
      <p className="text-center text-sm">
        <Link
          href={{ pathname: '/signup', query: next === '/account' ? {} : { next } }}
          className="underline underline-offset-4"
        >
          {t('toSignup')}
        </Link>
      </p>
    </form>
  );
}
