import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Delete user's OAuth temp sessions
    const { error } = await supabase
      .from("oauth_temp_sessions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to cleanup session:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cleanup session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
