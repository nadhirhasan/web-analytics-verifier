import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GA_DATA_API = "https://analyticsdata.googleapis.com/v1beta";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    // Fetch campaign by shareable token
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*, integrations(*)")
      .eq("shareable_token", token)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Only support GA for now
    if (campaign.integrations?.platform_type !== 'google_analytics') {
      return NextResponse.json(
        { error: "Only Google Analytics is supported" },
        { status: 400 }
      );
    }

    const credentials = campaign.integrations.credentials;
    let accessToken = credentials.access_token;
    const refreshToken = credentials.refresh_token;
    const propertyId = campaign.property_id || credentials.property_id;

    if (!propertyId) {
      return NextResponse.json(
        { error: "No property ID found" },
        { status: 400 }
      );
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available. Please reconnect your Google Analytics account." },
        { status: 401 }
      );
    }

    // Always refresh the token to ensure it's valid
    console.log("Refreshing Google OAuth token...");
    const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;
      const now = Math.floor(Date.now() / 1000);
      
      // Update the credentials in database
      const newCredentials = {
        ...credentials,
        access_token: refreshData.access_token,
        expires_at: now + (refreshData.expires_in || 3600),
      };

      await supabase
        .from("integrations")
        .update({ credentials: newCredentials })
        .eq("id", campaign.integrations.id);
      
      console.log("Token refreshed successfully");
    } else {
      const errorText = await refreshResponse.text();
      console.error("Token refresh failed:", errorText);
      return NextResponse.json(
        { error: "Failed to refresh authentication. Please reconnect your Google Analytics account." },
        { status: 401 }
      );
    }

    // Fetch GA4 metrics
    const metricsResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
            { name: "screenPageViews" },
          ],
          dimensions: [
            { name: "date" },
          ],
        }),
      }
    );

    if (!metricsResponse.ok) {
      const errorData = await metricsResponse.json();
      console.error("GA API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch GA data", details: errorData },
        { status: 500 }
      );
    }

    const metricsData = await metricsResponse.json();

    // Fetch traffic sources
    const sourcesResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: [
            { name: "sessionSource" },
          ],
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 5,
        }),
      }
    );

    const sourcesData = sourcesResponse.ok ? await sourcesResponse.json() : null;

    // Fetch countries
    const countriesResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: [
            { name: "country" },
          ],
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 5,
        }),
      }
    );

    const countriesData = countriesResponse.ok ? await countriesResponse.json() : null;

    // Fetch cities
    const citiesResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: [
            { name: "city" },
          ],
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 10,
        }),
      }
    );

    const citiesData = citiesResponse.ok ? await citiesResponse.json() : null;

    // Fetch browsers
    const browsersResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: [
            { name: "browser" },
          ],
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 10,
        }),
      }
    );

    const browsersData = browsersResponse.ok ? await browsersResponse.json() : null;

    // Fetch operating systems
    const osResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: [
            { name: "operatingSystem" },
          ],
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 10,
        }),
      }
    );

    const osData = osResponse.ok ? await osResponse.json() : null;

    // Fetch referrers
    const referrersResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: [
            { name: "sessionSource" },
          ],
          dimensionFilter: {
            filter: {
              fieldName: "sessionMedium",
              stringFilter: {
                matchType: "EXACT",
                value: "referral",
              },
            },
          },
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 5,
        }),
      }
    );

    const referrersData = referrersResponse.ok ? await referrersResponse.json() : null;

    // Fetch social referrers
    const socialResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: "7daysAgo", endDate: "today" },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: [
            { name: "sessionSource" },
          ],
          dimensionFilter: {
            orGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: "sessionSource",
                    stringFilter: {
                      matchType: "CONTAINS",
                      value: "facebook",
                      caseSensitive: false,
                    },
                  },
                },
                {
                  filter: {
                    fieldName: "sessionSource",
                    stringFilter: {
                      matchType: "CONTAINS",
                      value: "twitter",
                      caseSensitive: false,
                    },
                  },
                },
                {
                  filter: {
                    fieldName: "sessionSource",
                    stringFilter: {
                      matchType: "CONTAINS",
                      value: "instagram",
                      caseSensitive: false,
                    },
                  },
                },
                {
                  filter: {
                    fieldName: "sessionSource",
                    stringFilter: {
                      matchType: "CONTAINS",
                      value: "linkedin",
                      caseSensitive: false,
                    },
                  },
                },
              ],
            },
          },
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 5,
        }),
      }
    );

    const socialData = socialResponse.ok ? await socialResponse.json() : null;

    return NextResponse.json({
      metrics: metricsData,
      sources: sourcesData,
      countries: countriesData,
      cities: citiesData,
      browsers: browsersData,
      os: osData,
      referrers: referrersData,
      social: socialData,
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
