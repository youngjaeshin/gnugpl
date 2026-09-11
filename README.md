# GNU Geophysics Lab 홈페이지

최종 승인 상태와 다음 세션 안내: [SESSION_HANDOFF.md](docs/SESSION_HANDOFF.md).

경상국립대학교 지구물리 연구실 홈페이지. 2026-09-11 기준 게재 논문 13편, 구성원 신영재 부교수 1명.

## 미리보기와 검증

루트의 HTML과 CSS는 생성된 정적 파일이므로 서버에서 바로 열 수 있습니다. 수정·재생성에는 Python 3.9+, Node.js 22.12+/npm이 필요합니다. 원본 논문 검증에는 Poppler의 `pdftotext`가 필요합니다.

```sh
npm ci
npm run build
npm run check
npm run check:sources  # 로컬 원본이 있는 작업공간에서만
npm run check:browser
npm run preview
```

미리보기: <http://127.0.0.1:8765>. `preview`는 배포용 `dist/`만 제공합니다. 인터넷이 끊겨도 레이아웃·메뉴·논문 필터는 동작하며, Google Fonts와 지도는 인터넷이 필요합니다. 기본 시스템 글꼴로 대체할 수 있습니다.

브라우저 검사는 설치된 Chrome/Chromium을 사용합니다. 기본 경로에서 찾지 못하면 `CHROME_PATH`로 실행 파일을 지정합니다. 6페이지 × 4개 화면 너비와 키보드·필터·JavaScript 비활성 동작을 확인하고, `output/review/`에 화면 PNG 12장과 `browser-results.json`을 남깁니다. Google 지도 자체의 길찾기 결과는 이 검사의 대상이 아닙니다.

## 어디를 수정하나요?

| 위치 | 역할 |
|---|---|
| `raw/publications/` | GNU 연구업적 폴더에서 모은 원본 게재 논문 13편. 원래 파일명 유지 |
| `raw/manuscripts/` | 기존 작업 폴더의 원고 PDF·DOCX·ZIP. 게재 논문 목록에 포함하지 않음 |
| `raw/design/` | 원본 엠블럼과 초기 설명 이미지 |
| `raw/legacy-presentation/` | 2026년 3월 발표 HTML·PDF·보조 HTML·이미지를 함께 보관한 이전 자료 |
| `raw/manifest.json` | 원본 출처, 용도, 공개 파일 대응, SHA-256 |
| `raw/relocations.json` | 이동한 기존 파일의 이전/현재 경로와 보존 확인 해시 |
| `papers/metadata.json` | 홈페이지 논문 목록을 생성하는 검증된 서지정보 |
| `papers/*.pdf` | 서지정보 검증용 로컬 PDF. 홈페이지 링크/배포에 포함하지 않음 |
| `data/site.json` | 현재 직급·승진일·임용일·이메일·홈 기본 정보 |
| `data/researchers.json` | 추가 연구원의 프로필 목록. 현재 빈 배열 |
| `data/profile.json` | 검증된 학력 2건·경력 4건·전공·프로필 사진·원본 해시 |
| `raw/profile/` | 이력서·증명사진 원본의 로컬 보관본. Git/배포 제외 |
| `data/research.json` | 세 연구 분야의 명칭·설명·주제. 홈과 Research에 공통 반영 |
| `data/news.json` | 확인된 연구실 소식. 논문은 DOI로 목록 항목과 연결 |
| `data/gallery.json` | 실제 사진 목록. 현재는 빈 배열이며 빈 상태를 표시 |
| `data/assets.json` | 홈페이지 그림의 원본 PDF·페이지·그림 번호·추출 방식 |
| `templates/pages/` | 페이지별 내용. 루트 HTML 대신 이 파일을 수정 |
| `templates/partials/` | 공통 메뉴와 푸터 |
| `css/custom.css` | 디자인·반응형·접근성 스타일 |
| `css/tailwind.css` | 버전 고정된 Tailwind로 생성한 정적 CSS |
| `js/main.js` | 모바일 메뉴·논문 필터·사진 확대·맨 위로 이동 |
| `scripts/` | HTML 생성, 배포 파일 구성, 원본/링크 검증 |
| `dist/` | 생성된 배포 폴더. PDF·원본·원고·작업 기록은 포함하지 않음 |
| `workshop/` | 기존 워크숍 녹음. 이번 정비에서 내용/위치를 변경하지 않음 |

## 논문 추가

1. 원본 PDF를 `raw/publications/`에 보관하고, 서지정보 검증용 사본을 `papers/`에 넣습니다. PDF는 배포하지 않습니다.
2. PDF 첫 페이지에서 제목, 저자 순서, 저널, 게재 연도, 권·호·쪽/논문번호, DOI를 확인합니다. 온라인 공개일은 게재 연도와 구분합니다.
3. `papers/metadata.json`에 기존 형식으로 추가합니다. `source_sha256`는 원본 파일의 SHA-256입니다. `raw/manifest.json`에 원본 경로·검증용 사본 경로·출처·같은 해시를 추가합니다.
4. 필요하면 `data/news.json`에 DOI를 사용한 소식을 추가합니다. 연도 필터·논문 편수·목록은 자동 생성됩니다. 같은 연도 내에서는 배열의 순서를 유지합니다.
5. `npm run build`와 `npm run check`를 실행한 뒤 브라우저에서 새 항목과 DOI 링크를 확인합니다.

