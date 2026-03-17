// api route that proxies requests to the gemini ai api
// this keeps the api key on the server so it never reaches the browser

import { NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-2.0-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured on server" },
      { status: 500 }
    );
  }

  const { systemPrompt, userContent } = await req.json();

  if (!systemPrompt || !userContent) {
    return NextResponse.json(
      { error: "missing systemPrompt or userContent" },
      { status: 400 }
    );
  }

  const url = `${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userContent }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "rate limit exceeded, please wait a moment and try again" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "failed to generate response" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("gemini api error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
