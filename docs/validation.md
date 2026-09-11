# 최종 검증 (2026-09-11)

- 상태: PASS
- PDF 원본 검증: 13편 제목·저자·DOI·SHA-256 일치
- 원본 자료: raw/manifest.json에 52개 파일 기록
- 이동 보존: 기존 추적 파일 32개의 바이트 일치 확인 (raw/relocations.json)
- 정적 사이트: 6페이지, 파일/앵커 참조 175건, 연도 필터/편수 일치
- 배포 파일: 12개 공개 파일 + manifest.json + .nojekyll, 원본/원고/녹음 제외
- 재생성: 반복 build의 HTML/CSS/배포 manifest 해시 동일
- 브라우저: 6페이지 × 1440/768/390/320px = 24개 레이아웃 검사
- 화면 PNG: output/review/에 데스크톱/모바일 12장
- Google 지도: 별도 연결된 브라우저에서 실제 캠퍼스 지도 표시 확인
- git diff --check: PASS

## 기능 검사

- Keyboard skip link, mobile menu Escape/focus, desktop resize
- All publication filters/counts/pressed states and hidden-year anchor recovery
- Gallery fixture: open, alt text, native Escape, focus restoration, cleared image source
- Six pages without JavaScript or external network: content, navigation, mobile layout
- No page JavaScript errors or local HTTP errors

## 한계와 의도적인 보류

- Google Fonts/Maps는 외부 서비스. 네트워크 차단 검사는 홈페이지 본문/내비게이션/레이아웃을 대상으로 함.
- 최초 임용 2022.09는 이력서로 확인. 부교수 승진 2026.09와 구성원 수 1명은 사용자 확인값.
- 별도 연구과제 탭 추가는 보류. GitHub main 및 Vercel 운영 배포는 완료. 요금제/학교 도메인/Git 과거 이력은 변경하지 않음.
- raw/legacy-presentation은 2026.03 자료로 바이트 보존만 확인했으며 현재 콘텐츠로 재검증하지 않음.

- 최신 디자인: 일반적인 연구실 소개 + 대표 일러스트, 하단 출처 표시. 세 연구 분야로 통일.

## 구성원 프로필 추가 검증

- 학력 2건과 경력 4건의 기관·학과/부서·기간이 메타데이터와 배포 HTML에 일치.
- 교수 사진은 원본과 동일한 바이트로 복사. 데스크톱/모바일 화면에서 비율·배치 확인.
- 긴 연구 소개를 삭제하고 주요 연구 한 문장으로 대체.
- raw/profile 이력서는 Git ignore 및 배포 파일 제외 확인. 공개 HTML에 개인 신상 필드 미포함.
- 6페이지×4너비, 5개 기능 그룹 브라우저 검사 PASS; git diff --check PASS.

## GitHub/Vercel 게시 준비

- 원본/PDF/CV/녹음을 제외한 Git 인덱스에서 새 체크아웃 구성. npm ci, build, check PASS.
- 새 체크아웃의 공개 파일 해시는 검토한 dist/와 모두 동일.
- Git 최신 파일 목록에 PDF/ZIP/DOCX 및 raw/를 포함하지 않음. 로컬 원본은 유지.
- 최종 UI: 홈 설명/직급 문구와 Research 도입 문장 제거, 구성원 이력은 한 행으로 압축. 브라우저 24개 화면 조합 PASS.

## 종료 확인

사용자가 최종 결과에 만족한다고 확인했다. 기능 기준 커밋 998a2ce의 GitHub Vercel status는 success이며 운영 주소는 https://gnugpl.vercel.app 이다. 상세 인계 기록은 SESSION_HANDOFF.md를 따른다.
