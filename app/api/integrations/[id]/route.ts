import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    // Delete integration (will cascade to campaigns due to ON DELETE SET NULL)
    const { error } = await supabase
      .from("integrations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure user owns this integration

    if (error) {
      console.error("Failed to delete integration:", error);
      return NextResponse.json(
        { error: "Failed to delete integration" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete integration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
