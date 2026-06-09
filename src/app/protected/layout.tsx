import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Footer from "@/layout/Footer/Footer";
import Header from "@/layout/Header/Header";
import './layout.scss';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    const customToken = (await cookies()).get("authToken")?.value;

    if (!session && !customToken) {
      redirect("/login?sessionExpired=true");
    }

    return <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>;
}
