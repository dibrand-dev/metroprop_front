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
        console.log("🔐 Authorize called with credentials:", credentials)
       
        if (!credentials?.email || !credentials?.password) {  
          return null; 
        }
        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          console.log("res", res);
          if (!res.ok) return null;
          const data = await res.json();
          console.log("data", data);
          // Support both { access_token, user } and flat user object responses
          const user = data.user ?? data;
          if (!user?.id) return null;
          console.log("RETURN",  {
            id: String(user.id),
            email: user.email,
            name: user.name,
            phone: user.phone,
            apiToken: data.access_token ?? null,
            role_id: user.role_id,
            organization: user.organization ?? null,
            accept_newsletters: user.accept_newsletters ?? null,            
          });

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            phone: user.phone,
            apiToken: data.access_token ?? null,
            role_id: user.role_id,
            organization: user.organization ?? null,
            accept_newsletters: user.accept_newsletters ?? null,            
          } as any;
        } catch (error) {
          console.log("catch", error)

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
        if (session?.name !== undefined) token.name = session.name;
        if (session?.apiToken !== undefined) token.apiToken = session.apiToken;
        if (session?.role_id !== undefined) token.role_id = session.role_id;
        if (session?.phone !== undefined) token.phone = session.phone;
        if (session?.phone_additional !== undefined) token.phone_additional = session.phone_additional;
        if (session?.phone_whatsapp !== undefined) token.phone_whatsapp = session.phone_whatsapp;
        if (session?.document !== undefined) token.document = session.document;
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
        console.log("👤 User details:", user);
        token.id = user.id;
        // Credentials provider: persist backend API token and organization
        if (user.apiToken) token.apiToken = user.apiToken;
        if (user.role_id) token.role_id = user.role_id;
        if (user.organization !== undefined) token.organization = user.organization;
        if (user.accept_newsletters !== undefined) token.accept_newsletters = user.accept_newsletters;
        if (user.phone !== undefined) token.phone = user.phone;
        if (user.phone_additional !== undefined) token.phone_additional = user.phone_additional;
        if (user.document !== undefined) token.document = user.document;
        if (user.phone_whatsapp !== undefined) token.phone_whatsapp = user.phone_whatsapp;
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
       
        session.user.id = token.id || token.sub;
        if (token.name !== undefined) session.user.name = token.name;
        if (token.apiToken) session.user.apiToken = token.apiToken;
        if (token.organization !== undefined) {
          session.user.organization = token.organization;
        }
        if (token.accept_newsletters !== undefined) {
          session.user.accept_newsletters = token.accept_newsletters;
        }
        if (token.phone !== undefined) {
          session.user.phone = token.phone;
        }
        if (token.phone_additional !== undefined) {
          session.user.phone_additional = token.phone_additional;
        }
        if (token.document !== undefined) {
          session.user.document = token.document;
        }
        if (token.phone_whatsapp !== undefined) {
          session.user.phone_whatsapp = token.phone_whatsapp;
        }
        if (token.role_id !== undefined) {
          session.user.role_id = token.role_id;
        }
      }
      
      console.log("✅ Final session:", {
        expires: session?.expires,
        userId: session?.user?.id
      });
      
      return session;
    },
  },
};
