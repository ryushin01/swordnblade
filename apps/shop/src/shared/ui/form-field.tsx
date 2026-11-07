import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  hint?: string;
  error?: string;
}

/** 레이블, 도움말, 오류를 input과 연결한 입력 칸 */
export function TextField({ id: idProp, label, name, hint, error, className, required, ...props }: TextFieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm">
        {label}
        {required ? <span className="text-danger"> (필수)</span> : null}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={cn(
          'h-11 rounded-sm border border-input bg-wall-raised px-3 text-base text-ink placeholder:text-ink-muted',
          'aria-invalid:border-danger aria-invalid:border-2',
        )}
        {...props}
      />
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
