import { redirect } from "next/navigation";

export default function CustomerLoginRedirect() {
  redirect("/auth/login");
}
