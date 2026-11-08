'use client';

import { useQuery } from '@tanstack/react-query';
import { Table, Typography } from 'antd';
import dayjs from 'dayjs';

import { apiFetch } from '@/shared/api';
import { ScrollRegion } from '@/shared/ui';

import type { AdminUser } from '@snb/mocks';

export function UsersPage() {
  const { data, isPending } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<AdminUser[]>('/api/users'),
  });

  return (
    <>
      <Typography.Title level={1} style={{ fontSize: 24 }}>
        회원
      </Typography.Title>
      <ScrollRegion label="회원 목록 표">
        <Table<AdminUser>
          rowKey="id"
          loading={isPending}
          dataSource={data}
          locale={{ emptyText: '가입한 회원이 없습니다.' }}
          columns={[
            { title: '이름', dataIndex: 'name' },
            { title: '이메일', dataIndex: 'email' },
            {
              title: '가입 일시',
              dataIndex: 'createdAt',
              render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
              sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
              defaultSortOrder: 'descend',
            },
            {
              title: '주문 수',
              dataIndex: 'orderCount',
              align: 'right',
              sorter: (a, b) => a.orderCount - b.orderCount,
            },
          ]}
        />
      </ScrollRegion>
    </>
  );
}
