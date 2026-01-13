import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();   // 👈 await required
  const token = cookieStore.get("token")?.value;

  if (token) {
    redirect("/dashboard");
  }

  redirect("/login");
}
