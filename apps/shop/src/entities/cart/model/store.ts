'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SITE } from '@/shared/config';
import { safeJsonStorage } from '@/shared/lib/safe-storage';

import type { CartLine, CountryCode } from '@snb/domain';

export const MAX_QUANTITY = 5;

interface CartState {
  lines: CartLine[];
  destination: CountryCode;
  add: (swordId: string, quantity?: number) => void;
  setQuantity: (swordId: string, quantity: number) => void;
  remove: (swordId: string) => void;
  setDestination: (destination: CountryCode) => void;
  clear: () => void;
}

const clamp = (value: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));

export const toValidLines = (value: unknown): CartLine[] =>
  Array.isArray(value)
    ? value.filter(
        (line): line is CartLine =>
          typeof line?.swordId === 'string' && Number.isFinite(line?.quantity) && line.quantity > 0,
      )
    : [];

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      destination: 'KR',
      add: (swordId, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.swordId === swordId);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.swordId === swordId ? { ...line, quantity: clamp(line.quantity + quantity) } : line,
              ),
            };
          }
          return { lines: [...state.lines, { swordId, quantity: clamp(quantity) }] };
        }),
      setQuantity: (swordId, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) => (line.swordId === swordId ? { ...line, quantity: clamp(quantity) } : line)),
        })),
      remove: (swordId) => set((state) => ({ lines: state.lines.filter((line) => line.swordId !== swordId) })),
      setDestination: (destination) => set({ destination }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: SITE.cartStorageKey,
      storage: safeJsonStorage,
      skipHydration: true,
      // 저장값 형태가 어긋나도 머리글(모든 화면)이 멈추지 않게 맞는 줄만 받습니다.
      merge: (persisted, current) => {
        const saved = persisted as Partial<CartState> | undefined;
        return {
          ...current,
          lines: toValidLines(saved?.lines),
          destination: typeof saved?.destination === 'string' ? saved.destination : current.destination,
        };
      },
    },
  ),
);

export const selectItemCount = (state: CartState) => state.lines.reduce((sum, line) => sum + line.quantity, 0);
