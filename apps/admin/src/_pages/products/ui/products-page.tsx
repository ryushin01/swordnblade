'use client';

import Link from 'next/link';
import { Badge, Button, Flex, Popconfirm, Table, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CATEGORY_LABEL, COUNTRY_NAME, formatKRW, requiresPossessionPermit, type Sword } from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';
import { useDeleteSword, useSwords } from '@/entities/sword';
import { ScrollRegion } from '@/shared/ui';

export function ProductsPage() {
  const { data, isPending } = useSwords();
  const remove = useDeleteSword();

  return (
    <>
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <Typography.Title level={1} style={{ fontSize: 24, margin: 0 }}>
          상품
        </Typography.Title>
        {/* href를 주면 antd Button이 a 요소로 렌더됩니다(버튼 안에 링크를 넣지 않음). */}
        <Button type="primary" href="/products/new" icon={<PlusOutlined aria-hidden />}>
          상품 등록
        </Button>
      </Flex>
      <ScrollRegion label="상품 목록 표">
        <Table<Sword>
          rowKey="id"
          loading={isPending}
          dataSource={data}
          
          pagination={{ pageSize: 10, showSizeChanger: false }}
          columns={[
            {
              title: <span className="sr-only">그림</span>,
              key: 'art',
              width: 72,
              render: (_, sword) => <SwordRelief art={sword.art} pigment={0.8} className="admin-thumb" />,
            },
            {
              title: '이름',
              dataIndex: 'name',
              sorter: (a, b) => a.name.localeCompare(b.name, 'ko'),
              render: (name: string, sword) => (
                <Flex vertical>
                  <Link href={`/products/${sword.id}`}>{name}</Link>
                  <Typography.Text type="secondary">{sword.nameEn}</Typography.Text>
                </Flex>
              ),
            },
            {
              title: '분류',
              dataIndex: 'category',
              filters: (['east', 'west', 'legend'] as const).map((value) => ({ text: CATEGORY_LABEL[value], value })),
              onFilter: (value, sword) => sword.category === value,
              render: (category: Sword['category']) => CATEGORY_LABEL[category],
            },
            { title: '출고지', dataIndex: 'origin', render: (origin: Sword['origin']) => COUNTRY_NAME[origin] },
            {
              title: '허가',
              key: 'permit',
              render: (_, sword) =>
                requiresPossessionPermit(sword.specs) ? <Badge color="#ad6800" text="소지허가 대상" /> : <Badge color="#8c8c8c" text="장식용" />,
            },
            {
              title: '가격',
              dataIndex: 'price',
              align: 'right',
              sorter: (a, b) => a.price - b.price,
              render: (price: number) => formatKRW(price),
            },
            {
              title: '재고',
              dataIndex: 'stock',
              align: 'right',
              sorter: (a, b) => a.stock - b.stock,
              render: (stock: number) => (stock <= 2 ? <Badge color="#a8071a" text={`${stock}점 (부족)`} /> : `${stock}점`),
            },
            {
              title: '관리',
              key: 'actions',
              render: (_, sword) => (
                <Flex gap={8}>
                  <Link href={`/products/${sword.id}`} aria-label={`${sword.name} 수정`}>
                    수정
                  </Link>
                  <Popconfirm
                    title={`${sword.name}을(를) 삭제할까요?`}
                    description="삭제하면 쇼핑몰 목록에서 사라집니다."
                    okText="삭제"
                    cancelText="취소"
                    okButtonProps={{ danger: true, loading: remove.isPending }}
                    onConfirm={() => remove.mutate(sword.id)}
                  >
                    <Button type="link" danger size="small" aria-label={`${sword.name} 삭제`} style={{ padding: 0 }}>
                      삭제
                    </Button>
                  </Popconfirm>
                </Flex>
              ),
            },
          ]}
        />
      </ScrollRegion>
    </>
  );
}
