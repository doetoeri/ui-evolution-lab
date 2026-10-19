# Phase 1 파일 분석과 보존

분석한 파일: `legacy/UI_Evolution_Lab_Phase1_Experiment.html` (6,056,526바이트).

SHA-256: `37a80b2a49936f40dfc81604adc1333d87ab311d7befd6b3a6fec0be2296fc6d`.

## 직접 확인한 구조

HTML에는 두 개의 script와 두 개의 style 블록이 있습니다. 첫 script는 React 탐색기의 번들(1,168,443문자)이고, 두 번째는 최적화 실험실(8,828문자)입니다. 첫 script에서 `window.__UEL_EXPERIMENT_BRIDGE` 연결문만 제거하면 이전 Phase 0 독립 HTML의 메인 script와 완전히 동일합니다. 따라서 이미 보유한 TypeScript 소스를 정확한 기반으로 재사용했습니다. 원본 HTML은 변경하지 않았습니다.

브리지는 schema getter, Zustand store getter, family baseline 함수를 노출합니다. 추가 실험실은 같은 120변수 스키마와 기본 유전자를 참조하여 Random·GA·UCB-GA를 수행합니다. 별도 캔버스 수렴 곡선, 요약 표, CSV·JSON과 최고 후보 적용이 있습니다. 실험 점수 함수는 이름 그대로 `synthetic-surrogate-v1`이며 실제 UI를 검사하지 않습니다.

| 확인 항목 | 원래 구현 | Phase 2 처리 |
| --- | --- | --- |
| A01~J12 | 120개 타입·도메인·의존성 | 동일 schema.ts·ID·도메인 유지 |
| 세 계열 | 원래 렌더러·기본 유전자 | 렌더러와 프리셋 유지 |
| Genome | version 1 / phase0-1.0.0 / family / signature / seed / variables | 동일 wire format 유지 |
| 시드·탐색기 | Mulberry32·미리보기·잠금·Undo | 기존 store/engine 유지 |
| Signature | 흰색 긴 캡슐 핸들·파란 트랙 | 원래 Radix 의미·동작 보존 |
| 갤러리·쇼핑몰 | 29개 컴포넌트·6개 가상 상품 | 보존, 색상 필터·숫자 가격 입력 추가 |
| Random·GA·UCB | 합성 점수만 사용 | 같은 합성 함수 + Proxy + 실제 Browser evaluator |
| UCB | 4개 연산자, 미선택 arm 우선 | 6개 명시적 그룹, 비활성 arm 제외 |
| 통계 | 모집단형 SD (분모 n) | 표본 SD (n−1), 반복 수·Student t CI |
| 내보내기 | 합성 실험 CSV/JSON | 원자료·요약·출처·환경·스크린샷 연결 |

## 발견해 명시적으로 변경한 부분

- Phase 1은 A01을 제외하고 `.slice(0,120)`하므로 120 선택 시 실제 변이 변수는 119개였습니다. Phase 2는 120개를 기록하고 계열별 실험에서 A01 고정을 표시합니다. 가져온 과거 점수는 원래 119변수 함수 결과로 보존하며 raw의 실제 함수 변수 목록을 유지합니다.
- Phase 1은 알고리즘마다 PRNG seed에 다른 상수를 더했습니다. Phase 2는 공정한 비교를 위해 같은 반복 seed와 초기 후보를 공유합니다. 알고리즘 자체가 소비하는 난수와 이후 후보는 달라집니다. 원래 형식 가져오기에서는 원래 알고리즘별 seed를 복원합니다.
- Phase 1 GA는 tournament·uniform crossover·변이·좋은 μ개 보존의 steady-state 구조였습니다. Phase 2도 실행 가능한 `(μ+1)` 엘리트 보존을 사용하며 방법을 명시합니다. 목적함수·연산자·제약이 달라졌으므로 과거 실험은 그대로 재개하지 않습니다.
- 검색·카테고리·가격·장바구니 기능을 제거하지 않았습니다. A11의 역순 설정은 이제 추천순 콘텐츠에만 적용하여 명시적 가격 정렬을 뒤집지 않습니다.
- 실제 검사에서 확인한 모달 초점 복귀, 상품 제목·이동 경로 버튼의 클릭 영역을 수정했습니다.

## 마이그레이션

완전한 기존 유전자 JSON은 그대로 읽습니다. schemaVersion만 없는 version 1은 현재 버전을 명시하고 검증합니다. 변수 누락·임의 도메인·family/A01 불일치·미지 필드를 조용히 보정하지 않습니다.

기존 실험의 `config.objective=synthetic-surrogate-v1`, `runs`, `records` 형식을 가져올 수 있습니다. 원래 점수와 변수 객체를 보존하고, 기록되지 않았던 실행환경·실측 시간을 만들어 내지 않습니다. 가져온 시각은 timestamp이고, 실제 원래 측정시각과 개별 평가시간은 null로 남겨 미기록임을 경고합니다. 대규모 과거 파일은 현재 메모리·행 제한에 맞게 나누어야 합니다. 원본 HTML은 ZIP에서 직접 열어 과거 기능을 확인할 수도 있습니다.

합성 함수의 호환성은 원본 HTML에서 추출한 함수와 새 TypeScript 함수를 동일 유전자·변수 목록으로 비교하는 자동 검사로 확인합니다.
