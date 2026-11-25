# 딱맞춤 랜딩페이지

인터넷, 휴대폰 상담 신청용 모바일 우선 랜딩페이지입니다.
React 19 + TanStack Start로 만들고 Cloudflare Workers에 배포하며, 상담 신청은 Cloudflare D1 데이터베이스에 저장됩니다.

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `src/components/site/landing.tsx` | 페이지 섹션 전체 (문구, 숫자 수정은 여기서) |
| `src/components/site/lead-form.tsx` | 본문 상담 신청 폼 |
| `src/components/site/quick-bar.tsx` | 하단 고정 신청 바 |
| `src/lib/site-config.ts` | 브랜드명, 대표번호, 상담 시간, 사이트 주소 |
| `src/styles.css` | 디자인 (색상 토큰은 맨 위 `:root`) |
| `src/routes/admin.tsx` | 상담 신청 목록 (`/admin`) |
| `src/lib/api/leads.functions.ts` | 신청 저장, 목록 조회 서버 함수 |
| `public/assets/3d/` | 3D 그래픽 |
| `migrations/` | D1 데이터베이스 구조 |

## 처음 한 번 설정

```bash
npm install
npx wrangler login                     # 브라우저에서 Cloudflare 로그인
npx wrangler d1 create ddakmatchum-db  # 출력된 database_id를 wrangler.jsonc에 붙여넣기
npm run db:migrate                     # 원격 DB에 테이블 생성
npx wrangler secret put ADMIN_KEY      # /admin 접속용 비밀번호 입력
```

## 수정 후 배포

```bash
npm run deploy
```

## 내 PC에서 확인

```bash
npm run db:migrate:local   # 처음 한 번
npm run dev                # 빌드 후 http://localhost:8787 에서 확인
```

## 오픈 전에 바꿀 것

- `src/lib/site-config.ts`: 대표번호, 상담 시간, 실제 도메인(`url`)
- `src/components/site/landing.tsx`: 혜택 금액, 수치, 후기(현재 시안용 예시), 사업자 정보
- `src/components/site/lead-form.tsx`: 개인정보 약관 문구
