import { redirect } from "next/navigation";

// Preserve the previous public login URL while the canonical route lives at
// /auth/login. Without this route, the root not-found handler sends /login
// visitors back to the homepage.
export default function LegacyLoginPage() {
  redirect("/auth/login");
}
