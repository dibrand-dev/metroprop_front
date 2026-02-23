import Google from "next-auth/providers/google";

// 🔍 DEBUG: Verificar variables de entorno al cargar
console.log("🚀 AUTH.TS - Cargando configuración de autenticación...");
console.log("📍 Environment variables check:");
console.log("  NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("  NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ MISSING");
console.log("  GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ SET" : "❌ MISSING");
console.log("  GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ SET" : "❌ MISSING");
console.log("  NODE_ENV:", process.env.NODE_ENV);

// Validate required variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ CRITICAL: NEXTAUTH_SECRET is not defined");
}
if (!process.env.NEXTAUTH_URL) {
  console.error("❌ CRITICAL: NEXTAUTH_URL is not defined");
}
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("❌ CRITICAL: GOOGLE_CLIENT_ID is not defined");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ CRITICAL: GOOGLE_CLIENT_SECRET is not defined");
}

const nextAuthSecret = process.env.NEXTAUTH_SECRET || "hvV9Mq98s0KWVJJhEuPaKzoCDFDLMW7XT5Sb0zojYuk=";
const googleClientId = process.env.GOOGLE_CLIENT_ID || "307220843869-63oehge1v38uk4s08ea6u5ou1ak0vknl.apps.googleusercontent.com";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "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";
const nextAuthUrl = process.env.NEXTAUTH_URL || "https://www.metroprop.co";

console.log("🚀 AUTH.TS - Using:", {
  NEXTAUTH_URL: nextAuthUrl,
  NEXTAUTH_SECRET: nextAuthSecret ? "✅ SET" : "❌ MISSING",
  GOOGLE_CLIENT_ID: googleClientId ? "✅ SET" : "❌ MISSING",
  GOOGLE_CLIENT_SECRET: googleClientSecret ? "✅ SET" : "❌ MISSING",
});

export const authOptions = {
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
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
  secret: nextAuthSecret,
  callbacks: {
    async jwt({ token, account, user }: any) {
      console.log("🔐 JWT Callback triggered");
      console.log("  - Token:", token ? "✅ EXISTS" : "❌ NULL");
      console.log("  - Account:", account ? "✅ EXISTS" : "❌ NULL");
      console.log("  - User:", user ? "✅ EXISTS" : "❌ NULL");
      
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
      console.log("  - Token:", token ? "✅ EXISTS" : "❌ NULL");
      
      if (session?.user) {
        console.log("👥 Session user before:", {
          id: session.user.id,
          email: session.user.email
        });
        session.user.id = token.id || token.sub;
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
