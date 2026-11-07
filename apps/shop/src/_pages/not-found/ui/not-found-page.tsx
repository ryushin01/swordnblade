import Link from 'next/link';

export function NotFoundPage() {
  return (
    <div className="grid justify-items-center gap-4 px-4 py-32 text-center">
      <p className="small-caps text-sm text-accent">404</p>
      <h1 className="text-carved text-3xl">이 자리에는 아무것도 새겨져 있지 않습니다</h1>
      <Link href="/" className="underline underline-offset-4">
        도검 벽으로 돌아가기
      </Link>
    </div>
  );
}
