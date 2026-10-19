# 평가 함수 명세 · phase2-eval-1.0.0

이 점수는 사람의 사용성·미적 만족도의 검증된 척도가 아닙니다. `Measured`는 실제 실행·검사에서 얻은 관측을 뜻하며, 그 관측을 0~100 점수로 바꾸는 벌점과 가중치는 초기 연구 규칙입니다. 각 기록의 `score_sources`, `raw`, `formulas`를 함께 읽어야 합니다.

## 평가 수준과 출처

| 수준 | 수행 | 출처 | 남겨 두는 미측정 항목 |
| --- | --- | --- | --- |
| Level 0 | 120 도메인·seed·family/A01·중복 검사 | 유전자 검증 | UI 전체 |
| Level 1 | 토큰 대비·간격·위계·예상 배치 위험 | Proxy | 기능 F=null, 실제 DOM, axe, 사람의 편의성 |
| Level 2 | Chromium·4개 과제·DOM·axe·키보드·Reduced Motion | F/A/L=Measured, C=Proxy | 사람의 편의성·미적 만족도·완전한 WCAG 적합성 |
| Level 3 | 동의 후 실제 참가자가 과제·시간·만족도 입력 | Human-rated | 참가하지 않은 사람의 응답 |
| Synthetic 모드 | Phase 1의 고정 합성 목적함수 | Synthetic | 실제 UI 품질 전체 |

`AI-rated`는 향후 adapter의 출처 타입만 정의합니다. 현재 AI 평가 요청·결과·예제는 생성하지 않습니다. Level 1과 Level 2는 다른 점수 척도이며 한 실험에서 섞지 않습니다.

## Level 2 기본 목적함수

`Q = (wF·F + wL·L + wA·A + wC·C) / (wF+wL+wA+wC)`.

초기 가중치 F=.40, L=.30, A=.20, C=.10은 연구 가설입니다. 사용자가 음수 없이 변경할 수 있고 합계로 정규화합니다. raw 점수와 원자료를 남겨 다른 가중치의 새 실험과 비교할 수 있습니다. Q가 높아도 필수 제약 탈락은 별도로 표시하고 최적화 부모·최고 후보에서 제외합니다.

### F: 기능 정확성

화면마다 같은 상품 데이터와 4개 과제를 수행합니다. `F=100×성공 과제 수/전체 과제 수`입니다. 어느 한 화면의 필수 과제라도 실패하면 후보는 부적격입니다.

| 과제 | 고정 조건 | 실제 확인 |
| --- | --- | --- |
| 1 검색 | 아크 데스크 램프 | 결과 1개, 상세 dialog 열림 |
| 2 필터 | 100,000원 이하·그린 | 실제 목록이 해당 데이터의 전체 집합과 일치 |
| 3 장바구니 | 아크 데스크 램프 2개 | 추가·장바구니 열기·수량 2·합계 178,000원 |
| 4 정렬 | 가격 오름차순 | 모든 상품 이름 순서가 가격 데이터 정렬과 일치 |

각 과제는 초기 UI에서 시작하며 `success`, `steps`, `duration_ms`, `error`, 완료한 assertion 목록, 실패 스크린샷을 기록합니다. steps는 명시적으로 계측한 자동화 작업 단위 수이며 마우스 클릭 수나 사람의 사고 단계 수가 아닙니다. 시간이 UI 탐색 난이도를 뜻하지 않습니다. 선택자는 가능한 한 role·접근 가능한 이름을 사용합니다.

### L: 실제 레이아웃 안정성

기본 화면은 모바일 390×844, 태블릿 768×1024, 데스크톱 1440×900입니다. 한 후보의 여러 화면 결과는 `L=min(각 화면 L)`로 집계하여 깨진 작은 화면을 평균으로 숨기지 않습니다.

검사는 수평 document 넘침, 필수 제목·버튼·입력의 수평 이탈, 고정 요소의 뷰포트 이탈, overflow 경계에서 잘린 텍스트, 표시된 클릭 중심의 가림, 지정 형제 그룹의 겹침을 기록합니다. 위치는 문서 좌표(x,y,width,height), selector, 심각도, 관련 selector와 스크린샷으로 남깁니다. 일반 세로 스크롤로 아래에 있는 콘텐츠를 오류로 처리하지 않습니다.

겹침은 `.product-grid`, 헤더 액션, 필터, 수량 조절 등 명시적 동급 그룹의 직접 자식끼리만 검사합니다. 부모/자식과 모든 DOM 쌍의 교차를 오류로 세지 않습니다. `data-layout-intentional`, 의도된 ellipsis·line-clamp는 제외하고 `ignoredIntentional`을 기록합니다. 근소한 3px 이하 교차와 32px² 이하 영역은 허용 오차입니다. 이 임계값도 연구 규칙이지 보편적 사용성 기준이 아닙니다.

