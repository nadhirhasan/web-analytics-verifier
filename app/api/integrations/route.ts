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

    const body = await request.json();
    const { platform_type, platform_name, credentials } = body;

    if (!platform_type || !platform_name || !credentials) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert integration
    const { data: integration, error: insertError } = await supabase
      .from("integrations")
      .insert({
        user_id: user.id,
        platform_type,
        platform_name,
        credentials, // Supabase will handle JSONB
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert integration:", insertError);
      return NextResponse.json(
        { error: "Failed to save integration" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, integration },
      { status: 201 }
    );
  } catch (error) {
    console.error("Integration API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
