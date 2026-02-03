import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  req: Request,
  { params }: { params: { table: string } }
) {
  const { table } = params
  const { searchParams } = new URL(req.url)

  // Convert searchParams → object
  const query: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    query[key] = value
  })

  // Start query
  let q = supabase.from(table).select("*")

  // Apply filters dynamically
  Object.entries(query).forEach(([key, value]) => {
    if (key === "limit") {
      q = q.limit(Number(value))
    } else if (key === "order") {
      q = q.order(value)
    } else {
      q = q.eq(key, value)
    }
  })

  const { data, error } = await q

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
