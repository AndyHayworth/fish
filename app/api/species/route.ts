import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("species")
    .select(
      "id, scientific_name, common_name, category, family, temp_min, temp_max, ph_min, ph_max, max_size_inches, difficulty, aggression, aliases"
    )
    .or(
      `common_name.ilike.%${q}%,scientific_name.ilike.%${q}%`
    )
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
