import { NextResponse } from "next/server";
import { registerUser } from "@/actions/auth.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Using the existing server action logic
    const result = await registerUser(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, errors: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
