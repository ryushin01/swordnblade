import { fireEvent, render, screen } from '@testing-library/react';

import { Avatar } from './avatar';

describe('Avatar', () => {
  it('사진이 없으면 이름 첫 글자를 보여 준다', () => {
    render(<Avatar name="김*상" />);
    expect(screen.getByText('김')).toBeInTheDocument();
  });

  it('사진을 못 불러오면 첫 글자로 바꾼다', () => {
    const { container } = render(<Avatar name="김*상" src="/x.jpg" />);
    fireEvent.error(container.querySelector('img')!);
    expect(screen.getByText('김')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});
