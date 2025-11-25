import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // JSON string with userId and from
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=oauth_failed`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=missing_params`, request.url)
    );
  }

  try {
    // Parse state to get userId and source
    const stateData = JSON.parse(state);
    const userId = stateData.userId;
    const from = stateData.from || 'dashboard';

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL(`/dashboard?error=token_exchange_failed`, request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Fetch user's GA4 properties
    const propertiesResponse = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!propertiesResponse.ok) {
      console.error("Failed to fetch GA4 properties");
      return NextResponse.redirect(
        new URL(`/dashboard?error=fetch_properties_failed`, request.url)
      );
    }

    const propertiesData = await propertiesResponse.json();
    const accountSummaries = propertiesData.accountSummaries || [];

    // Extract all GA4 properties from account summaries
    const properties: Array<{
      id: string;
      displayName: string;
      propertyId: string;
      websiteUrl: string;
    }> = [];

    accountSummaries.forEach((account: any) => {
      if (account.propertySummaries) {
        account.propertySummaries.forEach((prop: any) => {
          properties.push({
            id: prop.property, // Format: "properties/123456789"
            displayName: prop.displayName,
            propertyId: prop.property.split("/")[1], // Extract numeric ID
            websiteUrl: account.displayName, // Use account name as fallback
          });
        });
      }
    });

    if (properties.length === 0) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=no_properties_found`, request.url)
      );
    }

    // Store tokens and properties in session/temp storage
    const supabase = await createClient();
    
    // Store in a temporary session table or use cookies
    // For now, we'll pass via URL params (not ideal for production, but works for demo)
    const tempData = {
      access_token,
      refresh_token,
      expires_in,
      properties,
      user_id: userId,
    };

    // In production, store in Redis/session store. For now, we'll use a temp database table
    const { error: insertError } = await supabase
      .from("oauth_temp_sessions")
      .insert({
        user_id: userId,
        session_data: tempData,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    if (insertError) {
      console.error("Failed to store session:", insertError);
      // Fallback: redirect with encoded data (not recommended for production)
      const encoded = Buffer.from(JSON.stringify(tempData)).toString("base64");
      return NextResponse.redirect(
        new URL(
          `/dashboard/integrations/google/properties?session=${encoded}&from=${from}`,
          request.url
        )
      );
    }

    // Redirect to property selection page with 'from' param
    return NextResponse.redirect(
      new URL(`/dashboard/integrations/google/properties?from=${from}`, request.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=oauth_callback_failed`, request.url)
    );
  }
}
