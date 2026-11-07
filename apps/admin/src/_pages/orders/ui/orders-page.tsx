'use client';

import { Descriptions, Select, Table, Typography } from 'antd';
import dayjs from 'dayjs';

import { COUNTRY_NAME, formatKRW, type Order, ORDER_STATUS_LABEL, type OrderStatus } from '@snb/domain';

import { OrderStatusTag, useOrders, useUpdateOrderStatus } from '@/entities/order';
import { ScrollRegion } from '@/shared/ui';

const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export function OrdersPage() {
  const { data, isPending } = useOrders();
  const update = useUpdateOrderStatus();

  return (
    <>
      <Typography.Title level={1} style={{ fontSize: 24 }}>
        주문
      </Typography.Title>
      <ScrollRegion label="주문 목록 표">
        <Table<Order>
          rowKey="id"
          loading={isPending}
          dataSource={data}

          expandable={{
            expandedRowRender: (order) => (
              <Descriptions size="small" column={{ xs: 1, md: 2 }} bordered>
                <Descriptions.Item label="주문 상품">
                  {order.lines
                    .map((line) => `${line.name} × ${line.quantity} (${COUNTRY_NAME[line.origin]} 출고)`)
                    .join(', ')}
                </Descriptions.Item>
                <Descriptions.Item label="배송지">
                  ({order.customer.postalCode}) {order.customer.address}
                </Descriptions.Item>
                <Descriptions.Item label="연락처">
                  {order.customer.phone} · {order.customer.email}
                </Descriptions.Item>
                <Descriptions.Item label="허가 확인">
                  {order.permitConfirmed ? '고객 확인함' : '해당 없음'}
                </Descriptions.Item>
                <Descriptions.Item label="금액 내역">
                  상품 {formatKRW(order.amounts.goods)} · 배송 {formatKRW(order.amounts.shipping)} · 관세{' '}
                  {formatKRW(order.amounts.duty)} · 부가세 {formatKRW(order.amounts.vat)}
                </Descriptions.Item>
              </Descriptions>
            ),
          }}
          columns={[
            { title: '주문번호', dataIndex: 'id' },
            {
              title: '주문 일시',
              dataIndex: 'createdAt',
              render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
              sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
              defaultSortOrder: 'descend',
            },
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
              filters: STATUSES.map((value) => ({ text: ORDER_STATUS_LABEL[value], value })),
              onFilter: (value, order) => order.status === value,
              render: (status: OrderStatus) => <OrderStatusTag status={status} />,
            },
            {
              title: '상태 변경',
              key: 'change',
              render: (_, order) => (
                <Select<OrderStatus>
                  aria-label={`${order.id} 주문 상태`}
                  value={order.status}
                  style={{ width: 140 }}
                  disabled={update.isPending}
                  options={STATUSES.map((value) => ({ value, label: ORDER_STATUS_LABEL[value] }))}
                  onChange={(status) => update.mutate({ id: order.id, status })}
                />
              ),
            },
          ]}
        />
      </ScrollRegion>
    </>
  );
}
