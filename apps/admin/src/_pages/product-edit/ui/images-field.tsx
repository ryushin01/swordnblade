'use client';

import { useRef, useState } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { Alert, App, Button, Col, Flex, Form, Input, Row, Typography } from 'antd';

import { uploadSwordImage } from '@/entities/sword';
import { resizeImage } from '@/shared/lib';

const MAX_IMAGES = 8;

/**
 * 상품 사진 여러 장: 올리기, 대체 텍스트(필수), 순서 바꾸기, 지우기.
 * antd Upload는 트리거가 role="button"인 span이라 버튼을 넣으면 대화형 요소가 겹치므로,
 * Button과 숨긴 파일 입력으로 만듭니다.
 */
export function ImagesField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { message } = App.useApp();

  return (
    <Form.List name="images">
      {(fields, { add, remove, move }) => (
        <Flex vertical gap={12}>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            상세 화면에서 부조 그림(전체·손잡이·칼끝 확대) 뒤에 이 순서로 보입니다. 최대 {MAX_IMAGES}장, 긴 변 1600px로
            줄여 저장합니다.
          </Typography.Paragraph>
          {fields.length === 0 ? <Alert type="info" showIcon title="올린 사진이 없습니다." /> : null}
          {fields.map((field, index) => (
            <Row key={field.key} gutter={12} align="top" wrap>
              <Col flex="96px">
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => (
                    // eslint-disable-next-line @next/next/no-img-element -- Mock API가 브라우저에서 돌려주는 사진
                    <img
                      src={getFieldValue(['images', field.name, 'url'])}
                      alt=""
                      width={96}
                      height={96}
                      style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col flex="auto">
                {/* onFinish는 등록된 칸의 값만 넘기므로 사진 주소도 숨은 칸으로 등록합니다. */}
                <Form.Item name={[field.name, 'url']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  name={[field.name, 'alt']}
                  label={`사진 ${index + 1}: 대체 텍스트`}
                  extra="사진에 무엇이 보이는지 적습니다. 화면낭독기가 읽습니다."
                  rules={[{ required: true, whitespace: true, message: '대체 텍스트를 입력해 주세요.' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name={[field.name, 'altEn']} label={`사진 ${index + 1}: 영어 대체 텍스트`}>
                  <Input lang="en" />
                </Form.Item>
              </Col>
              <Col flex="none">
                <Flex vertical gap={4} style={{ paddingTop: 30 }}>
                  <Button
                    icon={<ArrowUpOutlined aria-hidden />}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <span className="sr-only">사진 {index + 1} </span>앞으로
                  </Button>
                  <Button
                    icon={<ArrowDownOutlined aria-hidden />}
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <span className="sr-only">사진 {index + 1} </span>뒤로
                  </Button>
                  <Button danger icon={<DeleteOutlined aria-hidden />} onClick={() => remove(field.name)}>
                    <span className="sr-only">사진 {index + 1} </span>지우기
                  </Button>
                </Flex>
              </Col>
            </Row>
          ))}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            aria-hidden="true"
            tabIndex={-1}
            onChange={async (event) => {
              const files = [...(event.target.files ?? [])].slice(0, MAX_IMAGES - fields.length);
              event.target.value = '';
              if (files.length === 0) return;
              setUploading(true);
              try {
                for (const file of files) {
                  const url = await uploadSwordImage(await resizeImage(file).catch(() => file));
                  add({ url, alt: '', altEn: '' });
                }
                void message.success(`사진 ${files.length}장을 올렸습니다. 대체 텍스트를 입력해 주세요.`);
              } catch {
                void message.error('사진을 올리지 못했습니다. 다시 시도해 주세요.');
              } finally {
                setUploading(false);
              }
            }}
          />
          <Button
            icon={<PictureOutlined aria-hidden />}
            loading={uploading}
            disabled={fields.length >= MAX_IMAGES}
            onClick={() => inputRef.current?.click()}
            style={{ alignSelf: 'flex-start' }}
          >
            사진 올리기
          </Button>
        </Flex>
      )}
    </Form.List>
  );
}
