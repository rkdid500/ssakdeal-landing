# 싹딜 랜딩페이지 (시안)

인터넷, 휴대폰 상담 신청용 모바일 우선 랜딩페이지입니다. React + Vite로 만든 정적 페이지이며 GitHub Pages로 공개됩니다.

- 공개 주소: https://rkdid500.github.io/ssakdeal-landing/
- `main` 브랜치에 올리면 GitHub Actions가 자동으로 빌드해서 위 주소에 반영합니다 (1~2분).

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `src/components/site/landing.tsx` | 페이지 섹션 전체 (문구, 숫자 수정은 여기서) |
| `src/components/site/lead-form.tsx` | 본문 상담 신청 폼 |
| `src/components/site/quick-bar.tsx` | 하단 고정 신청 바 |
| `src/lib/site-config.ts` | 브랜드명, 대표번호, 상담 시간 |
| `src/styles.css` | 디자인 (색상 토큰은 `:root`) |
| `public/assets/` | 3D 그래픽, 싹딜 로고와 캐릭터, 공유 이미지(og.jpg) |
| `index.html` | 페이지 제목, 링크 미리보기(OG) 설정 |

## 내 PC에서 확인

```bash
npm install
npm run dev
```

## 상담 폼

지금은 시안이라 신청 버튼을 누르면 "아직 접수되지 않아요, 전화 주세요" 안내만 나옵니다.
실제 접수처(싹딜 상담 서버, 구글 시트 등)는 내용 확정 후 `lead-form.tsx`, `quick-bar.tsx`의 표시된 자리에 연결하면 됩니다.

## 오픈 전에 바꿀 것

- `src/lib/site-config.ts`: 대표번호, 상담 시간
- `src/components/site/landing.tsx`: 혜택 금액, 수치, 후기(현재 시안용 예시), 사업자 정보

## 최종 믹스 버전 (`/final/`)

- 공개 주소: https://rkdid500.github.io/ssakdeal-landing/final/
- 정보 흐름은 시안 1(sakd-internet-landing), 디자인은 시안 2(이 저장소)를 따릅니다.
- 외부 라이브러리 없이 React Hook + 순수 CSS만 사용합니다.
- 복사해서 쓸 파일 2개
  - `src/final/SakdLanding.tsx`
  - `src/final/sakd-landing.css`
- 이미지는 `public/assets/` 아래 `3d/`, `brand/`, `gifts/`에 있습니다.
  - `<SakdLanding assetBase="/assets/" />`로 경로를 지정합니다.
- 운영 전 교체할 곳
  - 파일 맨 위 CONFIG 블록: 전화번호, 카카오 링크, 금액, 후기
  - `submitLead()`: 상담 신청 접수 API
