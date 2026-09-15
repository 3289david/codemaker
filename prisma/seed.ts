import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── 설정 ────────────────────────────────────────────────────
  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      companyName: "CodeMaker",
      bankName: "카카오뱅크",
      bankAccountNumber: "3333-00-1234567",
      bankAccountHolder: "코드메이커(주)",
      noticeMessage: "입금 확인은 영업일 기준 최대 2시간 이내에 처리됩니다.",
    },
  });

  // ── 관리자 계정 ─────────────────────────────────────────────
  // 비밀번호 로그인은 비활성화되었지만(관리자는 이제 Google OAuth로만 로그인) AdminUser
  // row 자체는 그대로 유지한다 — email이 이 값과 일치하는 Google 계정만 관리자 세션을 받는다.
  const adminLoginId = process.env.SEED_ADMIN_ID || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "CodeMaker!2026";
  const adminGoogleEmail = (process.env.ADMIN_GOOGLE_EMAIL || "davideom0414@gmail.com").toLowerCase();
  const existingAdmin = await prisma.adminUser.findUnique({ where: { loginId: adminLoginId } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        loginId: adminLoginId,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        email: adminGoogleEmail,
        name: "최고관리자",
        role: "SUPER",
      },
    });
  } else if (!existingAdmin.email) {
    await prisma.adminUser.update({ where: { id: existingAdmin.id }, data: { email: adminGoogleEmail } });
  }

  // ── 서비스 ──────────────────────────────────────────────────
  const SERVICES = [
    {
      slug: "website-basic",
      category: "WEBSITE",
      name: "웹사이트 제작",
      icon: "🌐",
      summary: "회사/브랜드 소개 웹사이트부터 반응형 랜딩페이지까지",
      description: "기획-디자인-퍼블리싱-배포까지 한 번에 진행하는 웹사이트 제작 서비스입니다. Next.js 기반으로 빠르고 SEO에 유리한 사이트를 만들어 드립니다.",
      capabilities: ["반응형 디자인", "SEO 최적화", "관리자 페이지 연동", "도메인/호스팅 설정"],
      priceMin: 800000, priceMax: 4000000, durationMin: 5, durationMax: 21,
    },
    {
      slug: "webapp-service",
      category: "WEBAPP",
      name: "웹서비스 제작",
      icon: "🧩",
      summary: "회원, 결제, 게시판 등 복잡한 로직을 포함한 웹서비스 개발",
      description: "SaaS, 커뮤니티, 예약 시스템 등 로그인/DB/결제가 포함된 본격적인 웹서비스를 처음부터 끝까지 개발합니다.",
      capabilities: ["회원 시스템", "DB 설계", "결제 연동", "실시간 기능", "관리자 대시보드"],
      priceMin: 2000000, priceMax: 15000000, durationMin: 14, durationMax: 60,
    },
    {
      slug: "discord-bot",
      category: "DISCORD_BOT",
      name: "Discord Bot 제작",
      icon: "🤖",
      summary: "서버 관리, 게임, 알림, 티켓 등 다양한 디스코드 봇 개발",
      description: "슬래시 커맨드 기반의 안정적인 디스코드 봇을 제작합니다. 24시간 호스팅 및 배포까지 지원 가능합니다.",
      capabilities: ["슬래시 커맨드", "티켓 시스템", "레벨/포인트 시스템", "관리자 명령어", "웹훅 연동"],
      priceMin: 300000, priceMax: 3000000, durationMin: 3, durationMax: 21,
    },
    {
      slug: "chrome-extension",
      category: "CHROME_EXT",
      name: "Chrome Extension 제작",
      icon: "🧩",
      summary: "생산성, 자동화, 마케팅용 크롬 확장 프로그램 개발",
      description: "매니페스트 V3 기반의 크롬 확장 프로그램을 제작하고 스토어 등록까지 지원합니다.",
      capabilities: ["콘텐츠 스크립트", "백그라운드 워커", "옵션 페이지", "스토어 등록 지원"],
      priceMin: 400000, priceMax: 2500000, durationMin: 5, durationMax: 21,
    },
    {
      slug: "api-development",
      category: "API",
      name: "API 제작",
      icon: "🔌",
      summary: "REST/GraphQL API 서버 설계 및 개발",
      description: "프론트엔드/모바일 앱과 연동 가능한 안정적인 API 서버를 설계하고 개발합니다. 문서화까지 포함합니다.",
      capabilities: ["REST API", "인증/인가", "API 문서화", "Rate Limiting"],
      priceMin: 500000, priceMax: 5000000, durationMin: 5, durationMax: 30,
    },
    {
      slug: "automation-program",
      category: "AUTOMATION",
      name: "자동화 프로그램 제작",
      icon: "⚙️",
      summary: "반복 업무를 대신하는 스크립트/데스크톱 자동화 프로그램",
      description: "엑셀 자동화, 웹 크롤링, 스케줄링 작업 등 반복적인 수작업을 자동화하는 프로그램을 개발합니다.",
      capabilities: ["웹 크롤링", "엑셀 자동화", "스케줄링", "알림 연동"],
      priceMin: 300000, priceMax: 3000000, durationMin: 3, durationMax: 21,
    },
    {
      slug: "ai-feature",
      category: "AI",
      name: "AI 기능 개발",
      icon: "🧠",
      summary: "챗봇, 요약, 추천 등 AI 기능을 서비스에 통합",
      description: "LLM API를 활용한 챗봇, 문서 요약, 추천 시스템 등 AI 기능을 기존 서비스나 신규 서비스에 통합합니다.",
      capabilities: ["LLM API 연동", "RAG 파이프라인", "프롬프트 엔지니어링", "임베딩/벡터 검색"],
      priceMin: 700000, priceMax: 8000000, durationMin: 7, durationMax: 30,
    },
    {
      slug: "db-integration",
      category: "DB",
      name: "DB 연동",
      icon: "🗄️",
      summary: "기존 서비스에 데이터베이스 설계 및 연동 작업",
      description: "신규 DB 스키마 설계부터 기존 서비스의 DB 마이그레이션, 성능 튜닝까지 지원합니다.",
      capabilities: ["스키마 설계", "마이그레이션", "쿼리 최적화", "백업 전략 수립"],
      priceMin: 300000, priceMax: 2500000, durationMin: 3, durationMax: 14,
    },
    {
      slug: "admin-page",
      category: "ADMIN_PAGE",
      name: "관리자 페이지 제작",
      icon: "🗂️",
      summary: "운영에 필요한 백오피스/관리자 대시보드 개발",
      description: "통계, 회원 관리, 콘텐츠 관리 등 서비스 운영에 필요한 관리자 페이지를 제작합니다.",
      capabilities: ["통계 대시보드", "권한 관리", "CRUD 관리 화면", "감사 로그"],
      priceMin: 500000, priceMax: 4000000, durationMin: 5, durationMax: 21,
    },
    {
      slug: "maintenance",
      category: "MAINTENANCE",
      name: "기존 코드 수정/버그 수정/기능 추가",
      icon: "🛠️",
      summary: "이미 만들어진 서비스의 유지보수, 버그 수정, 기능 추가",
      description: "타사에서 만든 코드를 포함하여 기존 코드베이스를 분석하고 버그 수정, 기능 추가, 리팩토링을 진행합니다.",
      capabilities: ["코드베이스 분석", "버그 수정", "신규 기능 추가", "성능 개선"],
      priceMin: 150000, priceMax: 3000000, durationMin: 1, durationMax: 21,
    },
    {
      slug: "ecommerce",
      category: "WEBAPP",
      name: "쇼핑몰 제작",
      icon: "🛒",
      summary: "상품/주문/결제/배송 관리까지 포함한 이커머스 사이트 구축",
      description: "상품 등록, 장바구니, 결제, 주문/배송 관리, 쿠폰/할인 등 쇼핑몰 운영에 필요한 기능을 처음부터 구축합니다.",
      capabilities: ["상품/재고 관리", "장바구니/결제", "주문·배송 관리", "쿠폰/할인 시스템"],
      priceMin: 2500000, priceMax: 18000000, durationMin: 21, durationMax: 70,
    },
    {
      slug: "landing-page",
      category: "WEBSITE",
      name: "랜딩페이지 제작",
      icon: "🚀",
      summary: "제품/서비스 출시, 광고 캠페인용 단일 페이지 제작",
      description: "전환율에 최적화된 단일 페이지 랜딩페이지를 빠르게 제작합니다. 광고 유입 트래킹, 폼 연동까지 지원합니다.",
      capabilities: ["반응형 디자인", "폼/DB 연동", "광고 트래킹 스크립트", "빠른 납기"],
      priceMin: 300000, priceMax: 1500000, durationMin: 3, durationMax: 10,
    },
    {
      slug: "telegram-bot",
      category: "DISCORD_BOT",
      name: "Telegram Bot 제작",
      icon: "✈️",
      summary: "알림, 자동응답, 주문 접수 등 텔레그램 봇 개발",
      description: "텔레그램 API 기반의 알림/자동응답/커머스 봇을 제작합니다. 웹훅 연동 및 관리자 명령어를 포함합니다.",
      capabilities: ["명령어 기반 인터페이스", "웹훅 연동", "관리자 알림", "다국어 지원"],
      priceMin: 300000, priceMax: 3000000, durationMin: 3, durationMax: 21,
    },
    {
      slug: "web-scraping",
      category: "AUTOMATION",
      name: "크롤링/스크래핑 자동화",
      icon: "🕷️",
      summary: "웹사이트 데이터 수집 및 정기 자동화 파이프라인 구축",
      description: "여러 웹사이트에서 데이터를 수집/정제하고, 스케줄링을 통해 정기적으로 자동 실행되는 크롤링 파이프라인을 구축합니다.",
      capabilities: ["동적 페이지 크롤링", "데이터 정제/저장", "스케줄링", "차단 우회/재시도 로직"],
      priceMin: 300000, priceMax: 3500000, durationMin: 3, durationMax: 21,
    },
    {
      slug: "payment-integration",
      category: "API",
      name: "결제 시스템 연동",
      icon: "💳",
      summary: "PG사/간편결제 연동으로 온라인 결제 기능 추가",
      description: "카드/간편결제 PG 연동, 정기결제, 환불/취소 처리 등 결제 관련 기능을 기존/신규 서비스에 통합합니다.",
      capabilities: ["PG사 연동", "정기결제(구독)", "환불/취소 처리", "결제 로그/정산"],
      priceMin: 500000, priceMax: 6000000, durationMin: 5, durationMax: 30,
    },
    {
      slug: "mobile-app",
      category: "WEBAPP",
      name: "모바일 앱 제작 (React Native)",
      icon: "📱",
      summary: "iOS/Android 동시 대응 크로스플랫폼 앱 개발",
      description: "React Native 기반으로 iOS/Android를 동시에 대응하는 앱을 개발합니다. 일정에 따라 대응 가능 여부를 사전에 협의합니다.",
      capabilities: ["크로스플랫폼(iOS/Android)", "푸시 알림", "앱스토어 배포 지원", "네이티브 기능 연동"],
      priceMin: 3000000, priceMax: 20000000, durationMin: 21, durationMax: 90,
    },
    {
      slug: "refactoring",
      category: "MAINTENANCE",
      name: "리팩토링",
      icon: "🧹",
      summary: "레거시 코드 구조 개선 및 기술 부채 정리",
      description: "가독성/유지보수성을 낮추는 레거시 코드를 점진적으로 리팩토링합니다. 테스트 없이도 안전하게 진행할 수 있도록 단계별로 접근합니다.",
      capabilities: ["코드 구조 개선", "중복 제거", "네이밍/구조 정리", "점진적 마이그레이션"],
      priceMin: 300000, priceMax: 4000000, durationMin: 3, durationMax: 30,
    },
    {
      slug: "performance-optimization",
      category: "MAINTENANCE",
      name: "성능 최적화",
      icon: "⚡",
      summary: "로딩 속도, 쿼리 성능, 서버 자원 사용 최적화",
      description: "프론트엔드 번들/렌더링 최적화, DB 쿼리 튜닝, 서버 자원 사용량 개선 등 성능 이슈를 진단하고 해결합니다.",
      capabilities: ["프론트엔드 성능 진단", "쿼리 튜닝", "캐싱 전략", "서버 리소스 최적화"],
      priceMin: 300000, priceMax: 3500000, durationMin: 3, durationMax: 21,
    },
    {
      slug: "deploy-server-setup",
      category: "ADMIN_PAGE",
      name: "배포/서버 세팅",
      icon: "🖥️",
      summary: "VPS/클라우드 서버 구축, CI/CD, 배포 자동화",
      description: "서버 초기 세팅, Nginx/SSL, CI/CD 파이프라인 구성 등 안정적인 배포 환경을 구축합니다.",
      capabilities: ["서버 초기 세팅", "Nginx/SSL", "CI/CD 구성", "모니터링/로그 설정"],
      priceMin: 200000, priceMax: 2000000, durationMin: 1, durationMax: 10,
    },
    {
      slug: "domain-hosting-setup",
      category: "MAINTENANCE",
      name: "도메인/호스팅 연결",
      icon: "🌐",
      summary: "도메인 구매 안내부터 DNS/호스팅 연결까지 지원",
      description: "도메인 연결, DNS 설정, 호스팅사 이전, SSL 인증서 발급 등 사이트 오픈에 필요한 인프라 설정을 지원합니다.",
      capabilities: ["DNS 설정", "SSL 인증서 발급", "호스팅 이전", "이메일(MX) 설정"],
      priceMin: 100000, priceMax: 800000, durationMin: 1, durationMax: 5,
    },
    {
      slug: "maintenance-contract",
      category: "MAINTENANCE",
      name: "유지보수 정기계약",
      icon: "🔧",
      summary: "월 단위 정기 유지보수/기능 개선 계약",
      description: "월 단위로 버그 대응, 소규모 기능 추가, 서버 모니터링을 포함한 정기 유지보수 계약을 제공합니다.",
      capabilities: ["월 단위 버그 대응", "소규모 기능 개선", "서버/장애 모니터링", "우선 대응 SLA"],
      priceMin: 200000, priceMax: 2000000, durationMin: 30, durationMax: 30,
    },
    {
      slug: "security-audit",
      category: "ADMIN_PAGE",
      name: "보안 점검",
      icon: "🛡️",
      summary: "웹 서비스 취약점 점검 및 보안 강화",
      description: "인증/인가, 입력값 검증, 주요 취약점(OWASP Top 10 등)을 점검하고 개선 방안을 적용합니다.",
      capabilities: ["취약점 점검", "인증/인가 강화", "입력값 검증", "레이트 리미팅/로그"],
      priceMin: 300000, priceMax: 3000000, durationMin: 3, durationMax: 14,
    },
    {
      slug: "custom-development",
      category: "CUSTOM",
      name: "커스텀 개발",
      icon: "✨",
      summary: "위 카테고리에 없는 특수 요구사항 맞춤 개발",
      description: "위 서비스 분류에 딱 맞지 않는 특수한 요구사항도 상담을 통해 범위와 견적을 협의하여 진행합니다.",
      capabilities: ["요구사항 분석/컨설팅", "기술 스택 자유 선택", "맞춤 견적 산정"],
      priceMin: 200000, priceMax: 20000000, durationMin: 1, durationMax: 90,
    },
  ];

  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        category: s.category,
        name: s.name,
        icon: s.icon,
        summary: s.summary,
        description: s.description,
        capabilities: JSON.stringify(s.capabilities),
        priceMin: s.priceMin,
        priceMax: s.priceMax,
        durationMin: s.durationMin,
        durationMax: s.durationMax,
        sortOrder: i,
      },
    });
  }

  // ── 견적 계산기 기본값 (제작 종류) ───────────────────────────
  const PROJECT_TYPE_RULES = [
    { key: "WEBSITE", label: "웹사이트", basePrice: 800000, baseDays: 7 },
    { key: "WEBAPP", label: "웹서비스", basePrice: 2000000, baseDays: 14 },
    { key: "PROGRAM", label: "프로그램/자동화", basePrice: 500000, baseDays: 5 },
    { key: "BOT", label: "봇(디스코드 등)", basePrice: 400000, baseDays: 4 },
    { key: "API", label: "API", basePrice: 600000, baseDays: 5 },
    { key: "ETC", label: "기타", basePrice: 500000, baseDays: 5 },
  ];
  for (let i = 0; i < PROJECT_TYPE_RULES.length; i++) {
    const r = PROJECT_TYPE_RULES[i];
    await prisma.projectTypeRule.upsert({
      where: { key: r.key },
      update: {},
      create: { ...r, sortOrder: i },
    });
  }

  // ── 견적 계산기 기능별 가중치 ────────────────────────────────
  const FEATURE_RULES = [
    { key: "LOGIN", label: "로그인", price: 150000, days: 2 },
    { key: "SIGNUP", label: "회원가입", price: 100000, days: 1 },
    { key: "DB", label: "DB 연동", price: 200000, days: 2 },
    { key: "ADMIN", label: "관리자 페이지", price: 400000, days: 4 },
    { key: "PAYMENT", label: "결제", price: 500000, days: 4 },
    { key: "API", label: "외부 API 연동", price: 300000, days: 3 },
    { key: "AI", label: "AI 기능", price: 700000, days: 5 },
    { key: "UPLOAD", label: "파일 업로드", price: 150000, days: 1 },
    { key: "EMAIL", label: "이메일 발송", price: 100000, days: 1 },
    { key: "DISCORD", label: "Discord 연동", price: 250000, days: 2 },
    { key: "OAUTH", label: "소셜 로그인(OAuth)", price: 250000, days: 2 },
    { key: "SEARCH", label: "검색", price: 200000, days: 2 },
    { key: "BOARD", label: "게시판", price: 300000, days: 3 },
  ];
  for (let i = 0; i < FEATURE_RULES.length; i++) {
    const r = FEATURE_RULES[i];
    await prisma.pricingRule.upsert({
      where: { key: r.key },
      update: {},
      create: { ...r, sortOrder: i },
    });
  }

  // ── 포트폴리오 ──────────────────────────────────────────────
  const PORTFOLIOS: {
    title: string;
    category: string;
    description: string;
    techStack: string[];
    duration: string;
    priceBand: string;
    features: string[];
    liveUrl?: string;
  }[] = [
    {
      title: "중고거래 커뮤니티 플랫폼",
      category: "WEBAPP",
      description: "동네 기반 중고거래 커뮤니티. 실시간 채팅, 위치 기반 검색, 결제 연동을 포함한 풀스택 웹서비스입니다.",
      techStack: ["Next.js", "PostgreSQL", "Prisma", "Tailwind"],
      duration: "6주", priceBand: "800만원대",
      features: ["실시간 채팅", "위치 기반 검색", "결제 연동", "회원 등급"],
    },
    {
      title: "레이드 파티 매칭 디스코드 봇",
      category: "DISCORD_BOT",
      description: "게임 길드용 레이드 파티 모집/매칭 봇. 자동 역할 부여와 스케줄링 기능을 제공합니다.",
      techStack: ["discord.js", "SQLite", "Node.js"],
      duration: "2주", priceBand: "80만원대",
      features: ["파티 모집", "자동 역할 부여", "스케줄 알림"],
    },
    {
      title: "가격 비교 크롬 확장 프로그램",
      category: "CHROME_EXT",
      description: "쇼핑몰 상품 페이지에서 최저가를 자동으로 비교해주는 크롬 확장 프로그램입니다.",
      techStack: ["TypeScript", "Manifest V3", "React"],
      duration: "3주", priceBand: "150만원대",
      features: ["실시간 가격 비교", "알림", "가격 히스토리 그래프"],
    },
    {
      title: "사내 재고관리 API 서버",
      category: "API",
      description: "제조업체 내부용 재고관리 시스템 API. 바코드 스캔 연동과 실시간 재고 알림을 제공합니다.",
      techStack: ["FastAPI", "PostgreSQL", "Docker"],
      duration: "4주", priceBand: "400만원대",
      features: ["REST API", "바코드 연동", "재고 부족 알림"],
    },
    {
      title: "쇼핑몰 리뷰 자동 수집 프로그램",
      category: "AUTOMATION",
      description: "여러 쇼핑몰의 리뷰를 자동으로 수집하고 정리해주는 크롤링 자동화 프로그램입니다.",
      techStack: ["Python", "Selenium", "Pandas"],
      duration: "2주", priceBand: "100만원대",
      features: ["웹 크롤링", "엑셀 리포트 자동 생성", "스케줄링"],
    },
    {
      title: "AI 문서 요약 어시스턴트",
      category: "AI",
      description: "사내 문서를 업로드하면 자동으로 요약하고 질문에 답변하는 AI 어시스턴트를 구축했습니다.",
      techStack: ["Next.js", "LangChain", "Claude API", "pgvector"],
      duration: "5주", priceBand: "600만원대",
      features: ["문서 업로드/요약", "RAG 기반 QA", "임베딩 검색"],
    },
  ];

  for (const p of PORTFOLIOS) {
    const exists = await prisma.portfolio.findFirst({ where: { title: p.title } });
    if (!exists) {
      await prisma.portfolio.create({
        data: {
          title: p.title,
          category: p.category,
          description: p.description,
          images: JSON.stringify([]),
          techStack: JSON.stringify(p.techStack),
          duration: p.duration,
          priceBand: p.priceBand,
          features: JSON.stringify(p.features),
          liveUrl: p.liveUrl ?? null,
        },
      });
    }
  }

  // ── FAQ ─────────────────────────────────────────────────────
  const FAQS = [
    { category: "주문/견적", question: "견적은 어떻게 받을 수 있나요?", answer: "홈페이지의 견적 계산기를 이용해 예상 금액을 먼저 확인한 뒤, '정식 견적 요청' 버튼으로 주문을 접수하시면 담당자가 상세 요구사항을 검토하여 확정 견적을 보내드립니다." },
    { category: "주문/견적", question: "견적 계산기의 금액과 실제 금액이 다를 수 있나요?", answer: "네, 계산기는 참고용 예상 범위이며 실제 최종 견적은 상세 요구사항 검토 후 확정됩니다." },
    { category: "결제", question: "결제는 어떤 방식으로 하나요?", answer: "현재는 무통장입금만 지원합니다. 견적 승인 후 안내되는 계좌로 입금하시고 '입금 완료 알림' 버튼을 눌러주시면 확인 후 제작이 시작됩니다." },
    { category: "결제", question: "계약금만 먼저 결제할 수 있나요?", answer: "프로젝트 규모에 따라 계약금/잔금 분할 결제가 가능합니다. 담당자와 상담 시 요청해주세요." },
    { category: "제작 과정", question: "제작 중간에 진행 상황을 확인할 수 있나요?", answer: "네, 주문 상세 페이지에서 진행률과 상태 타임라인을 실시간으로 확인할 수 있고, 담당자와 채팅으로 직접 소통하실 수 있습니다." },
    { category: "제작 과정", question: "수정 요청은 몇 번까지 가능한가요?", answer: "기본적으로 검수 단계에서 2회의 무료 수정을 지원하며, 추가 수정이나 큰 폭의 변경은 별도 협의가 필요할 수 있습니다." },
    { category: "납품", question: "소스코드도 함께 받을 수 있나요?", answer: "네, 완료된 프로젝트는 소스코드를 포함한 산출물을 버전별로 다운로드하실 수 있습니다." },
    { category: "기타", question: "회원가입 없이도 주문할 수 있나요?", answer: "네, 비회원으로도 주문이 가능합니다. 주문 시 설정한 PIN과 주문번호로 로그인 없이 진행 상황을 조회할 수 있습니다." },
    { category: "주문/견적", question: "제작 기간은 보통 얼마나 걸리나요?", answer: "프로젝트 규모에 따라 다르지만, 랜딩페이지는 3~10일, 일반 웹사이트는 1~3주, 회원/결제가 포함된 웹서비스는 3주~2개월 정도가 일반적입니다. 정확한 기간은 정식 견적에 안내됩니다." },
    { category: "주문/견적", question: "원하는 기능을 나중에 추가할 수 있나요?", answer: "네, 제작 도중이나 완료 후에도 기능 추가 요청이 가능합니다. 다만 범위가 커지면 별도 견적/일정 협의가 필요할 수 있습니다." },
    { category: "주문/견적", question: "긴급하게 빨리 제작할 수도 있나요?", answer: "일정 조율이 가능한 경우 긴급 제작(급행)도 협의 가능하며, 작업 강도에 따라 추가 비용이 발생할 수 있습니다. 주문 시 희망 납기에 남겨주세요." },
    { category: "주문/견적", question: "사용할 기술 스택을 지정할 수 있나요?", answer: "네, 특별히 원하는 프레임워크/언어가 있다면 상세 설명에 남겨주세요. 특별한 요청이 없으면 프로젝트에 적합한 기술 스택을 저희가 제안합니다." },
    { category: "결제", question: "환불 정책은 어떻게 되나요?", answer: "제작 착수 전(계약금 입금 후 작업 시작 전) 취소 시 전액 환불됩니다. 작업이 진행된 이후에는 진행률에 따라 부분 환불되며, 자세한 기준은 견적 확정 시 안내드립니다." },
    { category: "결제", question: "계약서를 따로 작성하나요?", answer: "일정 금액 이상의 프로젝트는 요청 시 간단한 용역 계약서(또는 견적서 확인 형태)를 작성해드립니다. 필요하시면 문의 남겨주세요." },
    { category: "제작 과정", question: "진행 상황은 어떻게 확인하나요?", answer: "주문 상세 페이지에서 상태 타임라인과 진행률(%)을 실시간으로 확인할 수 있고, 담당자와 1:1 채팅으로 직접 소통할 수 있습니다." },
    { category: "제작 과정", question: "상담은 어떤 방법으로 하나요?", answer: "주문 접수 전 궁금한 점은 1:1 문의 게시판을 이용해주세요. 주문 이후에는 해당 주문의 채팅으로 담당자와 바로 소통하실 수 있습니다." },
    { category: "납품", question: "파일은 어떤 방식으로 전달되나요?", answer: "완성된 산출물은 주문 상세 페이지의 '산출물' 영역에서 버전별로 직접 다운로드할 수 있습니다. 별도의 이메일 전달은 하지 않습니다." },
    { category: "납품", question: "배포/도메인 연결까지 해주시나요?", answer: "네, 요청 시 도메인 연결, 호스팅/서버 세팅, SSL 인증서 발급까지 지원합니다. 별도 서비스 항목으로도 신청 가능합니다." },
    { category: "납품", question: "완성된 결과물의 저작권은 누구에게 있나요?", answer: "잔금 결제가 완료된 시점부터 결과물에 대한 저작권 및 소유권은 고객에게 이전됩니다. 자세한 조건은 계약서에 명시됩니다." },
    { category: "납품", question: "납품 후 유지보수도 가능한가요?", answer: "네, 건별 유지보수 요청과 월 단위 정기 유지보수 계약 모두 지원합니다. '유지보수 정기계약' 서비스를 참고해주세요." },
    { category: "기타", question: "게스트(비회원)로 주문하면 채팅도 이용할 수 있나요?", answer: "네, 비회원도 주문번호와 PIN으로 접속하면 담당자와 동일하게 채팅을 이용할 수 있습니다." },
    { category: "기타", question: "견적은 어떤 기준으로 산정되나요?", answer: "제작 종류별 기본 금액에 선택한 기능(로그인, 결제, DB 연동 등)별 추가 금액을 더해 예상 범위를 계산합니다. 실제 최종 견적은 상세 요구사항 검토 후 확정됩니다." },
    { category: "기타", question: "리뷰는 어떻게 남기나요?", answer: "완료된 주문의 상세 페이지에서 별점과 후기를 작성할 수 있습니다. 등록된 리뷰는 관리자 확인 후 공개됩니다." },
    { category: "기타", question: "회원 탈퇴는 어떻게 하나요?", answer: "마이페이지에서 탈퇴를 요청하시면 처리해드립니다. 진행 중인 주문이 있는 경우 완료 후 탈퇴를 권장합니다." },
  ];
  for (const f of FAQS) {
    const exists = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!exists) await prisma.faq.create({ data: f });
  }

  // ── 공지사항 ────────────────────────────────────────────────
  const NOTICES = [
    { category: "SERVICE", title: "CodeMaker 서비스 오픈 안내", content: "안녕하세요, CodeMaker입니다. 견적 계산부터 주문, 결제, 납품까지 한 번에 처리할 수 있는 플랫폼을 오픈했습니다. 많은 이용 부탁드립니다.", pinned: true },
    { category: "MAINTENANCE", title: "서버 정기 점검 안내 (매주 화요일 새벽 4시)", content: "서비스 안정화를 위해 매주 화요일 새벽 4시~5시 사이 짧은 점검이 진행될 수 있습니다. 이용에 참고 부탁드립니다.", pinned: false },
  ];
  for (const n of NOTICES) {
    const exists = await prisma.notice.findFirst({ where: { title: n.title } });
    if (!exists) await prisma.notice.create({ data: n });
  }

  // 필요한 업로드 디렉터리 미리 생성 (배포 환경에서 uploads/ 볼륨이 비어있어도 안전하게)
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadRoot = path.join(process.cwd(), "uploads");
  for (const dir of ["references", "attachments", "deliverables", "messages", "revisions", "reviews", "portfolio"]) {
    await fs.mkdir(path.join(uploadRoot, dir), { recursive: true });
  }

  console.log("Seed complete.");
  console.log(`Admin (Google-only login): ${adminLoginId} — email ${adminGoogleEmail}`);
  console.log("No demo orders/customer/reviews are seeded — real activity only. Use /order/new (guest or logged-in) to create a real order.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
