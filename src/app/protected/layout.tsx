import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const getSession = async () => {
        const token = await cookies()
        console.log(token)
        token.get("session")?.value;
        if (!token) {
            redirect("/login");
        }
    };

    getSession();
    return <>{children}</>;
}
