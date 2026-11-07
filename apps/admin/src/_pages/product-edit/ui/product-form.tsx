'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, Col, ColorPicker, Flex, Form, Input, InputNumber, Radio, Row, Select, Typography } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { CATEGORY_LABEL, COUNTRY_NAME, type CountryCode, type Sword, type SwordArt } from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';
import { useSaveSword, useSwords, type SwordInput } from '@/entities/sword';

const ORIGINS = Object.keys(COUNTRY_NAME) as CountryCode[];

const GUARD_LABEL: Record<SwordArt['guard']['type'], string> = {
  disc: '원판형(코등이)',
  cross: '십자형',
  quillon: '굽은 십자형',
  jian: '중국 검식',
  block: '덩어리형',
  none: '없음',
};
const WRAP_LABEL: Record<SwordArt['grip']['wrap'], string> = {
  diamond: '마름모 끈 감기',
  cord: '사선 끈 감기',
  wire: '철사 감기',
  leather: '가죽',
  ribbed: '홈 파인 뼈',
};
const POMMEL_LABEL: Record<SwordArt['pommel']['type'], string> = {
  cap: '캡',
  wheel: '바퀴형',
  lobed: '세 갈래',
  ball: '공 모양',
  ring: '고리(환두)',
  jian: '중국 검식',
  gem: '보석 박힘',
};

interface ColorInputProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
  'aria-required'?: boolean | 'true' | 'false';
}

/**
 * ColorPicker의 기본 트리거는 역할이 없는 div라서 레이블과 ARIA 속성을 받을 수 없습니다.
 * 버튼을 트리거로 써서 Form.Item이 주는 id·aria 속성이 버튼에 붙게 합니다.
 */
function ColorInput({ id, value, onChange, ...aria }: ColorInputProps) {
  return (
    <ColorPicker value={value} disabledAlpha format="hex" onChange={(color: Color) => onChange?.(color.toHexString())}>
      <Button id={id} aria-invalid={aria['aria-invalid']} aria-describedby={aria['aria-describedby']}>
        <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 2, background: value, border: '1px solid #d9d9d9' }} />
        {value?.toUpperCase()}
      </Button>
    </ColorPicker>
  );
}

function ColorField({ name, label }: { name: (string | number)[]; label: string }) {
  return (
    <Form.Item name={name} label={label} rules={[{ required: true, message: `${label}을 골라 주세요.` }]}>
      <ColorInput />
    </Form.Item>
  );
}

