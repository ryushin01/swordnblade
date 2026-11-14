'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Flex, Input, Popconfirm, Table, Tag, Typography } from 'antd';

import {
  CATEGORY_LABEL,
  COUNTRY_NAME,
  discountStatus,
  formatKRW,
  KIND_LABEL,
  normalizeSearchText,
  priceOf,
  requiresPossessionPermit,
  type Sword,
  SWORD_CATEGORIES,
  SWORD_KINDS,
} from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';

import { useDeleteSword, useSwords } from '@/entities/sword';
import { SITE } from '@/shared/config';
import { useNow } from '@/shared/lib';
import { ScrollRegion } from '@/shared/ui';

/** 판매가 칸. 할인 중이면 정가에 줄을 긋고 할인율을 글자로 함께 보여 줍니다. */
function PriceCell({ sword, now }: { sword: Sword; now: number }) {
  const { price, listPrice, rate } = priceOf(sword, now);
  const scheduled = sword.discount && discountStatus(sword.discount, now) === 'scheduled' ? sword.discount : undefined;
  return (
    <Flex vertical align="flex-end">
      <span>{formatKRW(price)}</span>
      {rate > 0 ? (
        <Flex gap={4} align="center">
          <Typography.Text type="secondary" delete>
            <span className="sr-only">정가 </span>
            {formatKRW(listPrice)}
          </Typography.Text>
          <Tag style={{ marginInlineEnd: 0 }}>{rate}% 할인</Tag>
        </Flex>
      ) : scheduled ? (
        <Typography.Text type="secondary">
          {scheduled.startsAt}부터 {scheduled.rate}% 할인 예정
        </Typography.Text>
      ) : null}
    </Flex>
  );
}

export function ProductsPage() {
  const { data, isPending } = useSwords();
  const now = useNow();
  const remove = useDeleteSword();
  const [query, setQuery] = useState('');
  const needle = normalizeSearchText(query);
  const swords = needle
    ? data?.filter((sword) =>
        [sword.name, sword.nameEn, sword.nameOriginal].some((name) => normalizeSearchText(name).includes(needle)),
      )
    : data;

  return (
    <>
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <Typography.Title level={1} style={{ fontSize: 24, margin: 0 }}>
          상품
        </Typography.Title>
        {/* href를 주면 antd Button이 a 요소로 렌더됩니다(버튼 안에 링크를 넣지 않음). */}
        <Button type="primary" href={`${SITE.basePath}/products/new`} icon={<PlusOutlined aria-hidden />}>
          상품 등록
        </Button>
      </Flex>
      <Flex align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <label htmlFor="product-search">이름으로 찾기</label>
        <Input
          id="product-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="한글·영문·원어 이름"
          style={{ maxWidth: 320 }}
        />
        <span role="status">{swords ? `${swords.length}점` : ''}</span>
      </Flex>
      <ScrollRegion label="상품 목록 표">
        <Table<Sword>
          rowKey="id"
          loading={isPending}
          dataSource={swords}

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
              filters: SWORD_CATEGORIES.map((value) => ({ text: CATEGORY_LABEL[value], value })),
              onFilter: (value, sword) => sword.category === value,
              render: (category: Sword['category']) => CATEGORY_LABEL[category],
            },
            {
              title: '형태',
              dataIndex: 'kind',
              filters: SWORD_KINDS.map((value) => ({ text: KIND_LABEL[value], value })),
              onFilter: (value, sword) => sword.kind === value,
              render: (kind: Sword['kind']) => KIND_LABEL[kind],
            },
            { title: '출고지', dataIndex: 'origin', render: (origin: Sword['origin']) => COUNTRY_NAME[origin] },
            {
              title: '허가',
              key: 'permit',
              render: (_, sword) =>
                requiresPossessionPermit(sword.specs) ? (
                  <Badge color="#ad6800" text="소지허가 대상" />
                ) : (
                  <Badge color="#8c8c8c" text="장식용" />
                ),
            },
            {
              title: '판매가',
              key: 'price',
              align: 'right',
              sorter: (a, b) => priceOf(a, now).price - priceOf(b, now).price,
              filters: [
                { text: '할인 중', value: 'active' },
                { text: '할인 예정', value: 'scheduled' },
              ],
              onFilter: (value, sword) => !!sword.discount && discountStatus(sword.discount, now) === value,
              render: (_, sword) => <PriceCell sword={sword} now={now} />,
            },
            {
              title: '재고',
              dataIndex: 'stock',
              align: 'right',
              sorter: (a, b) => a.stock - b.stock,
              render: (stock: number) =>
                stock <= 2 ? <Badge color="#a8071a" text={`${stock}점 (부족)`} /> : `${stock}점`,
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
