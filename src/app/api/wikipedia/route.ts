// api route that searches wikipedia and returns an article summary
// uses the free wikipedia api so no api key is needed

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json(
      { error: "missing search query" },
      { status: 400 }
    );
  }

  try {
    // search wikipedia for the best matching article title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const results = searchData?.query?.search;
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "no wikipedia article found" },
        { status: 404 }
      );
    }

    // use the best match title to get a clean summary
    const pageTitle = results[0].title;
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    return NextResponse.json({
      title: summaryData.title,
      extract: summaryData.extract || "no summary available",
      pageUrl:
        summaryData.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
    });
  } catch (error) {
    console.error("wikipedia api error:", error);
    return NextResponse.json(
      { error: "failed to search wikipedia" },
      { status: 500 }
    );
  }
}
