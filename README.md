# UI Evolution Lab · Phase 2

120개 UI 변수와 세 디자인 계열을 보존하고, 실제 UI 검사와 대리지표를 구분하여 Random Search·GA·UCB-GA를 비교하는 연구 플랫폼입니다. 기본 기능에 유료 API·API 키·클라우드 계정이 필요하지 않습니다.

## 가장 간단한 실행

ZIP의 `Open_UI_Evolution_Lab_Phase2.html`을 Chrome·Edge·Samsung Internet 같은 최신 브라우저에서 여세요. 설치 없이 탐색기, Proxy/Synthetic 실험, 7개 결과 그래프, 익명 사용자 평가, JSON/CSV 내보내기가 작동합니다. HTML 미리보기 앱 대신 실제 브라우저에서 여세요.

Playwright는 Node.js에서 브라우저를 실행해야 하므로 단일 HTML에서 자체 실행되지 않습니다. **Level 2 실측**은 아래 무료 로컬 실행기를 사용합니다. 태블릿의 `127.0.0.1`은 컴퓨터를 가리키지 않습니다. 태블릿에서는 Proxy·사용자 평가를 실행하거나 컴퓨터에서 내보낸 Level 2 JSON을 가져오세요.

## 개발 실행

Node.js 22.12 이상에서:

```bash
npm install
npm run dev
```

표시된 주소(기본 `http://localhost:4173`)를 여세요. 위 명령만으로 Level 1을 포함한 기본 기능이 작동합니다.

## 실제 브라우저 평가

```bash
npm install
npx playwright install chromium
npm run research
```

`http://127.0.0.1:4318`을 여세요. **연구실 → 연결 확인 → Level 2 → 새 실험 시작**을 선택합니다. 첫 검사는 예산 1회·1반복·화면 하나를 권장합니다. `npm run research`는 프로덕션 빌드와 로컬 실행기를 함께 제공합니다. 이미 빌드했다면 `npm run research:serve`를 사용하세요.

실행기는 loopback에만 바인딩하고 지정 Origin과 연결 토큰을 검사합니다. 후보가 임의 URL을 방문하지 못하게 앱 자체 URL만 평가합니다. 브라우저가 로컬 네트워크 확인을 요구하면 위 로컬 주소에서 앱을 여는 것이 가장 간단합니다.

## 연구실 사용

1. 계열 하나/세 계열, 16/32/64/120변수, 알고리즘, 수준, 예산, 반복, 시드, 개체군, 변이율, UCB c, 가중치, 접근성 제약, 화면 크기를 선택합니다. 기본값은 16변수·알고리즘당 100회·3반복·데스크톱·Level 1입니다.
2. 모니터에서 요청 수·고유 후보·캐시·실제 실행 요청과 재시도·실패·제약 탈락·시간·최고점을 확인합니다. 중지는 현재 평가 후, 취소는 진행 중 실행을 중단합니다. 완료된 결과는 보존합니다.
3. 결과의 7개 그래프와 데이터 표, 평균·표본 SD·탐색적 Student t CI를 확인합니다. 통계적 우월성이나 미적 만족도를 자동 선언하지 않습니다.
4. 원자료에서 유전자·원시 검사·계산식·제약·과제·환경·측정시각을 검토합니다. 적격 최고 후보를 탐색기에 적용할 수 있습니다.
5. 실험은 IndexedDB에 저장합니다. 보관함에서 불러오고, 중단한 실험을 같은 엔진·설정·평가 환경에서 재개합니다. 기존 평가 응답을 재생해 알고리즘 상태를 복원합니다. 브라우저 데이터를 지우기 전에 JSON을 보관하세요.
6. 사용자 평가는 실제 참가자가 후보 선정·동의·과제 타이머·성공 여부·1–7 만족도·자유 의견을 입력합니다. 이름·연락처를 수집하지 않습니다. 미성년자 연구는 학교 지침과 필요한 동의 절차를 먼저 확인하세요. AI 평가 API는 연결하지 않았습니다.

**Level 1의 기능 F는 null입니다.** Q는 관측된 Proxy L/A/C 가중치를 재정규화합니다. Level 2 Q는 실제 기능·레이아웃·접근성 검사 결과의 규칙 기반 정규화와 C Proxy를 결합합니다. 실제 사람의 사용 편의성·미적 만족도 점수가 아닙니다. 평가 수준이 다른 점수를 같은 척도로 비교하지 마세요.

## 보존한 탐색기

- 10그룹 × 12변수의 검색·설명·선택·잠금·기본값·전체/그룹/선택 무작위 생성·시드·Undo/Redo.
- Apple-inspired·Material-inspired·Experimental, 기기 프레임과 확대, Signature ON/OFF.
- 캡슐 토글·슬라이더·겹친 범위 핸들·독립 체크박스·단일 라디오. 의미·키보드·포커스 유지.
- 29개 실제 갤러리 컴포넌트와 적용 가능한 상태. Hover/Focus/Active 고정 시연과 비적용 상태 안내.
- 쇼핑몰 검색·카테고리·가격·색상 필터·정렬·상세·장바구니·수량·삭제·재고 오류.
- 2–4후보 비교. 검색·필터·장바구니·컨트롤·모션을 동기화합니다.
- BigInt 이론적 조합 수, 조건부 변수와 유효 조합 수의 구별. 실제로 구별되는 유효 UI 수는 미계산입니다.
- 기존 localStorage 유전자·후보 50개·Undo 80단계. 전체 JSON 로드는 편집 잠금과 별개입니다.

