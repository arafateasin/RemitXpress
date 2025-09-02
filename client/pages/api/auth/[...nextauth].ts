import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login", // Use login page for sign-in
    error: "/login", // Use login page for errors
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Simplified: Just allow the login without backend integration for now
      console.log("OAuth signIn callback:", {
        user: user.email,
        provider: account?.provider,
      });
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Include user info in the token
      if (account && user) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        (session.user as any).id = token.userId;
        (session as any).accessToken = token.accessToken;
        (session as any).provider = token.provider;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect:", { url, baseUrl });

      // If user is coming from register or login page, redirect to dashboard
      if (
        url.includes("/register") ||
        url.includes("/login") ||
        url === baseUrl
      ) {
        return `${baseUrl}/dashboard`;
      }

      // If it's a sign out, redirect to home
      if (url.includes("/api/auth/signout")) {
        return baseUrl;
      }

      // If URL is relative and safe, use it
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
});
