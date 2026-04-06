// api route that fetches a book cover image url from open library
// uses the free open library api so no api key is needed

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  if (!title) {
    return NextResponse.json(
      { error: "missing book title" },
      { status: 400 }
    );
  }

  try {
    // search open library for the book by title and optional author
    const author = req.nextUrl.searchParams.get("author");
    const params = new URLSearchParams({
      title,
      fields: "cover_i",
      limit: "1",
    });
    if (author) params.set("author", author);

    const res = await fetch(
      `https://openlibrary.org/search.json?${params}`,
      { headers: { "User-Agent": "myRabbitHole/1.0 (student capstone project)" } }
    );

    if (!res.ok) {
      return NextResponse.json({ coverUrl: null });
    }

    const data = await res.json();
    const coverId = data.docs?.[0]?.cover_i;

    if (!coverId) {
      return NextResponse.json({ coverUrl: null });
    }

    // open library serves cover images at this url pattern
    return NextResponse.json({
      coverUrl: `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`,
    });
  } catch (error) {
    console.error("open library api error:", error);
    return NextResponse.json({ coverUrl: null });
  }
}
