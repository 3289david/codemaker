import Link from "next/link";

export default async function OrderConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNo?: string; pin?: string }>;
}) {
  const { orderNo, pin } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold">주문이 접수되었습니다</h1>
      <p className="text-neutral-500 mt-2">담당자가 확인 후 정식 견적을 보내드립니다.</p>

      <div className="mt-8 bg-neutral-50 border border-neutral-200 rounded-xl p-6">
        <p className="text-xs text-neutral-400">주문번호</p>
        <p className="text-2xl font-bold text-indigo-600 mt-1">#{orderNo}</p>
        {pin && (
          <>
            <p className="text-xs text-neutral-400 mt-4">조회용 PIN</p>
            <p className="text-lg font-mono font-semibold mt-1">{pin}</p>
            <p className="text-xs text-neutral-400 mt-2">비회원 조회 시 필요하니 꼭 기억해주세요.</p>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {orderNo && (
          <Link href={`/order/track/${orderNo}${pin ? `?pin=${pin}` : ""}`} className="bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700">
            주문 진행 상황 보기
          </Link>
        )}
        <Link href="/" className="text-neutral-500 text-sm hover:underline">홈으로</Link>
      </div>
    </div>
  );
}
