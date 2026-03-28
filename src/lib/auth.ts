import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { API_BASE_URL } from "@/utils/utils";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          // Support both { access_token, user } and flat user object responses
          const user = data.user ?? data;
          if (!user?.id) return null;
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            phone: user.phone,
            apiToken: data.access_token ?? null,
            organization: user.organization ?? null,
          } as any;
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user, trigger, session }: any) {
      console.log("🔐 JWT Callback triggered");
      console.log("  - Token:", token ? "✅ EXISTS" : "❌ NULL");
      console.log("  - Account:", account ? "✅ EXISTS" : "❌ NULL");
      console.log("  - User:", user ? "✅ EXISTS" : "❌ NULL");

      // Persist fields when session is updated programmatically via update()
      if (trigger === 'update') {
        if (session?.organization !== undefined) token.organization = session.organization;
        if (session?.id !== undefined) token.id = session.id;
      }

      if (account) {
        console.log("📝 Account details:", {
          provider: account.provider,
          type: account.type,
          access_token: account.access_token ? "✅ SET" : "❌ MISSING"
        });
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        console.log("👤 User details:", {
          id: user.id,
          email: user.email,
          name: user.name
        });
        token.id = user.id;
        // Credentials provider: persist backend API token and organization
        if (user.apiToken) token.apiToken = user.apiToken;
        if (user.organization !== undefined) token.organization = user.organization;
      }
      
      console.log("🔄 Final JWT token:", {
        sub: token.sub,
        email: token.email,
        provider: token.provider
      });
      
      return token;
    },
    async session({ session, token }: any) {
      console.log("🎯 Session Callback triggered");
      console.log("  - Session:", session ? "✅ EXISTS" : "❌ NULL");
      console.log("   - Token:", token ? "✅ EXISTS" : "❌ NULL");
      
      if (session?.user) {
        console.log("👥 Session user before:", {
          id: session.user.id,
          email: session.user.email
        });
        session.user.id = token.id || token.sub;
        if (token.apiToken) session.user.apiToken = token.apiToken;
        if (token.organization !== undefined) {
          session.user.organization = token.organization;
        }
        console.log("👥 Session user after:", {
          id: session.user.id,
          email: session.user.email
        });
      }
      
      console.log("✅ Final session:", {
        expires: session?.expires,
        userId: session?.user?.id
      });
      
      return session;
    },
  },
};
