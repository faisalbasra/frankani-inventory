import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Hardcoded credentials
const VALID_CREDENTIALS = {
  username: "frankani",
  password: "frankani123",
};

// Simple session token generation
function generateSessionToken(): string {
  return `frankani_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (username !== VALID_CREDENTIALS.username || password !== VALID_CREDENTIALS.password) {
      return NextResponse.json(
        { error: "Ugyldig brukernavn eller passord" },
        { status: 401 }
      );
    }

    // Generate session token
    const token = generateSessionToken();
    
    // Set HTTP-only cookie for security
    const cookieStore = cookies();
    cookieStore.set("frankani_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      token: token, // Also return token for client-side storage if needed
      message: "Innlogging vellykket",
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Server feil ved innlogging" },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = cookies();
    cookieStore.delete("frankani_auth");

    return NextResponse.json({
      success: true,
      message: "Utlogging vellykket",
    });

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Server feil ved utlogging" },
      { status: 500 }
    );
  }
}