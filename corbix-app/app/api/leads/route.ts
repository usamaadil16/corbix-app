import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/shared";
import { leadSchema } from "@/lib/validations/lead";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mocked: true });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("leads").insert({
    ...parsed.data,
    status: "new",
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to submit lead. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
