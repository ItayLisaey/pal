"use server";

import { svgToBinaryMatrix, validateSvgString } from "@/lib/svg-parser";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, generateText } from "ai";

export async function generateBlock(
  prompt: string,
  messages: CoreMessage[] = []
) {
  // Step 1: Generate SVG using AI with conversation history
  const svgResponse = await generateText({
    model: openai("o3-mini"),
    messages: [...messages, { role: "user", content: prompt }],
    system: `Your job is to create SVG only answers.

Your role is to respond to the user's prompt with a simple, black and white SVG image. You are having a conversation with the user, so you can reference and build upon previous images if relevant.

Guidelines:
- Output ONLY valid SVG code, nothing else
- SVG should be 300x300 viewBox (viewBox="0 0 300 300")
- Use ONLY black (#000000) and white (#ffffff) colors (white should always be the background and black should be the foreground)
- No gradients, no grays, pure black and white only
- Keep designs simple and iconic for 30x30 resolution
- Center the design when feasible
- Use basic SVG elements: rect, circle, ellipse, path, polygon, line
- Ensure the SVG is well-formed and complete
- Try to make recognizable icons/symbols related to the prompt
- Fill black areas with fill="#000000" or fill="black"
- White areas can be fill="#ffffff", fill="white", or left unfilled (transparent)
- Your output will be rendered at 30x30px, so make sure the design is not too small
- If the user mentions "previous", "last", "that", "it", etc., they might be referring to previous images in the conversation
- You can create variations, combinations, or evolutions of previous images when appropriate

Example format:
<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    {svg_code}
</svg>

Just respond with the SVG code, nothing else.`,
  });

  console.log("SVG Response:", svgResponse.text);

  // Step 2: Validate SVG
  const svgString = svgResponse.text.trim();
  if (!validateSvgString(svgString)) {
    console.error("Invalid SVG generated, using fallback");
    // Create a simple fallback SVG that matches the 300x300 format
    const fallbackSvg = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="white"/>
  <rect x="120" y="120" width="60" height="60" fill="black"/>
</svg>`;
    const matrix = await svgToBinaryMatrix(fallbackSvg, 30);
    return {
      matrix,
      text: prompt,
      svg: fallbackSvg,
    };
  }

  // Step 3: Convert SVG to binary matrix with 30x30 size
  const matrix = await svgToBinaryMatrix(svgString, 30);
  console.log("Converted Matrix size:", matrix.length, "x", matrix[0]?.length);

  return {
    matrix,
    text: prompt,
    svg: svgString,
  };
}
