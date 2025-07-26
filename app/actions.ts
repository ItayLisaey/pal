"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

function asciiToGrid(ascii: string): string[][] {
  // Split into lines and ensure we have exactly 16 lines
  const lines = ascii.split("\n").slice(0, 16);

  // Pad with empty lines if needed
  while (lines.length < 16) {
    lines.push("XXXXXXXXXXXXXXXX"); // 16 X's (background)
  }

  // Convert each line to 16 characters
  const grid: string[][] = lines.map((line) => {
    // Pad or truncate to exactly 16 characters
    const paddedLine = (line + "XXXXXXXXXXXXXXXX").substring(0, 16);

    // Convert characters to 1 or 0
    return paddedLine.split("").map((char) => {
      // '#' = filled (1), 'X' = empty (0)
      return char === "#" ? "1" : "0";
    });
  });

  return grid;
}

export async function generateBlock(prompt: string) {
  // Step 1: Generate ASCII art using only # and X
  const asciiResponse = await generateText({
    model: openai("o3-mini"),
    prompt: prompt,
    system: `Your role is to respond to the user's prompt with a 16x16 ASCII art image.

Guidelines:
- Use ONLY '#' and 'X' characters
- '#' signifies filled/solid areas
- 'X' signifies empty/background areas
- Ensure the image is exactly 16 lines, each with 16 characters
- Strive for simplicity, iconicity, and recognizability
- Center the design when feasible
- Communicate abstractly through images, not just words
- Utilize the grid's resolution for enhanced detail
- Try not to use "faces" in your designs

Simple Examples that demonstrate the rules:
Heart:
XXXXXXXXXXXXXXXX
XXX##XXXX##XXXXX
XX####XX####XXXX
X##############X
X##############X
XX############XX
XXX##########XXX
XXXX########XXXX
XXXXX######XXXXX
XXXXXX####XXXXXX
XXXXXXX##XXXXXXX
XXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXX

Star:
XXXXXXX##XXXXXXX
XXXXXX####XXXXXX
XXXXX######XXXXX
XXXX########XXXX
XXX##########XXX
XX############XX
X##############X
################
X##############X
XX############XX
XXX##########XXX
XXXX########XXXX
XXXXX######XXXXX
XXXXXX####XXXXXX
XXXXXXX##XXXXXXX
XXXXXXXXXXXXXXXX

Just respond with the 16x16 ASCII art, nothing else.`,
  });

  console.log("ASCII Response:", asciiResponse.text);

  // Step 2: Convert ASCII to binary grid
  const matrix = asciiToGrid(asciiResponse.text);
  console.log("Converted Matrix:", matrix);

  return {
    matrix,
    text: prompt,
    ascii: asciiResponse.text,
  };
}
