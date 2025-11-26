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

    // Check if token needs refresh (refresh only if expires in <5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = credentials.expires_at || 0;
    const timeUntilExpiry = expiresAt - now;
    const needsRefresh = timeUntilExpiry < 300; // 5 minutes buffer

    if (needsRefresh) {
      console.log(`Token expires in ${Math.floor(timeUntilExpiry / 60)} minutes, refreshing...`);
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
        
        console.log("✅ Token refreshed successfully");
      } else {
        const errorText = await refreshResponse.text();
        console.error("Token refresh failed:", errorText);
        return NextResponse.json(
          { error: "Failed to refresh authentication. Please reconnect your Google Analytics account." },
          { status: 401 }
        );
      }
    } else {
      console.log(`✅ Token valid for ${Math.floor(timeUntilExpiry / 60)} more minutes, skipping refresh`);
    }

    // ========================================
    // PARALLEL API CALLS - All 19 GA4 requests execute simultaneously
    // ========================================
    
    // Helper function to create GA4 API requests
    const makeGARequest = (metrics: any[], dimensions: any[], dateRange: { startDate: string; endDate: string }, options: any = {}) => {
      return fetch(
        `${GA_DATA_API}/properties/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [dateRange],
            metrics,
            dimensions,
            ...options,
          }),
        }
      );
    };

    // Helper to add dateHour dimension for 1-day range
    const addDateHour = (baseDims: any[]) => 
      rangeParam === '1d' ? [...baseDims, { name: "dateHour" }] : baseDims;

    // Execute all 19 API calls in parallel
    const [
      metricsResponse,
      totalMetricsResponse,
      sourcesResponse,
      countriesResponse,
      citiesResponse,
      browsersResponse,
      osResponse,
      referrersResponse,
      socialResponse,
      mediumResponse,
      deviceResponse,
      regionsResponse,
      continentsResponse,
      languagesResponse,
      mobileDevicesResponse,
      screenResolutionResponse,
      pageTitlesResponse,
      channelGroupResponse,
      userActivityResponse,
    ] = await Promise.all([
      // 1. Time series metrics
      makeGARequest(
        [
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
        [timeDimension],
        { startDate, endDate }
      ),
      
      // 2. Total metrics (no dimensions)
      makeGARequest(
        [
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
        [],
        { startDate, endDate }
      ),
      
      // 3. Traffic sources
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "sessionSource" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 5,
        }
      ),
      
      // 4. Countries
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "country" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 5,
        }
      ),
      
      // 5. Cities
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "city" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 6. Browsers
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "browser" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 7. Operating Systems
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "operatingSystem" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 8. Referrers
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "sessionSource" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          dimensionFilter: {
            filter: {
              fieldName: "sessionMedium",
              stringFilter: {
                matchType: "EXACT",
                value: "referral",
              },
            },
          },
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 5,
        }
      ),
      
      // 9. Social networks
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "sessionSource" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
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
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 5,
        }
      ),
      
      // 10. Medium
      makeGARequest(
        [{ name: "activeUsers" }, { name: "sessions" }],
        addDateHour([{ name: "sessionMedium" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 11. Device category
      makeGARequest(
        [{ name: "activeUsers" }, { name: "sessions" }],
        addDateHour([{ name: "deviceCategory" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate }
      ),
      
      // 12. Regions
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "region" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 20,
        }
      ),
      
      // 13. Continents
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "continent" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        }
      ),
      
      // 14. Languages
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "language" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 15. Mobile device branding
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "mobileDeviceBranding" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 16. Screen resolution
      makeGARequest(
        [{ name: "activeUsers" }],
        addDateHour([{ name: "screenResolution" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 17. Page titles
      makeGARequest(
        [{ name: "screenPageViews" }],
        addDateHour([{ name: "pageTitle" }]),
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        }
      ),
      
      // 18. Channel group
      makeGARequest(
        [{ name: "sessions" }],
        rangeParam === '1d' 
          ? [{ name: "sessionDefaultChannelGroup" }, { name: "dateHour" }]
          : [{ name: "sessionDefaultChannelGroup" }],
        { startDate: breakdownStartDate, endDate: breakdownEndDate },
        {
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        }
      ),
      
      // 19. User activity
      makeGARequest(
        [{ name: "activeUsers" }, { name: "newUsers" }],
        [timeDimension],
        { startDate, endDate }
      ),
    ]);

    // Check if primary metrics request failed
    if (!metricsResponse.ok) {
      const errorData = await metricsResponse.json();
      console.error("GA API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch GA data", details: errorData },
        { status: 500 }
      );
    }

    // Parse all responses in parallel
    const [
      metricsData,
      totalMetricsData,
      sourcesData,
      countriesData,
      citiesData,
      browsersData,
      osData,
      referrersData,
      socialData,
      mediumData,
      deviceData,
      regionsData,
      continentsData,
      languagesData,
      mobileDevicesData,
      screenResolutionData,
      pageTitlesData,
      channelGroupData,
      userActivityData,
    ] = await Promise.all([
      metricsResponse.json(),
      totalMetricsResponse.ok ? totalMetricsResponse.json() : null,
      sourcesResponse.ok ? sourcesResponse.json() : null,
      countriesResponse.ok ? countriesResponse.json() : null,
      citiesResponse.ok ? citiesResponse.json() : null,
      browsersResponse.ok ? browsersResponse.json() : null,
      osResponse.ok ? osResponse.json() : null,
      referrersResponse.ok ? referrersResponse.json() : null,
      socialResponse.ok ? socialResponse.json() : null,
      mediumResponse.ok ? mediumResponse.json() : null,
      deviceResponse.ok ? deviceResponse.json() : null,
      regionsResponse.ok ? regionsResponse.json() : null,
      continentsResponse.ok ? continentsResponse.json() : null,
      languagesResponse.ok ? languagesResponse.json() : null,
      mobileDevicesResponse.ok ? mobileDevicesResponse.json() : null,
      screenResolutionResponse.ok ? screenResolutionResponse.json() : null,
      pageTitlesResponse.ok ? pageTitlesResponse.json() : null,
      channelGroupResponse.ok ? channelGroupResponse.json() : null,
      userActivityResponse.ok ? userActivityResponse.json() : null,
    ]);

    console.log('Channel Group data:', channelGroupData);

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
