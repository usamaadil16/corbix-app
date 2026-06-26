import { renderToStream } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { createElement } from "react";
import { DocumentPdf } from "@/lib/documents/pdf-document";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/shared";
import type { Client, Document } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase credentials missing. Cannot generate PDF." },
      { status: 500 },
    );
  }

  const supabase = createAdminClient();
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", doc.client_id)
    .single();

  const stream = await renderToStream(
    createElement(DocumentPdf, {
      document: doc as Document,
      client: (client as Client | null) ?? null,
    }) as any,
  );

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.type}-${id}.pdf"`,
    },
  });
}
