
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      step: "API_KEY",
      error: "TAVILY_API_KEY_NOT_FOUND",
    });
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "birthday gift online stores Iran",
        search_depth: "basic",
        max_results: 10,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result: response.ok ? data.results : data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      step: "NETWORK",
      error: error instanceof Error ? error.message : String(error),
      cause:
        error instanceof Error && error.cause
          ? String(error.cause)
          : null,
    });
  }
}
