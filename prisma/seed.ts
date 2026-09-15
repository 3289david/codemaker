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
  const adminLoginId = process.env.SEED_ADMIN_ID || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "CodeMaker!2026";
  const existingAdmin = await prisma.adminUser.findUnique({ where: { loginId: adminLoginId } });
  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        loginId: adminLoginId,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        name: "최고관리자",
        role: "SUPER",
      },
    });
  }

  // ── 고객 계정 ───────────────────────────────────────────────
  const customerEmail = process.env.SEED_CUSTOMER_EMAIL || "customer@example.com";
  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || "Customer123!";
  let customer = await prisma.user.findUnique({ where: { email: customerEmail } });
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash: await bcrypt.hash(customerPassword, 12),
        nickname: "김코드",
        phone: "010-1234-5678",
        emailVerified: true,
        isSeedData: true,
      },
    });
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
  const PORTFOLIOS = [
    {
      title: "중고거래 커뮤니티 플랫폼",
      category: "WEBAPP",
      description: "동네 기반 중고거래 커뮤니티. 실시간 채팅, 위치 기반 검색, 결제 연동을 포함한 풀스택 웹서비스입니다.",
      techStack: ["Next.js", "PostgreSQL", "Prisma", "Tailwind"],
      duration: "6주", priceBand: "800만원대",
      features: ["실시간 채팅", "위치 기반 검색", "결제 연동", "회원 등급"],
      liveUrl: "https://example.com",
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
  ];
  for (const f of FAQS) {
    const exists = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!exists) await prisma.faq.create({ data: f });
  }

  // ── 공지사항 ────────────────────────────────────────────────
  const NOTICES = [
    { category: "SERVICE", title: "CodeMaker 서비스 오픈 안내", content: "안녕하세요, CodeMaker입니다. 견적 계산부터 주문, 결제, 납품까지 한 번에 처리할 수 있는 플랫폼을 오픈했습니다. 많은 이용 부탁드립니다.", pinned: true },
    { category: "EVENT", title: "오픈 기념 견적 상담 이벤트", content: "오픈 기념으로 이번 달 접수 건에 한해 무료 견적 상담을 진행합니다. 주문 신청 시 메모란에 '오픈이벤트'라고 남겨주세요.", pinned: false },
    { category: "MAINTENANCE", title: "서버 정기 점검 안내 (매주 화요일 새벽 4시)", content: "서비스 안정화를 위해 매주 화요일 새벽 4시~5시 사이 짧은 점검이 진행될 수 있습니다. 이용에 참고 부탁드립니다.", pinned: false },
  ];
  for (const n of NOTICES) {
    const exists = await prisma.notice.findFirst({ where: { title: n.title } });
    if (!exists) await prisma.notice.create({ data: n });
  }

  // ── 샘플 주문 (핵심 플로우 데모) ─────────────────────────────
  const pinHashDefault = await bcrypt.hash("1234", 10);

  async function ensureOrder(orderNo: string, factory: () => Promise<void>) {
    const exists = await prisma.order.findUnique({ where: { orderNo } });
    if (!exists) await factory();
  }

  // 주문 1: 방금 접수된 비회원 주문 (상태: 접수)
  await ensureOrder("A-10001", async () => {
    await prisma.order.create({
      data: {
        orderNo: "A-10001",
        guestName: "박신청",
        guestEmail: "guest1@example.com",
        guestPhone: "010-2222-3333",
        pinHash: pinHashDefault,
        title: "동아리 홍보용 랜딩페이지 제작",
        projectType: "WEBSITE",
        description: "대학 동아리 홍보용 원페이지 랜딩페이지가 필요합니다. 모바일 반응형으로 부탁드립니다.",
        features: JSON.stringify(["UPLOAD"]),
        referenceUrls: JSON.stringify(["https://example.com/reference"]),
        referenceImages: JSON.stringify([]),
        attachments: JSON.stringify([]),
        desiredTimeline: "2주 이내",
        budget: "100만원 내외",
        contactEmail: "guest1@example.com",
        contactPhone: "010-2222-3333",
        estimatedPriceMin: 700000,
        estimatedPriceMax: 1100000,
        estimatedDays: 8,
        status: "접수",
        statusHistory: { create: { status: "접수", note: "고객이 주문을 접수했습니다.", byAdmin: false } },
      },
    });
  });

  // 주문 2: 견적 승인 후 결제 대기 중 (회원)
  await ensureOrder("A-10002", async () => {
    const order = await prisma.order.create({
      data: {
        orderNo: "A-10002",
        userId: customer!.id,
        pinHash: pinHashDefault,
        title: "쇼핑몰 관리자 페이지 기능 추가",
        projectType: "WEBAPP",
        description: "기존 쇼핑몰에 판매 통계 대시보드와 쿠폰 관리 기능을 추가하고 싶습니다.",
        features: JSON.stringify(["ADMIN", "DB"]),
        referenceImages: JSON.stringify([]),
        attachments: JSON.stringify([]),
        desiredTimeline: "3주",
        budget: "300만원",
        contactEmail: customerEmail,
        contactPhone: "010-1234-5678",
        estimatedPriceMin: 2400000,
        estimatedPriceMax: 3600000,
        estimatedDays: 18,
        status: "결제대기",
        statusHistory: {
          create: [
            { status: "접수", note: "고객이 주문을 접수했습니다.", byAdmin: false },
            { status: "견적확인", note: "견적이 발송되었습니다.", byAdmin: true },
            { status: "결제대기", note: "고객이 견적을 승인했습니다.", byAdmin: false },
          ],
        },
      },
    });
    await prisma.quote.create({
      data: {
        orderId: order.id,
        amount: 3000000,
        estimatedDays: 18,
        includedFeatures: JSON.stringify(["판매 통계 대시보드", "쿠폰 관리 CRUD", "관리자 권한 분리"]),
        memo: "기존 DB 스키마 검토 후 확정된 견적입니다.",
        status: "APPROVED",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    });
    await prisma.payment.create({ data: { orderId: order.id, amount: 3000000, status: "PENDING" } });
  });

  // 주문 3: 제작 중 (회원), 채팅 메시지 포함
  await ensureOrder("A-10003", async () => {
    const order = await prisma.order.create({
      data: {
        orderNo: "A-10003",
        userId: customer!.id,
        pinHash: pinHashDefault,
        title: "디스코드 티켓 관리 봇 제작",
        projectType: "BOT",
        description: "서버 문의 접수를 위한 티켓 시스템 봇이 필요합니다. 티켓 생성/종료/로그 저장 기능을 원합니다.",
        features: JSON.stringify(["DISCORD", "DB"]),
        referenceImages: JSON.stringify([]),
        attachments: JSON.stringify([]),
        desiredTimeline: "2주",
        budget: "80만원",
        contactEmail: customerEmail,
        contactDiscord: "codeuser#1234",
        estimatedPriceMin: 500000,
        estimatedPriceMax: 800000,
        estimatedDays: 10,
        status: "제작중",
        progress: 45,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
        statusHistory: {
          create: [
            { status: "접수", note: "고객이 주문을 접수했습니다.", byAdmin: false },
            { status: "견적확인", note: "견적이 발송되었습니다.", byAdmin: true },
            { status: "결제대기", note: "고객이 견적을 승인했습니다.", byAdmin: false },
            { status: "제작중", note: "입금이 확인되어 제작을 시작합니다.", byAdmin: true },
          ],
        },
      },
    });
    await prisma.quote.create({
      data: {
        orderId: order.id,
        amount: 650000,
        estimatedDays: 10,
        includedFeatures: JSON.stringify(["티켓 생성/종료", "로그 채널 저장", "관리자 명령어"]),
        status: "APPROVED",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      },
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: 650000,
        status: "CONFIRMED",
        depositorName: "김코드",
        notifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        confirmedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        confirmedBy: "최고관리자",
      },
    });
    await prisma.message.create({
      data: { orderId: order.id, senderType: "ADMIN", content: "안녕하세요! 티켓 봇 제작 시작했습니다. 우선 기본 명령어 구조부터 잡고 있습니다.", pinned: true, readByAdmin: true },
    });
    await prisma.message.create({
      data: { orderId: order.id, senderType: "USER", userId: customer!.id, content: "네 감사합니다! 혹시 로그 채널은 서버별로 다르게 설정 가능한가요?", readByUser: true },
    });
    await prisma.message.create({
      data: { orderId: order.id, senderType: "ADMIN", content: "네 가능합니다. 설정 명령어로 채널을 지정할 수 있게 만들고 있어요.", readByAdmin: true },
    });
  });

  // 주문 4: 완료 (회원), 산출물 + 리뷰 포함
  await ensureOrder("A-10004", async () => {
    const order = await prisma.order.create({
      data: {
        orderNo: "A-10004",
        userId: customer!.id,
        pinHash: pinHashDefault,
        title: "개인 포트폴리오 웹사이트 제작",
        projectType: "WEBSITE",
        description: "개발자 개인 포트폴리오 사이트 제작 요청드립니다. 다크모드와 블로그 기능이 있으면 좋겠습니다.",
        features: JSON.stringify(["BOARD"]),
        referenceImages: JSON.stringify([]),
        attachments: JSON.stringify([]),
        desiredTimeline: "2주",
        budget: "120만원",
        contactEmail: customerEmail,
        estimatedPriceMin: 900000,
        estimatedPriceMax: 1300000,
        estimatedDays: 10,
        status: "완료",
        progress: 100,
        statusHistory: {
          create: [
            { status: "접수", note: "고객이 주문을 접수했습니다.", byAdmin: false },
            { status: "견적확인", note: "견적이 발송되었습니다.", byAdmin: true },
            { status: "결제대기", note: "고객이 견적을 승인했습니다.", byAdmin: false },
            { status: "제작중", note: "입금이 확인되어 제작을 시작합니다.", byAdmin: true },
            { status: "검수중", note: "1차 산출물이 업로드되었습니다.", byAdmin: true },
            { status: "완료", note: "최종 산출물이 승인되어 완료 처리되었습니다.", byAdmin: true },
          ],
        },
      },
    });
    await prisma.quote.create({
      data: {
        orderId: order.id,
        amount: 1100000,
        estimatedDays: 10,
        includedFeatures: JSON.stringify(["다크모드", "블로그(게시판)", "반응형 디자인"]),
        status: "APPROVED",
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 19),
      },
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: 1100000,
        status: "CONFIRMED",
        depositorName: "김코드",
        notifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 19),
        confirmedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
        confirmedBy: "최고관리자",
      },
    });
    await prisma.deliverable.create({
      data: {
        orderId: order.id,
        versionLabel: "Final",
        fileKey: "deliverables/sample-final-readme.txt",
        fileName: "portfolio-site-final.zip",
        size: 128000,
        note: "최종 납품 소스코드 (시드 데이터 - 실제 파일 아님)",
        uploadedBy: "최고관리자",
        visible: true,
      },
    });
    await prisma.review.create({
      data: {
        userId: customer!.id,
        orderId: order.id,
        rating: 5,
        content: "요청한 기능을 꼼꼼하게 반영해주시고 소통도 빠르셔서 만족스러웠습니다. 다음에도 또 맡기고 싶어요!",
        status: "APPROVED",
        adminReply: "좋은 후기 남겨주셔서 감사합니다! 다음 프로젝트도 잘 부탁드립니다 :)",
        repliedAt: new Date(),
      },
    });
  });

  // ── 샘플 문의 ───────────────────────────────────────────────
  const inquiryExists = await prisma.inquiry.findFirst({ where: { userId: customer!.id } });
  if (!inquiryExists) {
    await prisma.inquiry.create({
      data: {
        userId: customer!.id,
        title: "결제 계좌 문의드립니다",
        content: "무통장입금 시 입금자명이 주문자명과 다르면 확인이 늦어지나요?",
        status: "ANSWERED",
        answer: "입금자명이 다르더라도 주문번호 기준으로 대사하니 크게 걱정하지 않으셔도 됩니다. 다만 '입금 완료 알림' 시 입금자명을 정확히 남겨주시면 확인이 더 빨라집니다.",
        answeredAt: new Date(),
      },
    });
  }

  // 필요한 업로드 디렉터리 미리 생성 (배포 환경에서 uploads/ 볼륨이 비어있어도 안전하게)
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadRoot = path.join(process.cwd(), "uploads");
  for (const dir of ["references", "attachments", "deliverables", "messages", "revisions", "reviews", "portfolio"]) {
    await fs.mkdir(path.join(uploadRoot, dir), { recursive: true });
  }
  await fs.writeFile(
    path.join(uploadRoot, "deliverables", "sample-final-readme.txt"),
    "이 파일은 시드 데이터용 더미 산출물입니다. 실제 납품 파일이 아닙니다."
  );

  console.log("Seed complete.");
  console.log(`Admin login: ${adminLoginId} / ${adminPassword}`);
  console.log(`Customer login: ${customerEmail} / ${customerPassword}`);
  console.log("Sample order numbers: A-10001 (PIN 1234, guest), A-10002/A-10003/A-10004 (customer account, PIN 1234)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
