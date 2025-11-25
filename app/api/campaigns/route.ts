import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const body = await request.json();
    const { integration_id, name, description } = body;

    if (!integration_id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a shareable token
    const shareable_token = randomBytes(16).toString("hex");

    const supabase = await createClient();
    const { data: campaign, error: insertError } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        integration_id,
        name,
        description,
        shareable_token,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create campaign:", insertError);
      return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error("Campaign API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
