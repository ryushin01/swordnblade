'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SITE } from '@/shared/config';

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

/** localStorage를 쓸 수 없으면 메모리에만 담습니다. */
const safeStorage = createJSONStorage(() => {
  try {
    const probe = '__snb_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
      removeItem: (key: string) => void memory.delete(key),
    };
  }
});

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
    { name: SITE.cartStorageKey, storage: safeStorage, skipHydration: true },
  ),
);

export const selectItemCount = (state: CartState) => state.lines.reduce((sum, line) => sum + line.quantity, 0);