export function ProductForm({ initial }: { initial?: Sword }) {
  const router = useRouter();
  const [form] = Form.useForm<SwordInput>();
  const swords = useSwords();
  const save = useSaveSword((sword) => router.push(`/products/${sword.id}`));
  // preserve: 화면에 칸이 없는 값(칼끝 모양, 코등이 너비 등)까지 포함해 미리보기에 씁니다.
  const watched = Form.useWatch([], { form, preserve: true }) as SwordInput | undefined;

  const template = initial ?? swords.data?.[0];
  const initialValues: Partial<SwordInput> | undefined = initial ?? (template
    ? {
        category: 'east',
        origin: 'KR',
        price: 1_000_000,
        stock: 1,
        stories: [],
        specs: { bladeLength: template.art.blade.length, totalLength: 1000, weight: 1000, material: '', edge: 'sharp' },
        art: template.art,
      }
    : undefined);

  const previewArt: SwordArt | undefined = watched?.art?.blade
    ? { ...watched.art, blade: { ...watched.art.blade, length: watched.specs?.bladeLength || watched.art.blade.length } }
    : initialValues?.art;

  if (!initialValues) return <Card loading />;

  return (
    <Form<SwordInput>
      form={form}
      layout="vertical"
      initialValues={initialValues}
      disabled={save.isPending}
      scrollToFirstError={{ focus: true }}
      onFinish={(values) => {
        // 저장할 데이터를 mutate에 그대로 넘깁니다. 칼날 길이는 제원과 그림을 맞춥니다.
        const data: SwordInput = {
          ...initial,
          ...values,
          id: initial?.id,
          stories: initial?.stories ?? [],
          art: { ...values.art, blade: { ...values.art.blade, length: values.specs.bladeLength } },
        };
        save.mutate(data);
      }}
    >
      <Row gutter={24}>
        <Col xs={24} xl={16}>
          <Card title={<h2 style={{ margin: 0, fontSize: 16 }}>기본 정보</h2>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="name" label="이름" rules={[{ required: true, message: '이름을 입력해 주세요.' }]}>
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="nameOriginal" label="원어 이름" rules={[{ required: true, message: '원어 이름을 입력해 주세요.' }]}>
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="nameEn" label="영문 이름" rules={[{ required: true, message: '영문 이름을 입력해 주세요.' }]}>
                  <Input autoComplete="off" lang="en" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="slug"
                  label="주소(slug)"
                  extra="쇼핑몰 주소 /swords/ 뒤에 붙습니다. 영문 소문자, 숫자, 하이픈만 씁니다."
                  rules={[
                    { required: true, message: '주소를 입력해 주세요.' },
                    { pattern: /^[a-z0-9-]+$/, message: '영문 소문자, 숫자, 하이픈(-)만 쓸 수 있습니다.' },
                  ]}
                >
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item name="category" label="분류" rules={[{ required: true }]}>
                  <Select options={(['east', 'west', 'legend'] as const).map((value) => ({ value, label: CATEGORY_LABEL[value] }))} />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item name="origin" label="출고지" extra="관세 계산의 출발 국가입니다." rules={[{ required: true }]}>
                  <Select options={ORIGINS.map((value) => ({ value, label: COUNTRY_NAME[value] }))} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="era" label="시대" rules={[{ required: true, message: '시대를 입력해 주세요.' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="summary" label="한 줄 소개" rules={[{ required: true, message: '한 줄 소개를 입력해 주세요.' }]}>
                  <Input maxLength={80} showCount />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="설명" rules={[{ required: true, message: '설명을 입력해 주세요.' }]}>
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={<h2 style={{ margin: 0, fontSize: 16 }}>판매·제원</h2>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name="price" label="가격(원)" rules={[{ required: true, message: '가격을 입력해 주세요.' }]}>
                  <InputNumber min={0} step={10000} style={{ width: '100%' }} formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="stock" label="재고(점)" rules={[{ required: true, message: '재고를 입력해 주세요.' }]}>
                  <InputNumber min={0} max={999} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['specs', 'bladeLength']} label="칼날 길이(mm)" rules={[{ required: true, message: '칼날 길이를 입력해 주세요.' }]}>
                  <InputNumber min={50} max={1500} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['specs', 'totalLength']} label="전체 길이(mm)" rules={[{ required: true, message: '전체 길이를 입력해 주세요.' }]}>
                  <InputNumber min={50} max={2200} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['specs', 'weight']} label="무게(g)" rules={[{ required: true, message: '무게를 입력해 주세요.' }]}>
                  <InputNumber min={50} max={6000} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={['specs', 'material']} label="소재" rules={[{ required: true, message: '소재를 입력해 주세요.' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name={['specs', 'edge']}
                  label="날"
                  extra="칼날 15cm 이상 진검은 쇼핑몰에 '소지허가 대상'으로 표시됩니다."
                  rules={[{ required: true }]}
                >
                  <Radio.Group
                    options={[
                      { value: 'sharp', label: '진검' },
                      { value: 'blunt', label: '장식용' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={<h2 style={{ margin: 0, fontSize: 16 }}>일러스트</h2>}>
            <Form.Item label="형태 본뜨기" extra="다른 상품의 모양과 색을 그대로 가져온 뒤 고칠 수 있습니다.">
              <Select
                placeholder="상품을 고르세요"
                aria-label="형태를 가져올 상품"
                options={(swords.data ?? []).map((sword) => ({ value: sword.id, label: sword.name }))}
                onChange={(id: string) => {
                  const source = swords.data?.find((sword) => sword.id === id);
                  if (source) form.setFieldValue('art', source.art);
                }}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <Form.Item name={['art', 'blade', 'width']} label="칼날 너비(mm)" rules={[{ required: true }]}>
                  <InputNumber min={10} max={80} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['art', 'blade', 'curve']} label="휘어짐(mm)" rules={[{ required: true }]}>
                  <InputNumber min={0} max={60} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['art', 'blade', 'edge']} label="칼날 형태" rules={[{ required: true }]}>
                  <Select options={[{ value: 'single', label: '외날' }, { value: 'double', label: '양날' }]} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['art', 'grip', 'length']} label="손잡이 길이(mm)" rules={[{ required: true }]}>
                  <InputNumber min={60} max={450} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['art', 'guard', 'type']} label="코등이" rules={[{ required: true }]}>
                  <Select options={Object.entries(GUARD_LABEL).map(([value, label]) => ({ value, label }))} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['art', 'grip', 'wrap']} label="손잡이 감기" rules={[{ required: true }]}>
                  <Select options={Object.entries(WRAP_LABEL).map(([value, label]) => ({ value, label }))} />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name={['art', 'pommel', 'type']} label="끝장식" rules={[{ required: true }]}>
                  <Select options={Object.entries(POMMEL_LABEL).map(([value, label]) => ({ value, label }))} />
                </Form.Item>
              </Col>
            </Row>
            <Flex wrap gap={16}>
              <ColorField name={['art', 'grip', 'color']} label="손잡이 바탕색" />
              <ColorField name={['art', 'grip', 'wrapColor']} label="손잡이 끈 색" />
              <ColorField name={['art', 'guard', 'color']} label="코등이 색" />
              <ColorField name={['art', 'pommel', 'color']} label="끝장식 색" />
            </Flex>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title={<h2 style={{ margin: 0, fontSize: 16 }}>미리보기</h2>} style={{ position: 'sticky', top: 16, background: '#dddcd7' }}>
            {previewArt ? (
              <SwordRelief art={previewArt} pigment={0.85} label={`${watched?.name || '새 상품'} 일러스트 미리보기`} className="admin-preview" />
            ) : null}
            <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0, color: '#3a3934' }}>
              쇼핑몰 상세 화면과 같은 석고 부조로 그립니다.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      <Flex gap={8} style={{ marginTop: 16 }}>
        <Button type="primary" htmlType="submit" loading={save.isPending}>
          {initial ? '변경 저장' : '상품 등록'}
        </Button>
        <Button href="/products">목록으로</Button>
      </Flex>
    </Form>
  );
}
