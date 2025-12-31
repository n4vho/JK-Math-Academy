// Redirect /login to /admin/login for backward compatibility
import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/admin/login");
}
