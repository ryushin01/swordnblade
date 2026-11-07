'use client';

import Link from 'next/link';
import { Alert, Card, Col, Row, Statistic, Table, Typography } from 'antd';

import { COUNTRY_NAME, formatKRW, type Order, type Sword } from '@snb/domain';

import { OrderStatusTag, useOrders } from '@/entities/order';
import { useSwords } from '@/entities/sword';
import { ScrollRegion } from '@/shared/ui';

import { useStats } from '../api/stats';

export function DashboardPage() {
  const stats = useStats();
  const orders = useOrders();
  const swords = useSwords();
  const lowStock = (swords.data ?? []).filter((sword) => sword.stock <= 2);

  return (
    <>
      <Typography.Title level={1} style={{ fontSize: 24 }}>
        대시보드
      </Typography.Title>
      {stats.isError ? (
        <Alert type="error" title="통계를 불러오지 못했습니다." showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <Row gutter={[16, 16]}>
        {[
          { title: '판매 중인 상품', value: stats.data?.swordCount, suffix: '종' },
          { title: '재고 2점 이하', value: stats.data?.lowStock, suffix: '종' },
          { title: '주문(취소 제외)', value: stats.data?.orderCount, suffix: '건' },
          { title: '허가 확인 대기', value: stats.data?.pendingPermits, suffix: '건' },
          { title: '상품 매출', value: stats.data?.revenue, suffix: '원', wide: true },
        ].map((item) => (
          <Col key={item.title} xs={24} sm={12} xl={item.wide ? 8 : 4}>
            <Card variant="outlined">
              <Statistic title={item.title} value={item.value ?? 0} suffix={item.suffix} loading={stats.isPending} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={14}>
          <Card
            title={<h2 style={{ margin: 0, fontSize: 16 }}>최근 주문</h2>}
            extra={<Link href="/orders">전체 보기</Link>}
          >
            <ScrollRegion label="최근 주문 표">
              <Table<Order>
                rowKey="id"
                size="small"
                loading={orders.isPending}
                dataSource={(orders.data ?? []).slice(0, 5)}
                pagination={false}

                columns={[
                  { title: '주문번호', dataIndex: 'id' },
                  { title: '받는 분', dataIndex: ['customer', 'name'] },
                  {
                    title: '배송 국가',
                    dataIndex: 'destination',
                    render: (code: Order['destination']) => COUNTRY_NAME[code],
                  },
                  {
                    title: '결제 금액',
                    dataIndex: ['amounts', 'total'],
                    align: 'right',
                    render: (value: number) => formatKRW(value),
                  },
                  {
                    title: '상태',
                    dataIndex: 'status',
                    render: (status: Order['status']) => <OrderStatusTag status={status} />,
                  },
                ]}
              />
            </ScrollRegion>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            title={<h2 style={{ margin: 0, fontSize: 16 }}>재고 부족</h2>}
            extra={<Link href="/products">상품 관리</Link>}
          >
            <Table<Sword>
              rowKey="id"
              size="small"
              loading={swords.isPending}
              dataSource={lowStock}
              pagination={false}
              locale={{ emptyText: '재고가 부족한 상품이 없습니다.' }}
              columns={[
                {
                  title: '상품',
                  dataIndex: 'name',
                  render: (name: string, sword) => <Link href={`/products/${sword.id}`}>{name}</Link>,
                },
                { title: '재고', dataIndex: 'stock', align: 'right', render: (stock: number) => `${stock}점` },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
