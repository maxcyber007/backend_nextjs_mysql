import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // ค้นหาผู้ใช้
    const [rows] = await db.execute(
      "SELECT * FROM tbl_users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0];

    // ตรวจสอบรหัสผ่าน
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // สร้าง JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // ไม่ส่ง password กลับ
    const { password: _, ...userData } = user;

    return NextResponse.json(
      {
        message: "Login successful",
        user: userData,
        token,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

// CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}