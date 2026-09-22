import { cookies } from "next/headers";

export async function POST() {
  const store = await cookies();
  store.set("customer_access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return Response.json({ ok: true });
}
