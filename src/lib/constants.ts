// 애플리케이션 전역에서 사용하는 상태값 상수.
// SQLite + Prisma는 네이티브 enum을 지원하지 않아 문자열 컬럼으로 저장하므로,
// 아래 상수를 통해서만 값을 비교/대입한다.

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export const ADMIN_ROLE = {
  SUPER: "SUPER",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
} as const;

export const ADMIN_STATUS = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

// 주문 상태 머신 (순서대로 진행, CANCELLED는 사이드 상태)
export const ORDER_STATUS = {
  RECEIVED: "접수",
  QUOTE_CHECK: "견적확인",
  PAYMENT_WAIT: "결제대기",
  IN_PROGRESS: "제작중",
  REVIEW: "검수중",
  REVISION: "수정중",
  DONE: "완료",
  CANCELLED: "취소",
} as const;

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.QUOTE_CHECK,
  ORDER_STATUS.PAYMENT_WAIT,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.REVIEW,
  ORDER_STATUS.REVISION,
  ORDER_STATUS.DONE,
] as const;

export const QUOTE_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  APPROVED: "APPROVED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  NOTIFIED: "NOTIFIED",
  CONFIRMED: "CONFIRMED",
} as const;

export const REVISION_STATUS = {
  REQUESTED: "요청확인",
  IN_PROGRESS: "수정중",
  DONE: "완료",
} as const;

export const REVIEW_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  HIDDEN: "HIDDEN",
} as const;

export const INQUIRY_STATUS = {
  WAITING: "WAITING",
  ANSWERED: "ANSWERED",
} as const;

export const PROJECT_TYPES: { key: string; label: string }[] = [
  { key: "WEBSITE", label: "웹사이트" },
  { key: "WEBAPP", label: "웹서비스" },
  { key: "PROGRAM", label: "프로그램/자동화" },
  { key: "BOT", label: "봇(디스코드 등)" },
  { key: "API", label: "API" },
  { key: "ETC", label: "기타" },
];

export const SERVICE_CATEGORIES: { key: string; label: string }[] = [
  { key: "WEBSITE", label: "웹사이트 제작" },
  { key: "WEBAPP", label: "웹서비스 제작" },
  { key: "DISCORD_BOT", label: "Discord Bot" },
  { key: "CHROME_EXT", label: "Chrome Extension" },
  { key: "API", label: "API 제작" },
  { key: "AUTOMATION", label: "자동화 프로그램" },
  { key: "AI", label: "AI 기능 개발" },
  { key: "DB", label: "DB 연동" },
  { key: "ADMIN_PAGE", label: "관리자 페이지" },
  { key: "MAINTENANCE", label: "기존 코드 수정/버그 수정/기능 추가" },
  { key: "CUSTOM", label: "커스텀 개발" },
];

export const FEATURE_KEYS: { key: string; label: string }[] = [
  { key: "LOGIN", label: "로그인" },
  { key: "SIGNUP", label: "회원가입" },
  { key: "DB", label: "DB 연동" },
  { key: "ADMIN", label: "관리자 페이지" },
  { key: "PAYMENT", label: "결제" },
  { key: "API", label: "외부 API 연동" },
  { key: "AI", label: "AI 기능" },
  { key: "UPLOAD", label: "파일 업로드" },
  { key: "EMAIL", label: "이메일 발송" },
  { key: "DISCORD", label: "Discord 연동" },
  { key: "OAUTH", label: "소셜 로그인(OAuth)" },
  { key: "SEARCH", label: "검색" },
  { key: "BOARD", label: "게시판" },
];

export const NOTICE_CATEGORIES: { key: string; label: string }[] = [
  { key: "SERVICE", label: "서비스 공지" },
  { key: "PRICE", label: "가격변경" },
  { key: "HOLIDAY", label: "휴무" },
  { key: "EVENT", label: "이벤트" },
  { key: "MAINTENANCE", label: "점검" },
];

export const NOTIFICATION_TYPES = {
  ORDER_RECEIVED: "ORDER_RECEIVED",
  QUOTE_ARRIVED: "QUOTE_ARRIVED",
  PAYMENT_REQUESTED: "PAYMENT_REQUESTED",
  PRODUCTION_STARTED: "PRODUCTION_STARTED",
  PRODUCTION_COMPLETED: "PRODUCTION_COMPLETED",
  REVISION_COMPLETED: "REVISION_COMPLETED",
  ADMIN_MESSAGE: "ADMIN_MESSAGE",
  INQUIRY_ANSWERED: "INQUIRY_ANSWERED",
} as const;

export function statusBadgeColor(status: string): string {
  switch (status) {
    case ORDER_STATUS.RECEIVED:
      return "bg-neutral-100 text-neutral-700";
    case ORDER_STATUS.QUOTE_CHECK:
      return "bg-blue-100 text-blue-700";
    case ORDER_STATUS.PAYMENT_WAIT:
      return "bg-amber-100 text-amber-700";
    case ORDER_STATUS.IN_PROGRESS:
      return "bg-indigo-100 text-indigo-700";
    case ORDER_STATUS.REVIEW:
      return "bg-purple-100 text-purple-700";
    case ORDER_STATUS.REVISION:
      return "bg-orange-100 text-orange-700";
    case ORDER_STATUS.DONE:
      return "bg-emerald-100 text-emerald-700";
    case ORDER_STATUS.CANCELLED:
      return "bg-red-100 text-red-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}
