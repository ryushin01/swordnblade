'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardOutlined, SettingOutlined, ShoppingOutlined, TagsOutlined } from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';

import { BladeMark } from '@snb/sword-art';

import { SITE } from '@/shared/config';

import type { ReactNode } from 'react';

const { Sider, Header, Content } = Layout;

const ITEMS = [
  { key: '/', icon: <DashboardOutlined aria-hidden />, label: <Link href="/">대시보드</Link> },
  { key: '/products', icon: <TagsOutlined aria-hidden />, label: <Link href="/products">상품</Link> },
  { key: '/orders', icon: <ShoppingOutlined aria-hidden />, label: <Link href="/orders">주문</Link> },
  { key: '/settings', icon: <SettingOutlined aria-hidden />, label: <Link href="/settings">관세·환율 설정</Link> },
];

function selectedKey(pathname: string): string {
  if (pathname === '/') return '/';
  return ITEMS.find((item) => item.key !== '/' && pathname.startsWith(item.key))?.key ?? '/';
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: '100dvh' }}>
      <a href="#main" className="skip-link">
        본문 바로가기
      </a>
      <Sider breakpoint="lg" collapsedWidth={0} theme="light" width={220} style={{ borderRight: '1px solid #f0f0f0' }}>
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '20px 24px', color: 'inherit' }}
        >
          <BladeMark className="admin-mark" />
          <Typography.Text strong>Sword &amp; Blade</Typography.Text>
        </Link>
        <nav aria-label="관리 메뉴">
          <Menu mode="inline" selectedKeys={[selectedKey(pathname)]} items={ITEMS} style={{ borderInlineEnd: 0 }} />
        </nav>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            paddingInline: 24,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Typography.Text type="secondary">포트폴리오용 가상 쇼핑몰 관리 화면 · Mock API</Typography.Text>
          {/* 쇼핑몰은 다른 앱(zone)이라 Next Link가 아닌 일반 링크로 이동합니다. */}
          <a href={SITE.shopUrl}>쇼핑몰 보기</a>
        </Header>
        <Content id="main" tabIndex={-1} style={{ padding: 24, outline: 'none' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
