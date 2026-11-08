'use client';

import { type InputHTMLAttributes, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  name: string;
  hint?: string;
  error?: string;
}

/**
 * 비밀번호 칸. 붙여넣기와 자동 완성을 막지 않고(KWCAG 7.3.3), 보기 버튼으로 글자를 확인할 수 있습니다.
 * 버튼은 aria-pressed로 켜짐 상태를 알립니다.
 */
export function PasswordField({ id, label, name, hint, error, className, required, ...props }: PasswordFieldProps) {
  const t = useTranslations('Common');
  const [visible, setVisible] = useState(false);
  const toggleId = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm">
        {label}
        {required ? <span className="text-danger"> {t('required')}</span> : null}
      </label>
      <div className="flex">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'h-11 min-w-0 flex-1 rounded-l-sm border border-input bg-wall-raised px-3 text-base text-ink',
            'aria-invalid:border-danger aria-invalid:border-2',
          )}
          {...props}
        />
        <button
          id={toggleId}
          type="button"
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((value) => !value)}
          className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-r-sm border border-l-0 border-input bg-wall-raised px-3 text-sm text-ink hover:bg-wall"
        >
          {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          {t('showPassword')}
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
