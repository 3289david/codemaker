export function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-neutral-500 space-y-2">
        <p className="font-semibold text-neutral-700">CodeMaker</p>
        <p>웹사이트 · 웹서비스 · 봇 · API · 자동화 프로그램 · AI 기능까지, 코드로 해결합니다.</p>
        <p>사업자 정보 (예시): 코드메이커 | 대표 홍길동 | 사업자등록번호 000-00-00000</p>
        <p>© {new Date().getFullYear()} CodeMaker. All rights reserved.</p>
      </div>
    </footer>
  );
}
