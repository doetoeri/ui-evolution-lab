# 120개 변수 연결표

`src/schema.ts`에서 자동 생성했습니다. 각 옵션 도메인·기본값·의존성·타입은 `variable-schema.json`에 있습니다.

| ID | 변수 | 적용 화면 | 실제 연결 | 조건 |
|---|---|---|---|---|
| A01 | 디자인 계열 | 미리보기 전체 | family class / root structure | 항상 (화면별 적용 범위 참고) |
| A02 | 전체 화면 구성 | 쇼핑몰 | data-a02 → shop composition | 항상 (화면별 적용 범위 참고) |
| A03 | 콘텐츠 최대 너비 | 미리보기 전체 | --content-max | 항상 (화면별 적용 범위 참고) |
| A04 | 화면 좌우 여백 | 미리보기 전체 | --page-pad | 항상 (화면별 적용 범위 참고) |
| A05 | 전체 정렬 방식 | 미리보기 전체 | --page-margin | 항상 (화면별 적용 범위 참고) |
| A06 | 레이아웃 시스템 | 쇼핑몰 | data-a06 → collection display | 항상 (화면별 적용 범위 참고) |
| A07 | 정보 밀도 | 미리보기 전체 | --density | 항상 (화면별 적용 범위 참고) |
| A08 | 주요 콘텐츠 비율 | 쇼핑몰 | --hero-ratio | A02 ∈ {split} |
| A09 | 섹션 구분 방식 | 미리보기 전체 | data-a09 → section treatment | 항상 (화면별 적용 범위 참고) |
| A10 | 화면 계층 깊이 | 미리보기 전체 | data-a10 → nesting shadows | 항상 (화면별 적용 범위 참고) |
| A11 | 콘텐츠 표시 순서 | 쇼핑몰 | data-a11 / product order | 항상 (화면별 적용 범위 참고) |
| A12 | 레이아웃 대칭성 | 쇼핑몰 | data-a12 → offsets | 항상 (화면별 적용 범위 참고) |
| B01 | 내비게이션 위치 | 쇼핑몰 | data-b01 → nav placement | 항상 (화면별 적용 범위 참고) |
| B02 | 내비게이션 표현 | 쇼핑몰 | navigation markup | 항상 (화면별 적용 범위 참고) |
| B03 | 내비게이션 높이 | 쇼핑몰 | --nav-height | 항상 (화면별 적용 범위 참고) |
| B04 | 메뉴 깊이 | 쇼핑몰 | dropdown submenus | B05 ∈ {dropdown, drawer} |
| B05 | 메뉴 표시 방식 | 쇼핑몰 | menu rendering | 항상 (화면별 적용 범위 참고) |
| B06 | 현재 위치 강조 | 쇼핑몰 | data-b06 → active navigation | 항상 (화면별 적용 범위 참고) |
| B07 | 검색창 위치 | 쇼핑몰 | search slot | 항상 (화면별 적용 범위 참고) |
| B08 | 검색창 형태 | 쇼핑몰 | data-b08 → search field | 항상 (화면별 적용 범위 참고) |
| B09 | 필터 배치 | 쇼핑몰 | filter layout | 항상 (화면별 적용 범위 참고) |
| B10 | 필터 조작 | 쇼핑몰 | category input | 항상 (화면별 적용 범위 참고) |
| B11 | 정렬 기능 위치 | 쇼핑몰 | sort slot | 항상 (화면별 적용 범위 참고) |
| B12 | 이동 경로 표시 | 쇼핑몰 | breadcrumb | 항상 (화면별 적용 범위 참고) |
| C01 | 기본 색상 계열 | 미리보기 전체 | --primary hue | 항상 (화면별 적용 범위 참고) |
| C02 | 색상 생성 방식 | 미리보기 전체 | --secondary / --accent | 항상 (화면별 적용 범위 참고) |
| C03 | 기본 색상 명도 | 미리보기 전체 | --primary | 항상 (화면별 적용 범위 참고) |
| C04 | 기본 색상 채도 | 미리보기 전체 | --primary | 항상 (화면별 적용 범위 참고) |
| C05 | 배경 색상 | 미리보기 전체 | --canvas | 항상 (화면별 적용 범위 참고) |
| C06 | 표면 색상 | 미리보기 전체 | --surface | 항상 (화면별 적용 범위 참고) |
| C07 | 강조 색상 개수 | 미리보기 전체 | accent assignment | 항상 (화면별 적용 범위 참고) |
| C08 | 텍스트 색상 단계 | 미리보기 전체 | text role palette | 항상 (화면별 적용 범위 참고) |
| C09 | 경계선 색상 대비 | 미리보기 전체 | --border | 항상 (화면별 적용 범위 참고) |
| C10 | 상태 색상 체계 | 미리보기 전체 | status colors | 항상 (화면별 적용 범위 참고) |
| C11 | 다크모드 전략 | 미리보기 전체 | data-dark / matchMedia | 항상 (화면별 적용 범위 참고) |
| C12 | 색상 전환 방식 | 미리보기 전체 | --color-duration | 항상 (화면별 적용 범위 참고) |
| D01 | 글꼴 계열 | 미리보기 전체 | --font | 항상 (화면별 적용 범위 참고) |
| D02 | 기본 글자 크기 | 미리보기 전체 | --font-size | 항상 (화면별 적용 범위 참고) |
| D03 | 제목 크기 비율 | 미리보기 전체 | --heading-size | 항상 (화면별 적용 범위 참고) |
| D04 | 제목 굵기 | 미리보기 전체 | --heading-weight | 항상 (화면별 적용 범위 참고) |
| D05 | 본문 굵기 | 미리보기 전체 | --body-weight | 항상 (화면별 적용 범위 참고) |
| D06 | 행간 | 미리보기 전체 | --leading | 항상 (화면별 적용 범위 참고) |
| D07 | 자간 | 미리보기 전체 | --tracking | 항상 (화면별 적용 범위 참고) |
| D08 | 텍스트 정렬 | 미리보기 전체 | --text-align | 항상 (화면별 적용 범위 참고) |
| D09 | 제목 스타일 | 미리보기 전체 | data-d09 → heading style | 항상 (화면별 적용 범위 참고) |
| D10 | 숫자 표시 | 미리보기 전체 | data-d10 → numeric text | 항상 (화면별 적용 범위 참고) |
| D11 | 텍스트 줄바꿈 | 미리보기 전체 | text-wrap | 항상 (화면별 적용 범위 참고) |
| D12 | 텍스트 위계 단계 | 미리보기 전체 | --meta-size / --card-title-size | 항상 (화면별 적용 범위 참고) |
| E01 | 기본 간격 단위 | 미리보기 전체 | --space-unit | 항상 (화면별 적용 범위 참고) |
| E02 | 컴포넌트 내부 여백 | 미리보기 전체 | --component-pad | 항상 (화면별 적용 범위 참고) |
| E03 | 컴포넌트 간격 | 미리보기 전체 | --component-gap | 항상 (화면별 적용 범위 참고) |
| E04 | 섹션 간격 | 미리보기 전체 | --section-gap | 항상 (화면별 적용 범위 참고) |
| E05 | 버튼 높이 | 미리보기 전체 | --button-height | 항상 (화면별 적용 범위 참고) |
| E06 | 입력창 높이 | 미리보기 전체 | --input-height | 항상 (화면별 적용 범위 참고) |
| E07 | 카드 최소 높이 | 쇼핑몰 | --card-min-height | 항상 (화면별 적용 범위 참고) |
| E08 | 모서리 반경 | 미리보기 전체 | --radius | 항상 (화면별 적용 범위 참고) |
| E09 | 캡슐형 사용 비율 | 미리보기 전체 | --chip-radius / --field-radius | 항상 (화면별 적용 범위 참고) |
| E10 | 테두리 두께 | 미리보기 전체 | --border-width | 항상 (화면별 적용 범위 참고) |
| E11 | 그림자 강도 | 미리보기 전체 | --shadow-alpha | 항상 (화면별 적용 범위 참고) |
| E12 | 그림자 확산 범위 | 미리보기 전체 | --shadow-blur | E11 ∈ {0.06, 0.14, 0.24} |
| F01 | 기본 버튼 스타일 | 미리보기 전체 | data-f01 → primary button | 항상 (화면별 적용 범위 참고) |
| F02 | 버튼 형태 | 미리보기 전체 | --button-radius | 항상 (화면별 적용 범위 참고) |
| F03 | 버튼 아이콘 위치 | 미리보기 전체 | button icon order | 항상 (화면별 적용 범위 참고) |
| F04 | 버튼 텍스트 방식 | 미리보기 전체 | data-f04 → button text | 항상 (화면별 적용 범위 참고) |
| F05 | 주요 버튼 강조 | 미리보기 전체 | data-f05 → primary emphasis | 항상 (화면별 적용 범위 참고) |
| F06 | 보조 버튼 스타일 | 미리보기 전체 | data-f06 → secondary button | 항상 (화면별 적용 범위 참고) |
| F07 | 선택 입력 방식 | 쇼핑몰 | preference selection markup | 항상 (화면별 적용 범위 참고) |
| F08 | 토글 형태 | 미리보기 전체 | --toggle-width / --toggle-handle | 항상 (화면별 적용 범위 참고) |
| F09 | 슬라이더 형태 | 미리보기 전체 | --slider-thumb-width / --slider-thumb-height | 항상 (화면별 적용 범위 참고) |
| F10 | 입력창 스타일 | 미리보기 전체 | data-f10 → field | 항상 (화면별 적용 범위 참고) |
| F11 | 입력 오류 표시 | 컴포넌트 갤러리 | form error markup | 항상 (화면별 적용 범위 참고) |
| F12 | 입력 도움말 위치 | 컴포넌트 갤러리 | form helper slot | 항상 (화면별 적용 범위 참고) |
| G01 | 상품 표시 방식 | 쇼핑몰 | data-g01 → product layout | 항상 (화면별 적용 범위 참고) |
| G02 | 카드 이미지 비율 | 쇼핑몰 | --image-ratio | 항상 (화면별 적용 범위 참고) |
| G03 | 카드 이미지 위치 | 쇼핑몰 | data-g03 → image position | 항상 (화면별 적용 범위 참고) |
| G04 | 카드 정보 순서 | 쇼핑몰 | product body order | 항상 (화면별 적용 범위 참고) |
| G05 | 카드 테두리 | 쇼핑몰 | --card-border-style | 항상 (화면별 적용 범위 참고) |
| G06 | 카드 배경 | 쇼핑몰 | --card-bg | 항상 (화면별 적용 범위 참고) |
| G07 | 카드 상호작용 | 쇼핑몰 | data-g07 → card interaction | 항상 (화면별 적용 범위 참고) |
| G08 | 상품 그리드 열 수 | 쇼핑몰 | --columns | G01 ∈ {grid, feature} |
| G09 | 상품 정보 표시량 | 쇼핑몰 | product metadata visibility | 항상 (화면별 적용 범위 참고) |
| G10 | 가격 강조 수준 | 쇼핑몰 | data-g10 → price | 항상 (화면별 적용 범위 참고) |
| G11 | 상태 배지 형태 | 미리보기 전체 | data-g11 → badge | 항상 (화면별 적용 범위 참고) |
| G12 | 목록 구분 방식 | 미리보기 전체 | data-g12 → list rows | 항상 (화면별 적용 범위 참고) |
| H01 | 기본 애니메이션 시간 | 미리보기 전체 | --duration | 항상 (화면별 적용 범위 참고) |
| H02 | 모션 곡선 | 미리보기 전체 | --easing | 항상 (화면별 적용 범위 참고) |
| H03 | 화면 전환 | 미리보기 전체 | data-h03 → view-enter | 항상 (화면별 적용 범위 참고) |
| H04 | 버튼 반응 | 미리보기 전체 | data-h04 → button feedback | 항상 (화면별 적용 범위 참고) |
| H05 | Hover 효과 | 미리보기 전체 | data-h05 → surface hover | 항상 (화면별 적용 범위 참고) |
| H06 | Press 효과 | 미리보기 전체 | data-h06 → active feedback | 항상 (화면별 적용 범위 참고) |
| H07 | 메뉴 열림 방식 | 미리보기 전체 | data-h07 → menu-enter | 항상 (화면별 적용 범위 참고) |
| H08 | 모달 등장 방식 | 미리보기 전체 | data-h08 → dialog-enter | 항상 (화면별 적용 범위 참고) |
| H09 | 로딩 표현 | 컴포넌트 갤러리 | loading content | 항상 (화면별 적용 범위 참고) |
| H10 | 성공 피드백 | 미리보기 전체 | success feedback slot | 항상 (화면별 적용 범위 참고) |
| H11 | 오류 피드백 | 미리보기 전체 | error feedback slot | 항상 (화면별 적용 범위 참고) |
| H12 | 애니메이션 연속성 | 미리보기 전체 | animation-delay / iteration | 항상 (화면별 적용 범위 참고) |
| I01 | 재질 표현 | 미리보기 전체 | material surface | 항상 (화면별 적용 범위 참고) |
| I02 | 배경 투명도 | 미리보기 전체 | --surface-alpha | I01 ∈ {translucent} |
| I03 | 배경 흐림 | 미리보기 전체 | --backdrop-blur | I01 ∈ {translucent} |
| I04 | 표면 하이라이트 | 미리보기 전체 | --surface-highlight | 항상 (화면별 적용 범위 참고) |
| I05 | 입체감 | 미리보기 전체 | --depth | 항상 (화면별 적용 범위 참고) |
| I06 | 테두리 하이라이트 | 미리보기 전체 | --edge-highlight | 항상 (화면별 적용 범위 참고) |
| I07 | 배경 그라디언트 | 미리보기 전체 | --canvas-gradient | 항상 (화면별 적용 범위 참고) |
| I08 | 배경 패턴 | 미리보기 전체 | --canvas-pattern | 항상 (화면별 적용 범위 참고) |
| I09 | 레이어 수 | 쇼핑몰 | hero illustration layers | 항상 (화면별 적용 범위 참고) |
| I10 | 떠 있는 컴포넌트 | 쇼핑몰 | floating action slot | 항상 (화면별 적용 범위 참고) |
| I11 | 아이콘 스타일 | 미리보기 전체 | --icon-stroke / --icon-fill | 항상 (화면별 적용 범위 참고) |
| I12 | 아이콘 크기 | 미리보기 전체 | --icon-size | 항상 (화면별 적용 범위 참고) |
| J01 | 모바일 레이아웃 | 쇼핑몰 | data-j01 → container query | 항상 (화면별 적용 범위 참고) |
| J02 | 태블릿 레이아웃 | 쇼핑몰 | data-j02 → adaptive columns | 항상 (화면별 적용 범위 참고) |
| J03 | 데스크톱 레이아웃 | 미리보기 전체 | data-j03 → desktop container | 항상 (화면별 적용 범위 참고) |
| J04 | 반응형 전환점 | 미리보기 전체 | ResizeObserver breakpoint | 항상 (화면별 적용 범위 참고) |
| J05 | 모바일 메뉴 | 쇼핑몰 | adaptive navigation | 항상 (화면별 적용 범위 참고) |
| J06 | 모바일 필터 | 쇼핑몰 | adaptive filter | 항상 (화면별 적용 범위 참고) |
| J07 | 터치 목표 크기 | 미리보기 전체 | --touch-target | 항상 (화면별 적용 범위 참고) |
| J08 | 확대 시 레이아웃 | 미리보기 전체 | data-j08 → zoom reflow | 항상 (화면별 적용 범위 참고) |
| J09 | 화면 방향 대응 | 미리보기 전체 | ResizeObserver orientation | 항상 (화면별 적용 범위 참고) |
| J10 | 긴 텍스트 대응 | 미리보기 전체 | data-j10 → text overflow | 항상 (화면별 적용 범위 참고) |
| J11 | Reduced Motion 대응 | 미리보기 전체 | --duration / media query | 항상 (화면별 적용 범위 참고) |
| J12 | 고대비 모드 대응 | 미리보기 전체 | data-j12 / forced-colors | 항상 (화면별 적용 범위 참고) |
