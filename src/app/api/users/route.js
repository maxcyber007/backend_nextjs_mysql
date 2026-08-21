import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";

//========================================
// CORS
//========================================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
// GET
//========================================
export async function GET() {

  try {

    const [rows] = await db.query(
      "SELECT * FROM tbl_users ORDER BY id ASC"
    );

    return NextResponse.json(
      rows,
      {
        status: 200,
        headers: corsHeaders,
      }
    );

  } catch (error) {

    console.error(error);

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

//========================================
// POST
//========================================
export async function POST(request) {

  try {

    const {
      firstname,
      lastname,
      username,
      password
    } = await request.json();

    //========================================
    // ตรวจสอบข้อมูล
    //========================================
    if (!firstname || !lastname || !username || !password) {

      return NextResponse.json(
        {
          error: "กรุณากรอกข้อมูลให้ครบ"
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );

    }

    //========================================
    // Hash Password
    //========================================
    const hashPassword = await bcrypt.hash(password, 10);

    //========================================
    // INSERT
    //========================================
    const [result] = await db.execute(
      `INSERT INTO tbl_users
      (
        firstname,
        lastname,
        username,
        password
      )
      VALUES (?,?,?,?)`,
      [
        firstname,
        lastname,
        username,
        hashPassword
      ]
    );

    return NextResponse.json(
      {
        message: "Insert Success",
        id: result.insertId,
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );

  } catch (error) {

    console.error(error);

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

//========================================
// PUT
//========================================
export async function PUT(request) {

  try {

    const {
      id,
      firstname,
      lastname,
      username,
      password
    } = await request.json();

    //========================================
    // ตรวจสอบ ID
    //========================================
    if (!id) {

      return NextResponse.json(
        {
          error: "User ID is required"
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );

    }

    let result;

    //========================================
    // มี Password
    // Update Password
    //========================================
    if (password) {

      const hashPassword = await bcrypt.hash(password, 10);

      [result] = await db.execute(
        `UPDATE tbl_users
         SET
           firstname=?,
           lastname=?,
           username=?,
           password=?
         WHERE id=?`,
        [
          firstname,
          lastname,
          username,
          hashPassword,
          id,
        ]
      );

    }

    //========================================
    // ไม่มี Password
    // ไม่ Update Password
    //========================================
    else {

      [result] = await db.execute(
        `UPDATE tbl_users
         SET
           firstname=?,
           lastname=?,
           username=?
         WHERE id=?`,
        [
          firstname,
          lastname,
          username,
          id,
        ]
      );

    }

    //========================================
    // User ไม่พบ
    //========================================
    if (result.affectedRows === 0) {

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

    //========================================
    // Success
    //========================================
    return NextResponse.json(
      {
        message: "Update Success"
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );

  } catch (error) {

    console.error(error);

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