import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials;

        try {
          const res = await pool.query(
            "SELECT * FROM tbl_users WHERE username = $1",
            [username]
          );

          if (res.rows.length === 0) {
            return null; // user not found
          }

          const user = res.rows[0];

          const match = await bcrypt.compare(password, user.password);
          if (!match) return null;

          // คืนค่า user object (จะเก็บใน session)
          return { id: user.id, username: user.username };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
