// api route that searches wikipedia and returns an article summary
// uses the mediawiki api for both search and extract so its more reliable

import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://en.wikipedia.org/w/api.php";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json(
      { error: "missing search query" },
      { status: 400 }
    );
  }

  try {
    // step 1: search wikipedia for the best matching article title
    const searchParams = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      srlimit: "1",
      format: "json",
    });

    const searchRes = await fetch(`${BASE_URL}?${searchParams}`, {
      headers: { "User-Agent": "myRabbitHole/1.0 (student capstone project)" },
    });
    const searchText = await searchRes.text();
    let searchData;
    try {
      searchData = JSON.parse(searchText);
    } catch {
      return NextResponse.json(
        { error: "wikipedia returned invalid data" },
        { status: 502 }
      );
    }

    const results = searchData?.query?.search;
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: "no wikipedia article found" },
        { status: 404 }
      );
    }

    const pageTitle = results[0].title;

    // step 2: get the article intro text and full url using the same api
    const extractParams = new URLSearchParams({
      action: "query",
      titles: pageTitle,
      prop: "extracts|info",
      exintro: "true",
      explaintext: "true",
      inprop: "url",
      format: "json",
    });

    const extractRes = await fetch(`${BASE_URL}?${extractParams}`, {
      headers: { "User-Agent": "myRabbitHole/1.0 (student capstone project)" },
    });
    const extractText = await extractRes.text();
    let extractData;
    try {
      extractData = JSON.parse(extractText);
    } catch {
      return NextResponse.json(
        { error: "wikipedia returned invalid data" },
        { status: 502 }
      );
    }

    // the pages object is keyed by page id, so we grab the first one
    const pages = extractData?.query?.pages;
    if (!pages) {
      return NextResponse.json(
        { error: "wikipedia article not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = Object.values(pages)[0] as any;

    return NextResponse.json({
      title: page.title || pageTitle,
      extract: page.extract || "no summary available",
      pageUrl:
        page.fullurl ||
        `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g, "_")}`,
    });
  } catch (error) {
    console.error("wikipedia api error:", error);
    return NextResponse.json(
      { error: "failed to search wikipedia" },
      { status: 500 }
    );
  }
}
