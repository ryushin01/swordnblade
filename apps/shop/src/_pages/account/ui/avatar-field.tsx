'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useUpdateAvatar } from '@/entities/session';
import { resizeAvatar } from '@/shared/lib/resize-avatar';
import { Avatar, Button } from '@/shared/ui';

import type { User } from '@snb/domain';

/** 프로필 사진 고르기·지우기. 파일 입력은 네이티브 그대로 써서 키보드와 화면낭독기로 쓸 수 있습니다. */
export function AvatarField({ user }: { user: User }) {
  const t = useTranslations('Account');
  const update = useUpdateAvatar();
  const [failed, setFailed] = useState(false);
  const lockRef = useRef(false);

  const save = (file: Blob | null) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setFailed(false);
    update.mutate(file, {
      onSuccess: () => toast.success(t('avatarSaved')),
      onError: () => setFailed(true),
      onSettled: () => {
        lockRef.current = false;
      },
    });
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) save(await resizeAvatar(file));
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar src={user.avatarUrl} name={user.name} className="size-16" />
      <div className="grid gap-1.5">
        <label htmlFor="account-avatar" className="text-sm">
          {t('avatarLabel')}
        </label>
        <input
          id="account-avatar"
          type="file"
          accept="image/*"
          aria-describedby="account-avatar-hint"
          disabled={update.isPending}
          onChange={(event) => void handleFile(event)}
          className="min-h-11 max-w-full text-sm"
        />
        <p id="account-avatar-hint" className="text-sm text-ink-muted">
          {t('avatarHint')}
        </p>
        {failed ? (
          <p role="alert" className="text-sm text-danger">
            {t('avatarFailed')}
          </p>
        ) : null}
      </div>
      {user.avatarUrl ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 rounded-sm"
          disabled={update.isPending}
          onClick={() => save(null)}
        >
          {t('avatarRemove')}
        </Button>
      ) : null}
    </div>
  );
}
