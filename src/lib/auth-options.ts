import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Zugangsdaten",
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        // Admin-Zugangsdaten validieren
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          // Wenn gültig, einen Benutzer zurückgeben
          return {
            id: "admin",
            name: "Administrator",
            email: "admin@example.com",
            role: "admin",
          };
        }
        
        // Wenn ungültig, null zurückgeben (kein Benutzer)
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 Stunden
  },
  callbacks: {
    async jwt({ token, user }) {
      // Benutzerrolle zum Token hinzufügen, wenn vorhanden
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Benutzerrolle zur Session hinzufügen
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};