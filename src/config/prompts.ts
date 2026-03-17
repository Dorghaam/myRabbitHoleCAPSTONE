// all the prompt configs for each button in the sidebar
// each one tells gemini what kind of response to generate
// each one tells gemini what kind of response to generate

import { PromptType, PromptConfig } from "@/types";

export const PROMPT_CONFIG: PromptConfig[] = [
  {
    type: PromptType.WHAT,
    label: "What",
    description: "get a basic explanation of the concept",
    generatesTerms: false,
    systemPrompt: `Explain what the given topic is in a clear, comprehensive paragraph.
Provide a foundational understanding that someone unfamiliar with the topic could grasp.
Be informative but concise. Do not use bullet points or lists.
Maximum 150 words.`,
  },
  {
    type: PromptType.HOW,
    label: "How",
    description: "understand how it works or functions",
    generatesTerms: false,
    systemPrompt: `Explain how the given topic works, functions, or operates.
Describe the mechanisms, processes, or methods involved.
Write in clear, flowing prose without bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.WHO,
    label: "Who",
    description: "key people, figures, or entities involved",
    generatesTerms: false,
    systemPrompt: `Describe the key people, figures, or entities associated with the given topic.
Explain who they are and their significance to this topic.
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.ORIGIN,
    label: "Origin",
    description: "historical origin and development",
    generatesTerms: false,
    systemPrompt: `Explain the historical origin and development of the given topic.
When and where did it originate? How did it develop over time?
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.ELABORATE,
    label: "Elaborate",
    description: "deeper, more detailed explanation",
    generatesTerms: false,
    systemPrompt: `Provide a deeper, more detailed explanation of the given topic.
Expand on the nuances, complexities, and important details.
Write in flowing prose, no bullet points.
Maximum 200 words.`,
  },
  {
    type: PromptType.PROS,
    label: "Pros",
    description: "advantages and benefits",
    generatesTerms: false,
    systemPrompt: `Explain the advantages, benefits, and positive aspects of the given topic.
Write in flowing prose, integrating multiple advantages naturally.
Do not use bullet points or numbered lists.
Maximum 150 words.`,
  },
  {
    type: PromptType.CONS,
    label: "Cons",
    description: "disadvantages and drawbacks",
    generatesTerms: false,
    systemPrompt: `Explain the disadvantages, drawbacks, and negative aspects of the given topic.
Write in flowing prose, integrating multiple disadvantages naturally.
Do not use bullet points or numbered lists.
Maximum 150 words.`,
  },
  {
    type: PromptType.EXAMPLE,
    label: "Example",
    description: "concrete examples and cases",
    generatesTerms: false,
    systemPrompt: `Provide concrete examples or cases related to the given topic.
Use specific, real world examples to illustrate the concept.
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.RESEARCH,
    label: "Research",
    description: "academic and scientific findings",
    generatesTerms: false,
    systemPrompt: `Describe relevant academic research, scientific findings, or scholarly perspectives on the given topic.
Reference general research trends without citing specific papers.
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.EXTRACT,
    label: "Extract",
    description: "extract key terms and vocabulary",
    generatesTerms: true,
    systemPrompt: `Extract the key terms, vocabulary, and important words related to the given topic.
Return ONLY a valid JSON array with 4 to 8 items in this exact format:
[
  {"name": "Term", "description": "Brief 5 to 10 word definition"},
  ...
]
No other text, just the JSON array.`,
  },
  {
    type: PromptType.CONCEPTS,
    label: "Concepts",
    description: "related concepts and ideas",
    generatesTerms: true,
    systemPrompt: `Identify concepts and ideas closely related to the given topic.
Return ONLY a valid JSON array with 4 to 6 items in this exact format:
[
  {"name": "Concept Name", "description": "Brief 5 to 10 word description"},
  ...
]
No other text, just the JSON array.`,
  },
  {
    type: PromptType.COMPARE,
    label: "Compare",
    description: "compare two selected nodes",
    generatesTerms: false,
    systemPrompt: `Compare the two given topics.
Highlight their key similarities and differences.
Write in flowing prose, no bullet points.
Maximum 200 words.`,
  },
  {
    type: PromptType.ANALOGY,
    label: "Analogy",
    description: "analogies to explain the concept",
    generatesTerms: false,
    systemPrompt: `Create helpful analogies to explain the given topic.
Use familiar concepts to make the topic easier to understand.
Write in flowing prose, no bullet points.
Maximum 120 words.`,
  },
  {
    type: PromptType.CONTROVERSY,
    label: "Controversy",
    description: "debates and controversies",
    generatesTerms: false,
    systemPrompt: `Describe any debates, controversies, or differing viewpoints surrounding the given topic.
Present multiple perspectives fairly.
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.IMPLICATIONS,
    label: "Implications",
    description: "consequences and implications",
    generatesTerms: false,
    systemPrompt: `Explain the implications, consequences, and potential impacts of the given topic.
Consider both immediate and long term effects.
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.SIGNIFICANCE,
    label: "Significance",
    description: "why it matters",
    generatesTerms: false,
    systemPrompt: `Explain why the given topic is significant and why it matters.
What is its importance in the broader context?
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.INTERESTING,
    label: "Interesting",
    description: "interesting facts and trivia",
    generatesTerms: false,
    systemPrompt: `Share interesting, surprising, or lesser known facts about the given topic.
Focus on engaging and memorable information.
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
  {
    type: PromptType.EXPLAIN,
    label: "Explain",
    description: "simple explanation",
    generatesTerms: false,
    systemPrompt: `Explain the given topic in very simple terms, as if explaining to a beginner.
Use plain language and avoid jargon.
Write in flowing prose, no bullet points.
Maximum 120 words.`,
  },
  {
    type: PromptType.QUESTIONS,
    label: "Questions",
    description: "thought provoking questions",
    generatesTerms: true,
    systemPrompt: `Generate thought provoking questions about the given topic that encourage deeper exploration.
Return ONLY a valid JSON array with 4 to 6 items in this exact format:
[
  {"name": "Question text here?", "description": "Why this question matters in 5 to 10 words"},
  ...
]
No other text, just the JSON array.`,
  },
  {
    type: PromptType.FIGURES,
    label: "Key Figures",
    description: "key people and innovators",
    generatesTerms: true,
    systemPrompt: `Identify the most important people, inventors, innovators, or key figures associated with the given topic.
Return ONLY a valid JSON array with 4 to 6 items in this exact format:
[
  {"name": "Person Name", "description": "Their key contribution in 5 to 10 words"},
  ...
]
No other text, just the JSON array.`,
  },
  {
    type: PromptType.BOOKS,
    label: "Books",
    description: "book recommendations",
    generatesTerms: true,
    systemPrompt: `Recommend books related to the given topic.
Return ONLY a valid JSON array with 4 to 6 items in this exact format:
[
  {"name": "Book Title", "author": "Author Name", "description": "Why this book is relevant in 10 to 15 words"},
  ...
]
No other text, just the JSON array.`,
  },
  {
    type: PromptType.CUSTOM,
    label: "Custom Prompt",
    description: "ask your own question",
    generatesTerms: false,
    systemPrompt: `Answer the user's custom question about the given topic.
Be helpful and informative.
Write in flowing prose, no bullet points.
Maximum 150 words.`,
  },
];

export const getPromptConfig = (
  type: PromptType
): PromptConfig | undefined => {
  return PROMPT_CONFIG.find((p) => p.type === type);
};
