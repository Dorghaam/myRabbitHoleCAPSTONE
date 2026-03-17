// utility functions for parsing ai responses
// ported from the original myRabbitHole app

export interface TermItem {
  name: string;
  description?: string;
  author?: string;
}

// parses a json array from the ai response text
// used for term generating prompts like extract, concepts, questions, etc
export function parseTermsFromResponse(response: string): TermItem[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("no json array found in response");
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      console.warn("parsed result is not an array");
      return [];
    }

    return parsed
      .filter((item) => item && typeof item === "object" && item.name)
      .map((item) => ({
        name: String(item.name).trim(),
        description: item.description
          ? String(item.description).trim()
          : undefined,
        author: item.author ? String(item.author).trim() : undefined,
      }));
  } catch (error) {
    console.error("failed to parse terms from response:", error);
    return [];
  }
}

// removes markdown formatting from text so it displays cleanly in nodes
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, "");
}