숫자나 제목을 루트 HTML에서 직접 수정하지 않습니다. 원본 PDF가 바뀌면 대응 사본과 해시도 함께 갱신합니다. 검증하지 않은 초록·그림 설명은 자동으로 생성해 메타데이터에 넣지 않습니다.

## 프로필·사진 수정

- 학력·전체 경력·전공·사진은 `data/profile.json`에서 관리합니다. 현재 직급·승진일·임용일은 `data/site.json`과 일치해야 하며 빌드 시 확인합니다.
- 구성원 페이지의 주요 연구는 `data/research.json`에서 한 문장으로 생성합니다. 긴 연구 설명을 이 페이지에 중복 작성하지 않습니다.
- 지도교수와 연구원은 `templates/partials/member-card.html`의 같은 카드 형식으로 생성됩니다. 왼쪽 사진/이름, 오른쪽 주요 연구/학력/경력이며, 이력은 간결한 행 형식입니다.
- 현재 연구원은 없어 제목 아래 빈 영역만 표시합니다. 연구원이 합류하면 `data/researchers.json`에 정보를 추가하고 build합니다. 페이지 HTML을 복사할 필요가 없습니다.
- 갤러리 사진은 `images/`에 넣고 `data/gallery.json`에 아래처럼 등록합니다. 파일을 폴더에 복사하는 것만으로는 공개되지 않습니다.

```json
[
  {"src": "images/lab-photo.jpg", "alt": "사진의 실제 내용을 설명", "caption": "촬영 시점과 활동 설명"}
]
```

## 배포

GitHub Pages는 사용하지 않습니다. Vercel에 저장소를 연결하면 `vercel.json`에 따라 `npm run build && npm run check`를 실행하고 **`dist/`만** 서비스합니다. 수동 배포도 이 폴더를 대상으로 합니다. 계정에 프로젝트를 연결한 후 정식 배포와 도메인 설정을 관리할 수 있습니다.

`raw/`, `papers/*.pdf`, `workshop/`은 Git과 Vercel 업로드에서 제외합니다. 이번 정비에서는 기존 추적 PDF도 최신 파일 목록에서 제거합니다. 다만 이전 Git 커밋에 존재했던 PDF는 과거 이력에 남습니다. 과거 이력 삭제나 저장소 비공개 전환은 별도 작업입니다.

## 검증 범위와 남은 확인

`npm run check`는 원본이 없는 공개 체크아웃에서도 실행되며, 공개 이미지 해시·페이지 내부 링크와 앵커·편수와 연도 필터·배포 파일 범위를 검사합니다. `npm run check:sources`는 로컬 원본 PDF의 제목·저자·DOI와 원본 해시까지 대조합니다. 화면 품질과 키보드 동작은 브라우저 확인이 추가로 필요합니다.

- 최초 임용일은 지정된 이력서에서 **2022.09**로 확인해 반영했습니다. 이력서는 2022년 문서이므로 현재 직급은 사용자 확인값(2026.09 부교수)을 적용했습니다.
- 교수 사진은 GNU 개인 자료의 `신영재_증명사진.jpg`를 변형 없이 복사해 반영했습니다. 갤러리 활동 사진은 아직 등록하지 않았습니다.
- 학위논문 제목은 확인 가능한 원본이 없어 기존의 미검증 항목을 홈페이지에서 제외했습니다.
- 별도 연구과제 탭은 사용자 요청으로 보류했습니다. 기존 Research 페이지의 과제 소개는 유지했습니다.

정비 내역과 근거는 `docs/content-audit.md`, 진행 상태는 `progress.md`에 기록합니다.

## 논문 공개 방식

사용자 요청에 따라 홈페이지에는 논문의 서지정보와 DOI 링크만 제공합니다. PDF 보기 버튼을 생성하지 않으며 패키징 단계에서 PDF 경로 자체를 허용하지 않습니다. `npm run check`는 HTML의 PDF 링크와 배포 폴더의 PDF 포함을 차단합니다.

서지정보 검증용 PDF와 원본은 로컬에 보존합니다. 기존 GitHub 저장소에 이미 올라간 PDF는 웹사이트 배포 파일에서 제외하는 것과 별개이며, 최신 커밋에서 PDF 파일을 제거해도 과거 Git 이력까지 삭제되지는 않습니다.

## 연구원 추가 형식

`data/researchers.json`은 배열입니다. 각 항목의 필수 값은 `name_ko`, `role_ko`입니다. `name_en`, `role_en`, `affiliation`, `email`, `specialization`, `research_summary`를 선택적으로 넣을 수 있습니다. 사진은 `photo` 객체에 `src`(images/ 아래 실제 파일), `width`, `height`를 넣습니다. `education`과 `career` 배열은 `data/profile.json`과 같은 항목 구조를 사용합니다. 비어 있는 항목은 카드에 표시하지 않으며, 여러 명은 배열 순서대로 아래에 추가됩니다.

운영 주소: https://gnugpl.vercel.app · GitHub main에 연결되어 있습니다.

학력 메타데이터는 `institution`(서울대학교), `college`(공과대학), `program_level`(학부/대학원), `department`, `degree`, `field`로 구분합니다. 이력서의 원래 기관 표기는 `source_institution`에만 보존합니다. 화면은 학교명·학과·학위를 간결하게 표시합니다.
