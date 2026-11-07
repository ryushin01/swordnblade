export { GET } from '@/_app/version/route';

// Next.js는 dynamic을 다시 내보내면 읽지 못하므로 라우트 파일에 직접 적습니다.
export const dynamic = 'force-static';
