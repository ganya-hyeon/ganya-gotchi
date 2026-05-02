'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';

// 이 부분이 있어야 Next.js가 정적 페이지로 오해하지 않고 런타임에 페이지를 렌더링합니다.
export const dynamic = 'force-dynamic';

export default function StudioPage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <NextStudio config={config} />
    </div>
  );
}
