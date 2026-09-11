# 세션 종료 기록 — 2026-09-11

상태: 사용자가 최종 결과에 만족한다고 확인했고, 추가 요청이 생길 때까지 작업을 종료한다. 이 문서가 오늘의 최종 합의이며 progress.md의 중간 설계/보류 기록보다 우선한다.

## 운영 및 버전

- 운영 사이트: https://gnugpl.vercel.app
- 저장소: https://github.com/youngjaeshin/gnugpl (main)
- 승인된 기능/화면 기준 커밋: 998a2ce (그 이전 전체 정비: 8153949)
- Vercel 프로젝트: gnugpl / scope: forever5421-9079s-projects
- GitHub main에 연결되어 push 시 자동 운영 배포된다. 배포 결과는 Vercel CLI/API와 GitHub commit status로 확인한다.
- vercel.json: Node 22.x, npm ci --ignore-scripts, npm run build && npm run check, outputDirectory=dist.
- 오늘 유료 요금제 전환, 학교 DNS/도메인 변경, Git 과거 이력 재작성은 하지 않았다.

## 사용자가 확정한 화면

- 홈: 연구실명·소속과 대표 이미지. 과장된 슬로건, 별도 소개 문장, 홈의 '신영재 부교수' 표기는 제거했다.
- 대표 이미지: 가좌캠퍼스 참고 사진에 지층·탐사 장비·탄성파를 결합한 일러스트. 그림 아래 캡션은 없고 출처/CC BY-SA/AI 재구성 표시는 홈 푸터에 둔다.
- 연구: 도입 문장 없이 곧바로 세 분야를 표시한다. **탄성파 자료처리 및 영상화 / 지구과학 머신러닝 / 응용지구물리탐사**.
- 이방성·파동장 분리·RTM·FWI는 첫 분야에 포함한다. 이방성이나 CCS 논문 한 편을 별도 연구 분야로 나누지 않는다.
- 구성원: 왼쪽 사진·이름 위에 '지도교수', 오른쪽에 주요 연구(한두 줄)·학력·경력. 학력/경력은 기간과 기관·학과·학위/직위를 한 행으로 표시해 세로 길이를 줄인다.
- 교수 소개 아래 '연구원' 제목과 빈 영역을 둔다. 현재 연구원은 없다. data/researchers.json에 추가하면 동일한 member-card 템플릿으로 아래에 반복된다.
- 논문: 13편의 서지정보·DOI만 표시한다. PDF 보기/다운로드 링크와 배포 PDF는 금지한다.
- 갤러리: 실제 등록 사진이 없어 빈 상태. 가짜 학생·사진·학회 활동을 추가하지 않는다.
- 별도 연구과제 탭은 보류. 기존 Research 하단 과제 소개는 유지한다.

## 확정된 교수 이력

- 현재: 경상국립대학교 지질과학과 부교수, 2026.09–현재.
- 경상국립대학교 조교수: 2022.09–2026.08.
- 한국지질자원연구원 광물자원연구본부 연수연구원: 2019.11–2022.08.
- 서울대학교 에너지자원신기술연구소 연수연구원: 2019.09–2019.10.
- 학부: 서울대학교 에너지자원공학과, 2008.03–2014.02, 공학학사(자원공학).
- 대학원: 서울대학교 에너지시스템공학부, 2014.03–2019.08, 공학박사(물리탐사).
- 두 학력 모두 institution=서울대학교, college=공과대학. program_level로 학부/대학원을 구분한다. 이력서의 원래 기관 표기는 source_institution에 출처로만 보존한다.
- 사용자가 학부/대학원 학과명 차이를 직접 재확인했다. 석사학위나 석박사통합 과정을 추정하지 않는다.

## 다음 업데이트 시 수정할 파일

- 사이트 기본 정보: data/site.json
- 교수 학력·전체 경력·사진: data/profile.json
- 신규 연구원: data/researchers.json
- 연구 분야와 홈 요약: data/research.json
- 논문: papers/metadata.json; 최근 소식: data/news.json
- 갤러리: data/gallery.json
- 공통 구성원 카드: templates/partials/member-card.html
- 페이지 본문: templates/pages/*.html; 공통 메뉴/푸터: templates/partials/
- 디자인: css/custom.css
- 루트 HTML과 css/tailwind.css는 생성물이다. 직접 수정하지 말고 npm run build로 갱신한다.

## 원본 자료와 공개 범위

- 로컬 원본: raw/publications, raw/profile, raw/generated, raw/references, raw/design, raw/manuscripts, raw/legacy-presentation.
- 출처/무결성: raw/manifest.json (52개 원본 기록), raw/relocations.json (기존 32파일 보존 확인), data/assets.json.
- 이력서/증명사진은 GNU 원본에서 복사했다. GNU 원본은 수정하지 않았다.
- raw/, papers/*.pdf, workshop/은 Git·Vercel 업로드에서 제외한다. 로컬 원본을 지우지 않는다.
- 생년월일·자택 주소 등은 공개 데이터에 넣지 않는다. 사진은 images/shin-youngjae.jpg에 변형 없이 복사했다.
- 기존 PDF/원고 17건을 최신 Git 파일 목록에서 제외했다. 과거 Git 커밋의 PDF까지 삭제한 것은 아니다.
- 새 체크아웃에는 raw/PDF 원본이 없으므로 원본 검증과 웹 검증을 구분한다.

## 검증과 배포 절차

1. npm ci
2. npm run build
3. npm run check — 원본 없는 공개 체크아웃에서도 가능
4. npm run check:sources — 로컬 원본이 있을 때만, PDF 제목/저자/DOI/해시 대조
5. 화면/동작 변경 시 npm run check:browser — 6페이지×4너비, 5개 기능 그룹, output/review에 결과/스크린샷
6. git diff --check 및 커밋 대상 확인: PDF, 원고, 이력서, 녹음은 포함하지 않는다.
7. 승인된 변경을 main에 push하고 GitHub Vercel status / vercel inspect로 Ready 확인.

현재 검증: 논문 13편 원본 대조 PASS, 페이지 6개, 로컬 참조 175건, 공개 파일 12개(별도 manifest.json/.nojekyll), 브라우저 24개 화면 조합 및 기능 검사 PASS. 원본 없는 체크아웃 빌드도 확인했다.

Vercel CLI 로그인은 이 세션에서 완료했다. 인증이 만료되면 vercel login의 브라우저 기기 인증을 사용한다. 이전 스킬의 무인수 배포 API는 현재 CLI 로그인 안내만 반환하므로 그 경로를 반복해서 시도하지 않는다. 인증 코드/토큰을 기록하지 않는다.

## 다음 작업

작업용 로컬 미리보기 서버는 종료했다. 필요하면 npm run preview로 다시 시작한다. 운영 Vercel 사이트는 계속 서비스된다.

미완료 작업 없음. 사용자가 새 논문·연구원·사진·문구 등 업데이트를 요청하면 해당 데이터와 템플릿만 수정하고 필요한 검증 후 배포한다. 승인된 디자인을 임의로 다시 바꾸지 않는다.
