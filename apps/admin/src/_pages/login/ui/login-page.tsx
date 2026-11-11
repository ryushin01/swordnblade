'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';

import { ADMIN_DEMO_ACCOUNT } from '@snb/mocks';

import { apiFetch, ApiRequestError } from '@/shared/api';
import { setAdminToken } from '@/shared/lib';

interface Credentials {
  email: string;
  password: string;
}

export function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm<Credentials>();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const lockRef = useRef(false);

  const submit = async (values: Credentials) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setPending(true);
    setError(null);
    try {
      const { token } = await apiFetch<{ token: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setAdminToken(token);
      router.replace('/');
    } catch (cause) {
      lockRef.current = false;
      setPending(false);
      setError(cause instanceof ApiRequestError ? cause.message : '로그인하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <Flex component="main" justify="center" align="center" style={{ minHeight: '100dvh', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Typography.Title level={1} style={{ fontSize: 24 }}>
          어드민 로그인
        </Typography.Title>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="포트폴리오용 데모 계정입니다."
          description={`이메일 ${ADMIN_DEMO_ACCOUNT.email} · 비밀번호 ${ADMIN_DEMO_ACCOUNT.password}`}
        />
        {error ? <Alert role="alert" type="error" showIcon style={{ marginBottom: 16 }} title={error} /> : null}
        <Form<Credentials> form={form} layout="vertical" requiredMark onFinish={(values) => void submit(values)}>
          <Form.Item name="email" label="이메일" rules={[{ required: true, message: '이메일을 입력해 주세요.' }]}>
            <Input type="email" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="비밀번호"
            rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}
          >
            <Input.Password autoComplete="current-password" visibilityToggle={false} />
          </Form.Item>
          <Flex gap={8} wrap>
            <Button type="primary" htmlType="submit" loading={pending}>
              로그인
            </Button>
            <Button disabled={pending} onClick={() => void submit(ADMIN_DEMO_ACCOUNT)}>
              데모 계정으로 로그인
            </Button>
          </Flex>
        </Form>
      </Card>
    </Flex>
  );
}
