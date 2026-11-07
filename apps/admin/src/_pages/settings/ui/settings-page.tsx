'use client';

import { Alert, Button, Card, Col, Form, InputNumber, Row, Table, Typography } from 'antd';
import type { CurrencyCode } from '@snb/domain';
import { fromForm, toForm, type SettingsForm } from '../model/convert';
import { useCustomsConfig, useSaveCustomsConfig } from '../api/customs-config';
import { ScrollRegion } from '@/shared/ui';

const CURRENCIES: CurrencyCode[] = ['USD', 'JPY', 'CNY', 'GBP', 'EUR', 'AUD', 'CAD'];

export function SettingsPage() {
  const { data, isPending, isError } = useCustomsConfig();
  const save = useSaveCustomsConfig();
  const [form] = Form.useForm<SettingsForm>();

  return (
    <>
      <Typography.Title level={1} style={{ fontSize: 24 }}>
        관세·환율 설정
      </Typography.Title>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="포트폴리오용 예시 값입니다."
        description="여기서 바꾼 값은 이 브라우저의 Mock 데이터에만 저장됩니다. 쇼핑몰은 다른 주소로 배포되어 자기 Mock 데이터를 씁니다."
      />
      {isError ? <Alert type="error" showIcon title="설정을 불러오지 못했습니다." /> : null}
      {isPending || !data ? (
        <Card loading />
      ) : (
        <Form<SettingsForm>
          form={form}
          layout="vertical"
          initialValues={toForm(data)}
          disabled={save.isPending}
          scrollToFirstError={{ focus: true }}
          onFinish={(values) => save.mutate(fromForm(values, data))}
        >
          <Row gutter={16}>
            <Col xs={24} xl={12}>
              <Card title={<h2 style={{ margin: 0, fontSize: 16 }}>환율 (1단위당 원)</h2>} style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  {CURRENCIES.map((currency) => (
                    <Col key={currency} xs={12} md={8}>
                      <Form.Item
                        name={['exchangeRates', currency]}
                        label={currency}
                        rules={[{ required: true, type: 'number', min: 0.01, message: '0보다 큰 값을 입력해 주세요.' }]}
                      >
                        <InputNumber min={0.01} step={currency === 'JPY' ? 0.1 : 1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card title={<h2 style={{ margin: 0, fontSize: 16 }}>배송비 (출고지 한 곳당, 원)</h2>} style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={12}>
                    <Form.Item name={['shipping', 'domestic']} label="국내" rules={[{ required: true, message: '국내 배송비를 입력해 주세요.' }]}>
                      <InputNumber min={0} step={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item
                      name={['shipping', 'international']}
                      label="국제"
                      rules={[{ required: true, message: '국제 배송비를 입력해 주세요.' }]}
                    >
                      <InputNumber min={0} step={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Card title={<h2 style={{ margin: 0, fontSize: 16 }}>국가별 관세 규칙</h2>}>
            <Form.List name="countries">
              {(fields) => (
                <ScrollRegion label="국가별 관세 규칙 표">
                  <Table
                    rowKey="key"
                    dataSource={fields}
                    pagination={false}
                    
                    columns={[
                      {
                        title: '배송 국가',
                        key: 'name',
                        render: (_, field) => {
                          const rule = data.countries[field.name]!;
                          return `${rule.name} (${rule.valuation})`;
                        },
                      },
                      ...(
                        [
                          ['dutyRate', '관세율(%)', 0.1],
                          ['vatRate', '부가세율(%)', 0.1],
                          ['dutyFreeLimit', '관세 면세 한도', 1],
                          ['vatFreeLimit', '부가세 면세 한도', 1],
                        ] as const
                      ).map(([key, title, step]) => ({
                        title,
                        key,
                        render: (_: unknown, field: { name: number }) => {
                          const rule = data.countries[field.name]!;
                          const suffix = key.endsWith('Limit') ? ` (${rule.limitCurrency})` : '';
                          return (
                            <Form.Item
                              name={[field.name, key]}
                              rules={[{ required: true, message: '값을 입력해 주세요.' }]}
                              style={{ margin: 0 }}
                            >
                              <InputNumber
                                min={0}
                                max={key.endsWith('Rate') ? 100 : undefined}
                                step={step}
                                aria-label={`${rule.name} ${title}${suffix}`}
                                style={{ width: 130 }}
                              />
                            </Form.Item>
                          );
                        },
                      })),
                    ]}
                  />
                </ScrollRegion>
              )}
            </Form.List>
          </Card>

          <Button type="primary" htmlType="submit" loading={save.isPending} style={{ marginTop: 16 }}>
            설정 저장
          </Button>
        </Form>
      )}
    </>
  );
}
