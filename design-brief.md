# 딱맞춤 design brief

- Design read: 인터넷, 휴대폰, 정수기 요금이 아까운 30~50대 가구. 믿을 수 있는 계산원 같은 차분한 확신, 그러나 할인 전단의 즐거움은 유지.
- Concept spine: "가격표". 노란 가격표가 브랜드 마크이자 핵심 CTA 형태이고, 페이지는 진열대를 따라 걷듯 세 상품을 차례로 지나 상담대에 도착한다.
- Delivery tier: cinema (scroll-scrub film is the Tier-1 mechanic).
- Locked palette: night #13205C (ground), cobalt #1C2C72 (raised surface), line #33479A, paper #F4F6FF (ink), mist #B9C2E6 (muted), sunflower #FFC83D (single accent), alert #FFB4A8 (form errors only). Defense: 통신 업계의 코발트 신뢰감 위에 가격표의 해바라기 노랑 하나만 얹는다. 네온 없음, 근흑색 없음.
- Locked type: Black Han Sans (display, 굵은 한국 상업 포스터 결) + IBM Plex Sans KR 400/500/600/700 (body). word-break keep-all.
- Animation mode: animated-website
- Journey shape: single-shot (one 15s Seedance film, split into 5 consecutive 3s segments so each chapter owns a route button; consecutive cuts of one film are pixel continuous).
- Journey: (1) 시작: 코발트 진열장 원경, "요금은 낮게, 혜택은 끝까지" (2) 인터넷: 공유기 클로즈업, 최대 50만원 (3) 휴대폰: 회전하는 스마트폰, 최대 132만원 (4) 정수기: 정수기와 물방울, 최대 30만원 (5) 한 번에: 세 제품 정렬 + 금빛 림라이트, 상담 CTA.
- World grammar: seamless cobalt studio void, glossy reflective floor, one warm golden key, 35mm, slow dolly forward then rise and pull back, no text.
- Mobile framing: subjects center-safe; copy sits bottom with full scrim; 720p mobile encode.
- Delivery budget: desktop <= 32 MiB, mobile <= 16 MiB total.
- Journey enacts spine: the camera walks the shelf past each priced product and ends at the counter where all three line up.
- Section plan: journey (film) / compare (table) / process (timeline) / consult (split form) / faq (accordion) / footer. Eyebrows: 0.
- Asset plan: storyboard board, single-shot film + posters, generated SVG icon set (router, phone, purifier, headset), inline SVG tag monogram + favicon, launch cover + OG.
- CTA inventory: ConsultCta (yellow price tag that swings on hover), PhoneCta (outlined glass call chip), Submit (full width display-type bar with loading stripe), StickyBar (floating dock that tucks away when the form is visible), FAQ toggles (plus rotates to minus), Admin load button (plain outline).
