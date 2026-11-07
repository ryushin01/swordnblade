'use client';

import Link from 'next/link';
import { Result } from 'antd';

export function NotFoundPage() {
  return (
    <Result
      status="404"
      title={<h1 style={{ fontSize: 24, margin: 0 }}>페이지를 찾을 수 없습니다</h1>}
      subTitle="주소를 확인하거나 대시보드로 돌아가세요."
      extra={<Link href="/">대시보드로 가기</Link>}
    />
  );
}
