import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { UserModel } from '@/lib/models/user';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Create or update user in our database
          await UserModel.findOrCreateUser({
            id: user.id,
            name: user.name || '',
            email: user.email!,
            image: user.image || '',
          });
          return true;
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, account }) {
      // When user signs in, get their app user data
      if (account && user) {
        try {
          const appUser = await UserModel.getUserByEmail(user.email!);
          if (appUser) {
            token.appUserId = appUser.id;
            token.role = appUser.role;
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.appUserId = token.appUserId as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
      }
      return session;
    },
  },
  // Remove custom pages to use NextAuth defaults
  // pages: {
  //   signIn: '/auth/signin',
  //   error: '/auth/error',
  // },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };