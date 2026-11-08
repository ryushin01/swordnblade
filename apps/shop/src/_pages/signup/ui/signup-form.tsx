'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { isValidEmail, isValidPassword } from '@snb/domain';

import { useSignup } from '@/entities/session';
import { ApiRequestError } from '@/shared/api';
import { Link, useRouter } from '@/shared/i18n';
import { Button, PasswordField, TextField } from '@/shared/ui';

type Field = 'name' | 'email' | 'password' | 'passwordConfirm';
const ORDER: Field[] = ['name', 'email', 'password', 'passwordConfirm'];

export function SignupForm({ next }: { next: string }) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const signup = useSignup();
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
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('passwordConfirm') ?? '');
    const nextErrors: Partial<Record<Field, string>> = {};
    if (!name) nextErrors.name = t('errors.name');
    if (!isValidEmail(email)) nextErrors.email = t('errors.email');
    if (!isValidPassword(password)) nextErrors.password = t('errors.password');
    if (password !== confirm) nextErrors.passwordConfirm = t('errors.passwordConfirm');
    if (Object.keys(nextErrors).length > 0) return show(nextErrors, t('checkError'));

    lockRef.current = true;
    signup.mutate(
      { name, email, password },
      {
        onSuccess: () => router.replace(next),
        onError: (error) => {
          lockRef.current = false;
          if (error instanceof ApiRequestError && error.status === 409) {
            show({ email: t('errors.emailTaken') }, t('checkError'));
          } else if (error instanceof ApiRequestError && error.status === 422) {
            const fields = ORDER.filter((field) => field in error.fields);
            show(Object.fromEntries(fields.map((field) => [field, t(`errors.${field}`)])), t('checkError'));
          } else {
            show({}, t('genericError'));
          }
        },
      },
    );
  };

  const fieldList = ORDER.filter((field) => errors[field]);

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5" aria-busy={signup.isPending}>
      {message ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="signup-error-title"
          className="rounded-sm border-2 border-danger bg-wall-raised p-4 text-danger"
        >
          <h2 id="signup-error-title" className="text-base">
            {message}
          </h2>
          {fieldList.length > 0 ? (
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
              {fieldList.map((field) => (
                <li key={field}>
                  <a href={`#signup-${field}`} className="inline-block min-h-6 py-0.5 underline underline-offset-4">
                    {t(field)}: {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <TextField id="signup-name" label={t('name')} name="name" autoComplete="name" required error={errors.name} />
      <TextField
        id="signup-email"
        label={t('email')}
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        error={errors.email}
      />
      <PasswordField
        id="signup-password"
        label={t('password')}
        name="password"
        autoComplete="new-password"
        hint={t('passwordHint')}
        required
        error={errors.password}
      />
      <PasswordField
        id="signup-passwordConfirm"
        label={t('passwordConfirm')}
        name="passwordConfirm"
        autoComplete="new-password"
        required
        error={errors.passwordConfirm}
      />
      <Button type="submit" size="lg" disabled={signup.isPending} className="h-12 rounded-sm text-base small-caps">
        {signup.isPending ? t('submitting') : t('submitSignup')}
      </Button>
      <p className="text-center text-sm">
        <Link
          href={{ pathname: '/login', query: next === '/account' ? {} : { next } }}
          className="underline underline-offset-4"
        >
          {t('toLogin')}
        </Link>
      </p>
    </form>
  );
}
