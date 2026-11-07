import { Wordmark } from '@/shared/ui';

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[90rem] gap-4 px-4 py-10 text-sm text-ink-muted sm:px-8">
        <Wordmark className="opacity-90" />
        <p>
          포트폴리오용 가상 쇼핑몰입니다. 상품, 공방, 가격, 주문은 모두 지어낸 것이며 실제로 판매하거나 배송하지
          않습니다.
        </p>
        <p>
          관세·부가세는 예시 세율로 계산한 예상액입니다. 한국에서 칼날 15cm 이상인 도검을 가지려면 관할 경찰서의
          소지허가가 필요하고, 수입하려면 경찰청 수입허가가 필요합니다.
        </p>
        <p>
          {/* 어드민은 다른 앱(zone)이라 Next Link가 아닌 일반 링크로 이동합니다. */}
          <a href="/admin" className="inline-flex min-h-11 items-center text-ink underline underline-offset-4">
            관리자 화면 보기
          </a>
          <span> · 상품 가격·재고나 관세율을 바꾸면 이 쇼핑몰에 바로 반영됩니다.</span>
        </p>
        <p className="small-caps">Illustrations drawn in code · No real blades were harmed</p>
      </div>
    </footer>
  );
}
