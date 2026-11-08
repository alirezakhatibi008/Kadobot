
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TAVILY_API_KEY;
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!apiKey || !query) {
    return NextResponse.json({
      success: false,
      error: !apiKey ? "TAVILY_API_KEY_MISSING" : "QUERY_REQUIRED",
    });
  }

  const queries = [
    `خرید ${query} سایت:digikala.com`,
    `${query} site:digikala.com/product/dkp-`,
  ];

  try {
    const results = await Promise.all(
      queries.map(async (searchQuery) => {
        const response = await fetch(
          "https://api.tavily.com/search",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: searchQuery,
              search_depth: "advanced",
              max_results: 10,
              include_domains: ["digikala.com"],
            }),
            cache: "no-store",
          }
        );

        const data = await response.json();

        return {
          searchQuery,
          status: response.status,
          results: (data.results || []).map((item: any) => ({
            title: item.title,
            url: item.url,
            score: item.score,
          })),
          error: response.ok ? null : data,
        };
      })
    );

    return NextResponse.json({
      success: true,
      query,
      tests: results,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
