import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";

//========================================
// CORS
//========================================
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.cmtc.ac.th",
  "https://cmtc.ac.th",
];

function getCorsHeaders(request) {

  const origin = request.headers.get("origin");

  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

//========================================
// OPTIONS
//========================================
export async function OPTIONS(request) {

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });

}

//========================================
// GET User By ID
//========================================
export async function GET(request, { params }) {

  const corsHeaders = getCorsHeaders(request);

  try {

    const { id } = await params;

    const [rows] = await db.execute(
      "SELECT * FROM tbl_users WHERE id = ?",
      [id]
    );

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

    return NextResponse.json(
      rows[0],
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
// PUT
//========================================
export async function PUT(request) {

  const corsHeaders = getCorsHeaders(request);

  try {

    const {
      id,
      firstname,
      lastname,
      username,
      password
    } = await request.json();

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

    } else {

      //========================================
      // ไม่มี Password
      // ไม่ Update Password
      //========================================

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

//========================================
// DELETE User By ID
//========================================
export async function DELETE(request, { params }) {

  const corsHeaders = getCorsHeaders(request);

  try {

    const { id } = await params;

    const [result] = await db.execute(
      "DELETE FROM tbl_users WHERE id = ?",
      [id]
    );

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

    return NextResponse.json(
      {
        message: "Delete Success",
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