`family`와 A01, 120개 ID와 유전자 version 1을 유지했습니다. schemaVersion 없는 완전한 v1에는 메타데이터 마이그레이션을 제공합니다. Phase 1 실험 JSON은 Synthetic 과거 기록으로 가져오며, 알고리즘 버전이 달라 Phase 2 엔진으로 재개하지 않습니다. 원본 HTML도 `legacy/`에 보존합니다.

## 제한과 비용

- Level 1: 알고리즘당 예산 최대 2,000, 전체 최대 20,000요청. 기본 전체 제한은 10,000입니다.
- Level 2: 알고리즘당 최대 30, 전체 최대 270요청. Chromium context는 실행기 전체 최대 2개입니다.
- 전체 정규화 유전자 키로 중복을 식별하고 SHA-256을 기록합니다. 캐시 키에 목적함수·변수·가중치·화면·제약·환경을 포함합니다.
- 자동화 수행시간은 점수에 넣지 않습니다. 기술적 오류만 최대 1회 재시도합니다. 기능 실패는 필수 제약에서 탈락합니다.
- 스크린샷은 `research-data/evidence`에 저장하고 후보 기록에 경로를 연결합니다. JSON에는 이미지 바이트가 없으므로 다른 컴퓨터로 옮길 때 해당 폴더도 보관하세요. 제공한 예제의 증거는 docs/phase2/evidence에서 읽을 수 있으며 로컬 실행기가 이 읽기 전용 경로도 지원합니다. 파일 삭제는 사용자가 관리합니다.
- 레이아웃 검사는 명시적 형제 그룹의 겹침·현재 DOM의 경계·잘림 등을 다룹니다. 의도된 장식·말줄임을 제외합니다. 모든 상태에서 오류가 없음을 증명하지 않습니다.
- axe 통과는 WCAG 전체 준수 인증이 아닙니다. 실제 스크린리더·확대·실기기·과제 이해·미적 만족도는 별도 수동 검토가 필요합니다.

## 테스트와 빌드

```bash
npm test
npm run build
npm run schema
npm run test:e2e
npm run test:research
npm run build:standalone
node scripts/verify-phase2-standalone.mjs UI_Evolution_Lab.html
```

Playwright CDN을 사용할 수 없는 Linux CI에서는 `node scripts/prepare-browser.mjs`로 선택적 `@sparticuz/chromium`을 추출할 수 있습니다. 바이너리는 소스·앱 번들에 포함하지 않습니다. `test:e2e`는 빌드 복사본을 제공하므로 다른 빌드와 충돌하지 않습니다. `test:research`는 9개 기준선 화면·알려진 오류·의도된 중첩·동일 후보 재측정·HTTP 연결 및 저장까지 실제 실행합니다.

`npm run build:standalone`은 `UI_Evolution_Lab.html`을 생성합니다. `dist`는 정적 호스팅에 배포할 수 있습니다. 정적 호스팅에서도 Level 2는 별도 로컬 실행기가 필요합니다. Vercel을 직접 사용할 경우 Vite / `npm run build` / `dist` 설정을 사용하세요.

## 문서와 예제

- `docs/PHASE1-ANALYSIS.md`: 원본 분석·보존·마이그레이션
- `docs/EVALUATION-SPEC.md`: 평가식·게이트·원자료·측정 범위
- `docs/REPRODUCIBILITY.md`: 시드·캐시·재개·UCB·환경
- `docs/ARCHITECTURE.md`: 탐색기와 연구 엔진 경계
- `docs/TEST-REPORT.md`: 실제 실행 결과와 제한
- `docs/variable-schema.json`, `docs/genome.schema.json`, `docs/variable-bindings.md`: 120개 스키마와 실제 렌더링 연결
- `docs/COMPONENT-STATES.md`: 컴포넌트 상태 적용 범위
- `examples/measured-baselines.json`: 실제 실행한 소규모 Level 2 기준선. 알고리즘 우월성 실험 아님.
- `examples/measured-optimization.json`: 실제 3알고리즘 소규모 실측 연결 검증. 1반복이므로 우월성 검정용이 아닙니다.
- `examples/proxy-experiment.json`: 실제 실행한 900회 Level 1 예제. 실측 사용성 점수 아님.

예제는 현재 실험에 자동 합산하지 않습니다. 참가자 없이 만든 Human-rated/AI-rated 예제는 제공하지 않습니다.

React·TypeScript·Vite·Tailwind·Radix·Lucide·Zustand·Vitest·Playwright·axe-core를 사용합니다. Noto Sans KR은 OFL-1.1로 로컬 제공되며 라이선스는 `docs/OFL-NotoSansKR.txt`에 있습니다. Apple·Google 공식 제품이나 WCAG 인증 도구가 아닙니다.
