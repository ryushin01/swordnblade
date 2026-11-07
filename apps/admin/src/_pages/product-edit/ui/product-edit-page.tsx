'use client';

import { Alert, Breadcrumb, Card, Typography } from 'antd';
import Link from 'next/link';
import { useSword } from '@/entities/sword';
import { ProductForm } from './product-form';

function Heading({ title }: { title: string }) {
  return (
    <>
      <Breadcrumb items={[{ title: <Link href="/products">상품</Link> }, { title }]} style={{ marginBottom: 8 }} />
      <Typography.Title level={1} style={{ fontSize: 24 }}>
        {title}
      </Typography.Title>
    </>
  );
}

export function ProductCreatePage() {
  return (
    <>
      <Heading title="상품 등록" />
      <ProductForm />
    </>
  );
}

export function ProductEditView({ id }: { id: string }) {
  const { data, isPending, isError } = useSword(id);
  if (isError) return <Alert type="error" showIcon title="상품을 찾을 수 없습니다." />;
  if (isPending) return <Card loading />;
  return (
    <>
      <Heading title={`${data.name} 수정`} />
      <ProductForm key={data.id} initial={data} />
    </>
  );
}
