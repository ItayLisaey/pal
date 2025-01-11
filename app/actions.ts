"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export async function generateBlock(prompt: string) {
  const response = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
  });
  console.log("text", response.text);

  const animatedResponse = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: response.text,
    system:
      "You are a animator, given a text, describe a 3 step abstract animation that represents the text. should be something that is sutible to be drawn by 100x100 grid of pixels",
  });
  console.log("animatedResponse", animatedResponse.text);

  const blockedResponse = await generateObject({
    model: openai("gpt-4o-mini"),
    prompt: animatedResponse.text,
    system: `Given a description of an animation, return 3 frames of a 10x10 matrix using 1 and 0. Each frame should represent one step of the described animation, with 1 representing filled pixels and 0 representing empty pixels. Make the animation smooth and visually clear. Animation should be as symetric as possible, starting for the middle of the frame and moving outwards.
      

  
      
      `,
    schema: z.object({
      frame1: z.array(z.array(z.enum(["1", "0"]))),
      frame2: z.array(z.array(z.enum(["1", "0"]))),
      frame3: z.array(z.array(z.enum(["1", "0"]))),
    }),
    maxRetries: 3,
  });
  console.log("blockedResponse", blockedResponse.object);

  console.log(blockedResponse.object);
  return {
    matrix: blockedResponse.object,
    text: response.text,
  };
}
