import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

//========================================
// CORS
//========================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

//========================================
// OPTIONS
//========================================
export async function OPTIONS() {

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });

}

//========================================
// POST LOGIN
//========================================
export async function POST(request) {

  try {

    const {
      username,
      password
    } = await request.json();

    //========================================
    // ตรวจสอบข้อมูล
    //========================================
    if (!username || !password) {

      return NextResponse.json(
        {
          error: "กรุณากรอก Username และ Password"
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );

    }

    //========================================
    // ค้นหาผู้ใช้
    //========================================
    const [rows] = await db.execute(
      "SELECT * FROM tbl_users WHERE username = ?",
      [username]
    );

    //========================================
    // ไม่พบ User
    //========================================
    if (rows.length === 0) {

      return NextResponse.json(
        {
          error: "User not found"
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );

    }

    const user = rows[0];

    //========================================
    // ตรวจสอบ Password
    //========================================
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return NextResponse.json(
        {
          error: "Invalid password"
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );

    }

    //========================================
    // ตรวจสอบ JWT_SECRET
    //========================================
    if (!process.env.JWT_SECRET) {

      console.error("JWT_SECRET is not defined");

      return NextResponse.json(
        {
          error: "JWT configuration error"
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );

    }

    //========================================
    // สร้าง JWT
    //========================================
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

    //========================================
    // ไม่ส่ง Password กลับ
    //========================================
    const {
      password: _,
      ...userData
    } = user;

    //========================================
    // Login Success
    //========================================
    return NextResponse.json(
      {
        message: "Login successful",
        user: userData,
        token: token,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error"
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );

  }

}