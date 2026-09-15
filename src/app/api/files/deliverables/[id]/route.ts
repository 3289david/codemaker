import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readUploadedFile, guessContentType } from "@/lib/storage";
import { resolveOrderActor } from "@/lib/orderAccess";

// 산출물 다운로드는 항상 소유권을 검증하는 라우트 핸들러를 통해서만 내려준다.
// 결제가 확인되지 않은 주문이라도 관리자가 visible=true로 설정했다면 확인 가능하도록
// (예: 샘플 공개) 하되, 기본 시드 데이터는 결제 확인 후에만 visible 처리한다.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = req.nextUrl.searchParams.get("pin");

  const deliverable = await prisma.deliverable.findUnique({ where: { id } });
  if (!deliverable || !deliverable.visible) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const actor = await resolveOrderActor(deliverable.orderId, pin);
  if (!actor) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const buffer = await readUploadedFile(deliverable.fileKey);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": guessContentType(deliverable.fileName),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(deliverable.fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "file missing" }, { status: 404 });
  }
}
