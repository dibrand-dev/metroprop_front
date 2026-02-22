import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("🚀 NEXTAUTH ROUTE - Inicializando...");
console.log("  NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("  NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ MISSING");
console.log("  GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ SET" : "❌ MISSING");
console.log("  GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ SET" : "❌ MISSING");
console.log("  NODE_ENV:", process.env.NODE_ENV);

console.log("🔥 NEXTAUTH ROUTE - Initializing NextAuth handler...");

// Wrapper para capturar errores
const createHandler = () => {
  try {
    console.log("🚀 Creating NextAuth handler with options...");
    const handler = NextAuth(authOptions);
    console.log("✅ NextAuth handler created successfully");
    return handler;
  } catch (error) {
    console.error("❌ Error creating NextAuth handler:", error);
    throw error;
  }
};

// Wrapper para GET
const GET = async (request: Request, context: any) => {
  console.log("📥 GET Request to NextAuth API");
  console.log("  - URL:", request.url);
  console.log("  - Method:", request.method);
  console.log("  - Headers:", Object.fromEntries(request.headers.entries()));
  
  try {
    const handler = createHandler();
    const response = await handler(request, context);
    console.log("✅ GET Response successful");
    return response;
  } catch (error) {
    console.error("❌ Error in GET handler:", error);
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

// Wrapper para POST
const POST = async (request: Request, context: any) => {
  console.log("📤 POST Request to NextAuth API");
  console.log("  - URL:", request.url);
  console.log("  - Method:", request.method);
  
  try {
    const handler = createHandler();
    const response = await handler(request, context);
    console.log("✅ POST Response successful");
    return response;
  } catch (error) {
    console.error("❌ Error in POST handler:", error);
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

export { GET, POST };
