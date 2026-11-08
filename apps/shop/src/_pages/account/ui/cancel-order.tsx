'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useCancelOrder } from '@/entities/session';
import { Button } from '@/shared/ui';

/** 되돌릴 수 없는 동작이라 한 번 더 확인합니다. 초점은 확인 버튼으로 옮기고, 그만두면 처음 버튼으로 돌립니다. */
export function CancelOrder({ orderId }: { orderId: string }) {
  const t = useTranslations('Account');
  const cancel = useCancelOrder();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const lockRef = useRef(false);
  const openRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
    else if (wasConfirming.current) openRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  const submit = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setFailed(false);
    cancel.mutate(orderId, {
      onSuccess: () => {
        toast.success(t('cancelDone'));
        // 이 영역이 사라지므로 초점을 주문 목록 제목으로 옮깁니다.
        document.getElementById('account-orders')?.focus();
      },
      onError: () => {
        lockRef.current = false;
        setFailed(true);
      },
    });
  };

  if (!confirming) {
    return (
      <p>
        <Button
          ref={openRef}
          type="button"
          variant="outline"
          className="min-h-11 rounded-sm"
          onClick={() => setConfirming(true)}
        >
          {t('cancelOpen')}
        </Button>
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm">{t('cancelQuestion')}</p>
      {failed ? (
        <p role="alert" className="text-sm text-danger">
          {t('cancelFailed')}
        </p>
      ) : null}
      <p className="flex flex-wrap gap-2">
        <Button
          ref={confirmRef}
          type="button"
          className="min-h-11 rounded-sm"
          disabled={cancel.isPending}
          onClick={submit}
        >
          {t('cancelConfirm')}
        </Button>
        <Button type="button" variant="outline" className="min-h-11 rounded-sm" onClick={() => setConfirming(false)}>
          {t('cancelBack')}
        </Button>
      </p>
    </div>
  );
}
