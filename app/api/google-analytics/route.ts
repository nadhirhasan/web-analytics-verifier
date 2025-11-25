import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google Analytics Data API endpoint
const GA_DATA_API = "https://analyticsdata.googleapis.com/v1beta";

export async function POST(request: NextRequest) {
  try {
    // Get user and campaign info from request body
    const { propertyId, metrics, dimensions, dateRange, user_id } = await request.json();

    // Fetch OAuth tokens from temp session table
    const supabase = await createClient();
    const { data: sessionRow, error } = await supabase
      .from("oauth_temp_sessions")
      .select("session_data")
      .eq("user_id", user_id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !sessionRow) {
      return NextResponse.json({ error: "OAuth session not found" }, { status: 401 });
    }

    const { access_token } = sessionRow.session_data;

    // Prepare GA Data API request
    const response = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [dateRange || { startDate: "7daysAgo", endDate: "today" }],
          metrics: metrics || [{ name: "sessions" }, { name: "totalUsers" }],
          dimensions: dimensions || [{ name: "source" }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: "Failed to fetch GA data", details: errorData }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GA fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
