'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

export interface ErrorSummaryItem {
  /** 틀린 칸의 id */
  fieldId: string;
  text: string;
}

/**
 * 제출 오류를 모아 보여 주는 요약. show를 부르면 요약이 화면에 그려진 뒤에 초점을 옮깁니다.
 * 같은 오류가 반복돼도 다시 옮기도록 횟수로 구분합니다.
 */
export function useErrorFocus(): { ref: RefObject<HTMLDivElement | null>; moveFocus: () => void } {
  const ref = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (tick > 0) ref.current?.focus();
  }, [tick]);
  return { ref, moveFocus: () => setTick((value) => value + 1) };
}

export function ErrorSummary({
  id,
  summaryRef,
  message,
  items,
}: {
  id: string;
  summaryRef: RefObject<HTMLDivElement | null>;
  message: string;
  items: ErrorSummaryItem[];
}) {
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby={id}
      className="rounded-sm border-2 border-danger bg-wall-raised p-4 text-danger"
    >
      <h2 id={id} className="text-base">
        {message}
      </h2>
      {items.length > 0 ? (
        <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
          {items.map((item) => (
            <li key={item.fieldId}>
              <a href={`#${item.fieldId}`} className="inline-block min-h-6 py-0.5 underline underline-offset-4">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
