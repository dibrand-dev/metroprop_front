import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    const customToken = (await cookies()).get("authToken")?.value;

    if (!session && !customToken) {
      redirect("/login");
    }

    return <>{children}</>;
}
