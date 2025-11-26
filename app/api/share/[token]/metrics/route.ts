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
    
    // Get date range parameters from query string
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '7d';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');
    
    console.log('Date range requested:', rangeParam, 'Custom:', customStart, customEnd);
    
    // Convert range parameter to GA4 date format
    let startDate = '7daysAgo';
    let endDate = 'today';
    
    // For breakdown sections (countries, browsers, etc.), use actual 24h window
    let breakdownStartDate = startDate;
    let breakdownEndDate = endDate;
    
    if (rangeParam === 'custom' && customStart && customEnd) {
      // Use custom dates in YYYY-MM-DD format
      startDate = customStart;
      endDate = customEnd;
      breakdownStartDate = customStart;
      breakdownEndDate = customEnd;
    } else {
      // Convert preset ranges to GA4 format
      switch(rangeParam) {
        case '1d':
          // For time-series: fetch yesterday + today (for rolling 24h hourly data)
          startDate = 'yesterday';
          endDate = 'today';
          // For breakdowns: also fetch yesterday + today so we can filter client-side
          breakdownStartDate = 'yesterday';
          breakdownEndDate = 'today';
          break;
        case '3d':
          startDate = '2daysAgo'; // 3 days = today + 2 days ago
          breakdownStartDate = '2daysAgo';
          break;
        case '7d':
          startDate = '6daysAgo'; // 7 days = today + 6 days ago
          breakdownStartDate = '6daysAgo';
          break;
        case '14d':
          startDate = '13daysAgo'; // 14 days = today + 13 days ago
          breakdownStartDate = '13daysAgo';
          break;
        case '30d':
          startDate = '29daysAgo'; // 30 days = today + 29 days ago
          breakdownStartDate = '29daysAgo';
          break;
        case '90d':
          startDate = '89daysAgo'; // 90 days = today + 89 days ago
          breakdownStartDate = '89daysAgo';
          break;
        default:
          startDate = '6daysAgo';
          breakdownStartDate = '6daysAgo';
      }
    }
    
    console.log('==========================================');
    console.log('Using GA4 dates for time-series:', startDate, 'to', endDate);
    console.log('Using GA4 dates for breakdowns:', breakdownStartDate, 'to', breakdownEndDate);
    console.log('==========================================');
    
    // Determine dimension based on time range
    let timeDimension = { name: "date" };
    if (rangeParam === '1d') {
      timeDimension = { name: "dateHour" };
    }

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

    // Fetch GA4 metrics - Time series data with breakdown by hour/day
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
            { startDate, endDate },
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
            { name: "screenPageViews" },
            { name: "newUsers" },
            { name: "engagementRate" },
            { name: "engagedSessions" },
            { name: "screenPageViewsPerSession" },
            { name: "eventCount" },
          ],
          dimensions: [
            timeDimension,
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

    // Fetch TOTAL metrics for the period (without time dimension breakdown)
    const totalMetricsResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate, endDate },
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
            { name: "screenPageViews" },
            { name: "newUsers" },
            { name: "engagementRate" },
            { name: "engagedSessions" },
            { name: "screenPageViewsPerSession" },
            { name: "eventCount" },
          ],
          // NO dimensions - this gives us aggregated totals
        }),
      }
    );

    const totalMetricsData = totalMetricsResponse.ok ? await totalMetricsResponse.json() : null;

    // Fetch traffic sources
    const sourcesDimensions = [{ name: "sessionSource" }];
    if (rangeParam === '1d') sourcesDimensions.push({ name: "dateHour" });
    
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
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: sourcesDimensions,
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
    const countriesDimensions = [{ name: "country" }];
    if (rangeParam === '1d') countriesDimensions.push({ name: "dateHour" });
    
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
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: countriesDimensions,
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
    const citiesDimensions = [{ name: "city" }];
    if (rangeParam === '1d') citiesDimensions.push({ name: "dateHour" });
    
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
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: citiesDimensions,
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
    const browsersDimensions = [{ name: "browser" }];
    if (rangeParam === '1d') browsersDimensions.push({ name: "dateHour" });
    
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
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: browsersDimensions,
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
    const osDimensions = [{ name: "operatingSystem" }];
    if (rangeParam === '1d') osDimensions.push({ name: "dateHour" });
    
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
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: osDimensions,
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
    const referrersDimensions = [{ name: "sessionSource" }];
    if (rangeParam === '1d') referrersDimensions.push({ name: "dateHour" });
    
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
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: referrersDimensions,
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
    const socialDimensions = [{ name: "sessionSource" }];
    if (rangeParam === '1d') socialDimensions.push({ name: "dateHour" });
    
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
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: socialDimensions,
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

    // Fetch session medium (organic, cpc, referral, etc.)
    const mediumDimensions = [{ name: "sessionMedium" }];
    if (rangeParam === '1d') mediumDimensions.push({ name: "dateHour" });
    
    const mediumResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
          ],
          dimensions: mediumDimensions,
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

    const mediumData = mediumResponse.ok ? await mediumResponse.json() : null;

    // Fetch device category
    const deviceDimensions = [{ name: "deviceCategory" }];
    if (rangeParam === '1d') deviceDimensions.push({ name: "dateHour" });
    
    const deviceResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
          ],
          dimensions: deviceDimensions,
        }),
      }
    );

    const deviceData = deviceResponse.ok ? await deviceResponse.json() : null;

    // Fetch regions
    const regionsDimensions = [{ name: "region" }];
    if (rangeParam === '1d') regionsDimensions.push({ name: "dateHour" });
    
    const regionsResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: regionsDimensions,
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
          limit: 20,
        }),
      }
    );

    const regionsData = regionsResponse.ok ? await regionsResponse.json() : null;

    // Fetch continents
    const continentsDimensions = [{ name: "continent" }];
    if (rangeParam === '1d') continentsDimensions.push({ name: "dateHour" });
    
    const continentsResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: continentsDimensions,
          orderBys: [
            {
              metric: { metricName: "activeUsers" },
              desc: true,
            },
          ],
        }),
      }
    );

    const continentsData = continentsResponse.ok ? await continentsResponse.json() : null;

    // Fetch languages
    const languagesDimensions = [{ name: "language" }];
    if (rangeParam === '1d') languagesDimensions.push({ name: "dateHour" });
    
    const languagesResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: languagesDimensions,
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

    const languagesData = languagesResponse.ok ? await languagesResponse.json() : null;

    // Fetch mobile device branding
    const mobileDevicesDimensions = [{ name: "mobileDeviceBranding" }];
    if (rangeParam === '1d') mobileDevicesDimensions.push({ name: "dateHour" });
    
    const mobileDevicesResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: mobileDevicesDimensions,
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

    const mobileDevicesData = mobileDevicesResponse.ok ? await mobileDevicesResponse.json() : null;

    // Fetch screen resolution
    const screenResolutionDimensions = [{ name: "screenResolution" }];
    if (rangeParam === '1d') screenResolutionDimensions.push({ name: "dateHour" });
    
    const screenResolutionResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "activeUsers" },
          ],
          dimensions: screenResolutionDimensions,
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

    const screenResolutionData = screenResolutionResponse.ok ? await screenResolutionResponse.json() : null;

    // Fetch page titles (Views by Page)
    const pageTitlesDimensions = [{ name: "pageTitle" }];
    if (rangeParam === '1d') pageTitlesDimensions.push({ name: "dateHour" });
    
    const pageTitlesResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: breakdownStartDate, endDate: breakdownEndDate },
          ],
          metrics: [
            { name: "screenPageViews" },
          ],
          dimensions: pageTitlesDimensions,
          orderBys: [
            {
              metric: { metricName: "screenPageViews" },
              desc: true,
            },
          ],
          limit: 10,
        }),
      }
    );

    const pageTitlesData = pageTitlesResponse.ok ? await pageTitlesResponse.json() : null;

    // Fetch session default channel group
    const channelGroupDimensions = [
      { name: "sessionDefaultChannelGroup" },
    ];
    
    // For "1d" range, add time dimension so we can filter to last 24h client-side
    if (rangeParam === '1d') {
      channelGroupDimensions.push({ name: "dateHour" });
    }
    
    const channelGroupRequestBody = {
      dateRanges: [
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
      ],
      metrics: [
        { name: "sessions" },
      ],
      dimensions: channelGroupDimensions,
      orderBys: [
        {
          metric: { metricName: "sessions" },
          desc: true,
        },
      ],
    };
    
    console.log('📊 Channel Group API Request:', JSON.stringify(channelGroupRequestBody, null, 2));
    
    const channelGroupResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(channelGroupRequestBody),
      }
    );

    const channelGroupData = channelGroupResponse.ok ? await channelGroupResponse.json() : null;
    
    if (channelGroupData) {
      console.log('📊 Channel Group API Response rows:', channelGroupData.rows?.length || 0);
      if (channelGroupData.rows) {
        channelGroupData.rows.forEach((row: any) => {
          console.log(`  - ${row.dimensionValues[0].value}: ${row.metricValues[0].value} sessions`);
        });
      }
    }

    // Fetch user activity over time (daily active users)
    const userActivityResponse = await fetch(
      `${GA_DATA_API}/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate, endDate },
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "newUsers" },
          ],
          dimensions: [
            timeDimension,
          ],
        }),
      }
    );

    const userActivityData = userActivityResponse.ok ? await userActivityResponse.json() : null;

    return NextResponse.json({
      metrics: metricsData,
      totalMetrics: totalMetricsData,
      sources: sourcesData,
      countries: countriesData,
      cities: citiesData,
      browsers: browsersData,
      os: osData,
      referrers: referrersData,
      social: socialData,
      medium: mediumData,
      devices: deviceData,
      regions: regionsData,
      continents: continentsData,
      languages: languagesData,
      mobileDevices: mobileDevicesData,
      screenResolution: screenResolutionData,
      pageTitles: pageTitlesData,
      channelGroup: channelGroupData,
      userActivity: userActivityData,
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
