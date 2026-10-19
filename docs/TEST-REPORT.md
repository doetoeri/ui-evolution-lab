# Phase 2 테스트 결과 보고서

이 보고서는 원본 결과 JSON의 실패 수와 기대 검사 수를 확인한 뒤 생성했습니다. 실행하지 않은 수동 검사를 통과로 표시하지 않습니다.

| 검사 | 실제 결과 | 근거 |
| --- | --- | --- |
| Vitest 단위·컴포넌트 | 195/195 통과 | docs/vitest-phase2-results.json |
| 최신 프로덕션 UI 회귀 | 24/24 통과, 실패 0 | docs/phase2/playwright-lab.spec.ts-research.spec.ts.json |
| 최종 개별 브라우저 시나리오 범위 | 25개: 최신 UI 24 + 렌더링 효과 1 | docs/phase2/final-validation.json |
| 변수 실제 렌더링 효과 | 120/120 의미 있는 두 값의 실제 차이 확인 | docs/renderer-effect-results.json |
| 세 계열 × 세 화면 기준선 | 9개 화면의 과제 36/36 성공 | docs/phase2/browser-verification.json |
| 기준선 실제 axe·키보드·Reduced Motion·레이아웃 | 해당 범위 위반 0·별도 동작 통과 | 같은 browser-verification raw |
| 알려진 오류가 있는 UI | 수평 넘침·잘림·겹침·작은 목표·axe 오류 검출 | known-broken fixture raw |
| 의도된 장식 겹침 | peer-overlap 오탐 0, intentional 제외 기록 | intentional-overlap fixture raw |
| 동일 유전자 재측정 | 과제 성공·레이아웃·axe 건수 일치 | repeat-identical-genome raw |
| 로컬 HTTP 전체 경로 | UI 연결 → POST → Playwright → 점수 표시 → IndexedDB → reload 검증 | verify-research.ts |
| 3알고리즘 실제 측정 연결 | 12요청 / 8 실제 평가 / 4 캐시 | examples/measured-optimization.json |
| 독립 HTML 직접 실행 | file://에서 48 Proxy 기록·7차트·토글 click/Space·29갤러리·uncaught error 0 | docs/phase2/standalone-verification.json |
| 앱·연구실 axe | 검사한 6개 쇼핑/갤러리 장면과 연구실 위반 유형 0 | docs/axe-results.json / research-axe.json |

## 무엇을 검증했나

원래 120개 편집기·세 계열·JSON·시드·잠금·Undo/Redo·프리셋·비교·쇼핑몰과 실제 키보드·터치·겹친 range·비활성·포커스·modal·popover·dropdown·table을 검사했습니다. 120변수 효과 검사는 data attribute나 CSS custom property만 바뀐 것을 효과로 세지 않고 실제 스타일·기하·콘텐츠·상태 피드백을 비교합니다.

연구 엔진은 평가 예산, 재현성, 교차·변이·엘리트, 6개 UCB 그룹과 미선택 처리, 보상 범위, 캐시 식별, 실패 재시도, stop/cancel/replay, SHA-256, CSV 열·escape·null, 버전, 실제 측정 출처와 엄격한 JSON 마이그레이션을 검사했습니다. 원본 Phase 1 HTML의 함수와 새 Synthetic 함수가 같은 입력에 같은 점수를 내는 것도 확인했습니다.

연구실은 3알고리즘 실험·7개 차트·CSV/JSON·원자료 dialog·최고 후보 적용·보관함 reload·stop/resume·위조 출처 거부·Level 2 연결 요구·익명 동의·빈 응답 상태·직접 입력·CSV를 검증했습니다. Human 테스트의 입력은 자동화 테스트용으로만 생성했으며 실제 참가자 연구 데이터나 제공 예제로 저장하지 않았습니다.

## 실제 예제 결과의 해석

Level 2 소규모 알고리즘 연결 검증에서 기술적 평가 실패는 0건이었고 필수 제약 탈락 1건을 그대로 보존했습니다. 탈락 후보는 Q가 85.60이어도 최고점/부모 대상에서 제외했습니다. 이 데이터는 1반복·작은 예산이므로 알고리즘 우월성이나 검정력을 보여 주지 않습니다. 기준선에서 이미 100점에 도달해 최고점 곡선이 평평한 결과도 숨기지 않습니다.

Proxy 예제는 실제로 계산한 900행이지만 Measured로 표시하지 않습니다. 실제 Human-rated·AI-rated 예제는 없습니다. 자동화 시간은 실제 사용자의 시간으로 보고하지 않습니다.

## 발견하고 고친 오류

- 원래 A11 역순이 명시적 가격 정렬까지 뒤집던 문제를 추천순에 한정했습니다.
- 상세 modal 닫기 후 트리거 초점 복귀를 보장했습니다. 키보드 검사에서 실제 복귀를 기다려 확인합니다.
- 상품 제목·이동 경로 버튼 클릭 영역과 연구실의 흐린 텍스트 대비를 수정했습니다.
- Level 2 선택 시 반복 수를 1로 바꾸면서 시드 목록 길이를 함께 바꾸지 않던 연결 오류를 수정했습니다.
- 모바일 연구실에서 기존 내비게이션이 제목을 가리던 문제를 실제 스크린샷으로 발견하고 헤더 공간을 확보했습니다. 제목과 nav의 실제 좌표 비교 검사를 추가했습니다.
- tsx가 browser 직렬화 함수에 삽입한 이름 helper 실행 문제를 해결했습니다.
- 동시에 실행한 Playwright가 같은 artifact 폴더를 지우던 문제를 고유 run 디렉터리·별도 report 경로로 수정하고 전체 시나리오를 다시 실행했습니다. 처음 실패한 실행을 최종 통과로 바꿔 기록하지 않았습니다.
- 과거 미기록 시간은 0ms를 만들지 않고 null로 보존했습니다. 유전자 해시는 원래 변수로 다시 계산해 검증합니다.

## 한계와 수동 검사

자동 검사로 WCAG 전체 준수·미적 만족도·실제 사람의 사용 편의성을 보장하지 않습니다. 실제 스크린리더 청취, 실기기, 확대 200/400%의 모든 조합, 모든 임의 유전자·오버레이 상태, 터치 목표 간격 예외, 사용자 연구는 전수 검증하지 않았습니다. 레이아웃 검사는 명시적 형제 그룹·현재 DOM 기준이며 모든 의도·가림·잘림을 완벽하게 구분하지 않습니다. CI는 기술통계와 가정에 따른 탐색적 요약이며 유의성 검정을 수행하지 않았습니다.

원본 환경·브라우저·측정시각은 raw에 있습니다. 초기 전체 실행은 24통과/1실패였습니다. 수정 도중 추가한 모바일 제목 좌표 검사에서 기존 빌드 복사본의 메뉴 가림이 확인되었습니다. 이후 수정한 빌드에서 UI 24개를 모두 재실행해 통과했고, 원래 통과한 별도 렌더링 효과 시나리오와 합쳐 25개 범위를 확인했습니다. 초기 실패 원본 JSON은 그대로 보존합니다. 스크린샷은 docs/phase2와 docs/screenshots, 실제 후보 증거는 docs/phase2/evidence에 포함됩니다.
