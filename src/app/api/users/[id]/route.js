import { NextResponse } from "next/server";
import db from "@/lib/db";

//========================================
// GET User By ID
//========================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const [rows] = await db.execute(
      "SELECT * FROM tbl_users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], {
      status: 200,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );

  }
}

//========================================
// DELETE User By ID
//========================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const [result] = await db.execute(
      "DELETE FROM tbl_users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Delete Success",
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