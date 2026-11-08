'use client';

import { type ReactNode, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardOutlined, SettingOutlined, ShoppingOutlined, TagsOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Flex, Layout, Menu, Typography } from 'antd';

import { BladeMark } from '@snb/sword-art';

import { apiFetch } from '@/shared/api';
import { SITE } from '@/shared/config';
import { getAdminToken, setAdminToken, subscribeAdminToken } from '@/shared/lib';

const { Sider, Header, Content } = Layout;

const ITEMS = [
  { key: '/', icon: <DashboardOutlined aria-hidden />, label: <Link href="/">대시보드</Link> },
  { key: '/products', icon: <TagsOutlined aria-hidden />, label: <Link href="/products">상품</Link> },
  { key: '/orders', icon: <ShoppingOutlined aria-hidden />, label: <Link href="/orders">주문</Link> },
  { key: '/users', icon: <TeamOutlined aria-hidden />, label: <Link href="/users">회원</Link> },
  { key: '/settings', icon: <SettingOutlined aria-hidden />, label: <Link href="/settings">관세·환율 설정</Link> },
];

function selectedKey(pathname: string): string {
  if (pathname === '/') return '/';
  return ITEMS.find((item) => item.key !== '/' && pathname.startsWith(item.key))?.key ?? '/';
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // 서버 렌더에서는 로그인 여부를 모르므로 undefined로 두고 아무것도 그리지 않습니다.
  const token = useSyncExternalStore(subscribeAdminToken, getAdminToken, () => undefined);
  const isLogin = pathname.startsWith('/login');

  useEffect(() => {
    if (token === null && !isLogin) router.replace('/login');
  }, [token, isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (!token) return null;

  const logout = () => {
    void apiFetch<void>('/api/admin/logout', { method: 'POST' }).finally(() => setAdminToken(null));
  };

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
            paddingBlock: 8,
            // 좁은 화면에서 줄이 바뀌어도 링크가 본문에 가리지 않게 높이를 내용에 맞춥니다.
            height: 'auto',
            minHeight: 64,
            lineHeight: 1.5,
            flexWrap: 'wrap',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Typography.Text type="secondary">포트폴리오용 가상 쇼핑몰 관리 화면 · Mock API</Typography.Text>
          {/* 쇼핑몰은 다른 앱(zone)이라 Next Link가 아닌 일반 링크로 이동합니다. */}
          <Flex align="center" gap={16}>
            <a href={SITE.shopUrl}>쇼핑몰 보기</a>
            <Button onClick={logout}>로그아웃</Button>
          </Flex>
        </Header>
        <Content id="main" tabIndex={-1} style={{ padding: 24, outline: 'none' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
