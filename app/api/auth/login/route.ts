import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

// Replace with your securely generated bcrypt hashes
const users = [
  {
    id: 1,
    email: "admin1@yourstore.com",
    password: "$2b$12$GyYamu..sRIP5Pby9RVJxebURuudpOhrqu.Y0xjiOch9Vma5/RZ6q",
    role: "admin",
  },
  {
    id: 2,
    email: "admin2@yourstore.com",
    password: "$2b$12$C31.JpSP7Bf.Q4urxDJXkuzbtUJofmvB9GFBRceXC0/gDUl93bI82",
    role: "admin",
  },
];

// Parse POST login
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ success: true });

    // Set cookie
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// Handle logout (DELETE request)
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
