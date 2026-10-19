# 실험 데이터 사전

전체 JSON은 `Experiment {version:2, experiment_id, name, config, status, records, runs, environment, elapsed_ms, ...}`입니다. 유전자는 기존 version 1을 유지합니다. 내보낸 파일은 기본 데이터이고, 요약 통계는 별도 파일입니다.

| 평가 행 필드 | 자료형 / 의미 |
| --- | --- |
| experiment_id | 실험 UUID 또는 명시적 예제 ID |
| algorithm | random / ga / ucb |
| design_family | apple-inspired / material-inspired / experimental |
| run_id | 계열 / 알고리즘 / 반복 번호 |
| seed | 실제 해당 반복의 uint32 seed |
| candidate_id | 실험 / 반복 / 평가 순번 |
| genome_hash | 정규화 유전자 문자열의 SHA-256, seed 제외 |
| genome_json | version 1 전체 120개 타입 보존 유전자 |
| active_variables | 순서가 고정된 활성 ID 목록 |
| evaluation_level | 1 / 2; Synthetic은 Level 1 모드 안에서 별도 objective로 구분 |
| evaluation_version | phase2-eval-1.0.0 |
| objective | static-proxy-v2 / browser-v2 / synthetic-surrogate-v1 |
| viewport | 검사할 화면 객체 배열; 각 객체 id / width / height |
| function_score | 0~100 또는 null. Level 1에서는 null |
| accessibility_score | 0~100 또는 null. 출처를 반드시 score_sources로 확인 |
| layout_score | 0~100 또는 null. Level 1 위험도와 Level 2 실측을 혼동하지 않음 |
| consistency_proxy_score | 0~100 또는 null. 항상 규칙 기반 Proxy |
| total_score | 0~100 또는 null. 실패를 임의 0점으로 채우지 않음 |
| score_sources | F/A/L/C/Q별 Measured / Proxy / Human-rated / AI-rated / Synthetic / null |
| eligible | 필수 제약을 통과해 부모·최고점 후보가 될 수 있는지 |
| constraint_violations | id / message / severity / selector / rect / source / mandatory / screenshot |
| task_results | 각 과제의 성공·단계·자동화 시간·오류·assertion 목록·증거 |
| evaluation_duration_ms | 현재 요청의 실제 평가/캐시 경과시간. 과거 미기록은 null |
| cache_hit | 같은 조건의 관측을 재사용했는지 |
| timestamp | 이 평가 행을 기록한 ISO 시각 |
| measurement_id | 원래 관측을 수행한 후보 ID |
| measurement_timestamp | 원래 관측 시각. 캐시에서도 유지. 과거 미기록은 null |
| evaluation_index | 해당 알고리즘·반복 내 1부터 시작하는 예산 순번 |
| best_so_far | 해당 반복의 지금까지 적격 최고점 또는 null |
| operator | UCB 선택 arm id 또는 null |
| reward | [0,1] 정규화 보상 또는 null |
| attempts | 실제 evaluator 호출 횟수. 캐시 0, 정상 1, 재시도 포함 최대 2 |
| error | 기술적 실패 메시지 또는 null |
| formulas | 이 행의 실제 점수 계산식 |
| raw | static / browser / synthetic를 구분한 원자료 |

## Browser 원자료

`raw.browser.environment`에는 Chromium·Node·platform·userAgent·DPR·appVersion·runnerVersion을 저장합니다. `views[]`마다 viewport, layout, axe violations/incomplete/passes/version, tasks, keyboard, touchTargets, reducedMotion, screenshot, duration_ms가 있습니다. raw의 measuredAt는 실제 검사 완료 시각입니다.

layout에는 inspected, ignoredIntentional, scrollWidth, clientWidth와 실제 위반 좌표가 있습니다. axe node에는 target·HTML·failureSummary·가능한 bounding rectangle을 남깁니다. 텍스트와 JSON은 React가 이스케이프해 표시하며 임의 HTML을 실행하지 않습니다.

## 누락값과 가져오기

CSV의 빈 칸은 null을 뜻합니다. 0점·0ms와 구별하세요. 중첩 객체는 CSV 셀 안의 JSON입니다. CSV 셀은 따옴표·줄바꿈을 이스케이프하고 수식 시작 문자에는 작은따옴표를 붙입니다.

Phase 1은 원래 측정하지 않은 F/A/L/C를 null로, 개별 평가시간·원래 관측시각도 null로 둡니다. 원래 synthetic Q·변수·알고리즘 seed를 보존합니다. 외부 JSON 가져오기는 자료형·스키마·SHA·출처 구조를 검증하지만 자료 생산자의 진실성을 암호학적으로 인증하지는 않습니다.

## 요약과 Human 데이터

`summaryDocument`는 전체 config·동일 평가 수준·목적함수·버전과 계열/알고리즘별 n, 평균, 표본 SD, CI, 완료·부분·적격 없음 수를 기록합니다. 점수 조합을 바꾼 새 실험의 config와 같이 보관하세요.

Human 응답은 별도 IndexedDB store에 저장합니다. anonymous_session, consent_at, order_seed, candidate_order, viewport, candidate_id, task_id, success, duration_ms, satisfaction(1–7), comment, timestamp, source=Human-rated를 CSV로 내보냅니다. 타이머만 누르거나 세션을 시작했다고 응답을 자동 생성하지 않습니다. 실제 참가자에게 성공/만족도를 직접 선택하게 합니다.
