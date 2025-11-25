import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    // Fetch integration
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    // Only Google Analytics has multiple properties
    if (integration.platform_type !== 'google_analytics') {
      return NextResponse.json({ properties: [] });
    }

    const credentials = integration.credentials;
    const accessToken = credentials.access_token;

    // Fetch GA4 properties using Analytics Admin API
    const propertiesResponse = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!propertiesResponse.ok) {
      console.error("Failed to fetch GA4 properties");
      return NextResponse.json(
        { error: "Failed to fetch properties" },
        { status: 500 }
      );
    }

    const propertiesData = await propertiesResponse.json();
    const accountSummaries = propertiesData.accountSummaries || [];

    // Extract all GA4 properties
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
            id: prop.property,
            displayName: prop.displayName,
            propertyId: prop.property.split("/")[1],
            websiteUrl: account.displayName,
          });
        });
      }
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Get properties error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
