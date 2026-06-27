import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";

//========================================
// GET
//========================================
export async function GET() {
return NextResponse.json(
      { error: "GET" }
    );
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

    const hashPassword = await bcrypt.hash(password, 10);

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
      }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
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

    let hashPassword = password;

    if (password) {
      hashPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await db.execute(
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

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Update Success",
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );

  }

}