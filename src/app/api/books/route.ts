// api route that searches google books and returns book info with covers
// uses the free google books api so no api key is needed

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
    // search google books for the topic
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=4&printType=books`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ books: [] });
    }

    // pull out just the fields we need for each book
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const books = data.items.map((item: any) => {
      const info = item.volumeInfo;

      // google books sometimes returns http urls so we swap to https
      let coverUrl = info.imageLinks?.thumbnail || null;
      if (coverUrl && coverUrl.startsWith("http://")) {
        coverUrl = coverUrl.replace("http://", "https://");
      }

      return {
        title: info.title || "Unknown Title",
        author: info.authors ? info.authors.join(", ") : "Unknown Author",
        coverUrl,
        description: info.description
          ? info.description.replace(/<[^>]*>/g, "").slice(0, 200)
          : "No description available",
      };
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error("google books api error:", error);
    return NextResponse.json(
      { error: "failed to search books" },
      { status: 500 }
    );
  }
}
