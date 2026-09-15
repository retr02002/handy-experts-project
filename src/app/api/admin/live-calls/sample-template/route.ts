import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildSampleWorkbook } from "@/lib/adminLiveCallExcel";

// File-generation is the one case a Route Handler fits — a Server Action
// can't hand back a binary download with its own filename/content-type.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const buffer = await buildSampleWorkbook();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="live-calls-sample.xlsx"',
      },
    });
  } catch (error) {
    console.error("Build sample template error:", error);
    return NextResponse.json({ error: "Failed to build sample template" }, { status: 500 });
  }
}
