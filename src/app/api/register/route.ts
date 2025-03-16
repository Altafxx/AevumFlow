import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db-client";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse('Email already exists', { status: 400 });
    }

    const hashedPassword = await hash(password, 12);
    console.log(hashedPassword);

    const user = await db.user.create({
      data: {
        email,
        name,
        hashedPassword
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}