화면별 `L=max(0,100−Σ 심각도 벌점)`; minor=1, moderate=4, serious=12, critical=25. 모든 겹침·스크롤 컨테이너·고정 컴포넌트를 완전하게 판정하지는 못합니다. 현재 viewport에 보이는 클릭 중심만 DOM hit-test하고, 과제에 필요한 요소의 실제 클릭은 Playwright가 별도로 확인합니다.

### A: 자동 접근성 검사 결과

axe-core의 WCAG A/AA 태그 검사를 실제 렌더링 DOM에서 실행합니다. violation과 incomplete를 별도로 보존하며 incomplete를 통과로 바꾸지 않습니다. 위반 node의 target·HTML·failureSummary·위치와 screenshot을 남깁니다.

별도 실제 키보드 검사는 첫 Tab의 초점·표시, Space 스위치, 방향키 range, modal Tab 5회 트랩·Escape·트리거 복귀를 수행합니다. 실제 `prefers-reduced-motion: reduce` 환경에서 계산된 transition/animation duration을 검사합니다. `<24px` 목표 영역은 네이티브 label 영역까지 포함해 측정합니다. 44px 이상은 권장 작업 영역으로 앱 자체 컨트롤에서 유지합니다.

화면별 `A=max(0,100−Σ(axe node 수×심각도 벌점)−20×키보드 실패−2×작은 목표 수−10×Reduced Motion 실패)`. 여러 화면은 최저 A를 취합니다. serious/critical axe node, 키보드 실패, Reduced Motion 실패, 작은 목표는 접근성 제약을 켰을 때 부적격입니다. 작은 목표의 간격·인라인 링크 등 WCAG 예외는 자동 판정하지 않고 수동 검토 안내를 붙이므로, 해당 게이트는 보수적인 연구 정책입니다.

접근성 제약을 꺼도 위반 원자료는 그대로 남습니다. 기능 과제 실패와 page runtime 오류는 이 옵션으로 상쇄할 수 없습니다.

### C: 시각적 규칙 일관성 Proxy

기본 간격 배수, 행간≥1.4, 제목 비율≥1.5, 사각 버튼과 매우 큰 카드 곡률의 조합, 조밀한 정보와 큰 간격, 기본 모션 400ms 초과를 고정 규칙으로 검사합니다. 원시 값·threshold·pass·penalty를 모두 기록합니다. `C=max(0,100−규칙 벌점 합)`입니다. 이 규칙을 따르지 않는 디자인이 미적으로 나쁘다고 주장하지 않습니다.

## Level 1 목적함수

F는 실제로 실행하지 않아 null입니다. A는 토큰 대비 쌍 통과 비율, L은 예상 카드 폭·큰 글자·좁은 화면 여백·입력 높이 위험의 Proxy입니다. C는 위 규칙과 같습니다.

`Qproxy=(wL·Lrisk+wA·Atoken+wC·C)/(wL+wA+wC)`.

원래 Q의 F에 100점이나 임의 점수를 넣지 않습니다. F만 양수인 가중치는 Level 1에서 거부합니다. 토큰 대비 제약을 켰을 때 실패를 부적격으로 표시하되 이를 실제 DOM axe 위반이라고 이름 붙이지 않습니다.

## 실패·캐시·필수 제약

- 잘못된 유전자는 Level 0에서 거부합니다. 조건부 비활성 필드는 유효하지만 화면에 적용되지 않으므로 raw에 이유를 남깁니다.
- 네트워크·브라우저 시작 등 기술 실패만 최대 1회 재시도합니다. 과제 실패·레이아웃·접근성 위반은 유효한 관측이므로 재시도해 숨기지 않습니다.
- 평가 자체가 실패하면 모든 점수는 null이고 error와 constraint를 남깁니다. Proxy fallback을 Measured로 반환하지 않습니다.
- 캐시 적중도 예산 1요청을 소비합니다. 원래 measurement_id·measurement_timestamp를 유지하고 cache_hit=true, attempts=0으로 기록합니다. 원래 측정 시간과 현재 캐시 조회 시간을 혼동하지 않습니다.
- raw에 실제 browser environment와 화면별 검사 결과를 포함합니다. CSV는 null을 빈 칸, JSON은 null로 보존합니다.

## 수동 검토 목록

실제 스크린리더 발화·읽기 순서, 모든 오버레이 상태, 확대 200/400%, 실제 터치 기기, 고대비 시스템, 목표 크기 예외, 모든 텍스트 생략, 사용자의 과제 이해·시각 선호는 별도 검토해야 합니다. 자동 검사 통과를 WCAG 전체 준수나 Real Usability 인증으로 표시하지 않습니다.

참고: [Playwright 접근성 검사](https://playwright.dev/docs/accessibility-testing), [의미 기반 Locators](https://playwright.dev/docs/locators), [axe API·incomplete](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
