import Google from "next-auth/providers/google";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
  secret: process.env.NEXTAUTH_SECRET,
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
      console.log("   - Token:", token ? "✅ EXISTS" : "❌ NULL");
      
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
