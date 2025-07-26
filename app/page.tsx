"use client";

import { SpiralLoading } from "@/components/spiral-loading";
import { Input } from "@/components/ui/input";
import { CornerDownLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState, useTransition } from "react";
import { generateBlock } from "./actions";
export const maxDuration = 60;

export default function Home() {
  const [pending, startTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<string[][]>(
    Array(16)
      .fill(null)
      .map(() => Array(16).fill("0"))
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input") as HTMLInputElement;
    const value = input?.value;
    if (!value) return;

    input.value = ""; // Clear input after submission

    startTransition(async () => {
      const response = await generateBlock(value);
      setAiResponse(response.matrix);
    });
  };

  return (
    <div className='min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-8'>
      <div className=' sm:max-w-xl flex flex-col items-center gap-6 sm:gap-8'>
        <div className='relative w-full'>
          <motion.div
            layout
            animate={{ opacity: 1 }}
            className='p-3 sm:p-4 bg-card rounded-lg'
          >
            <SpiralLoading
              isLoading={pending}
              targetData={!pending ? aiResponse : undefined}
              size={16}
              cellSize='w-4 h-4 sm:w-5 sm:h-5'
            />
          </motion.div>
        </div>

        <form
          onSubmit={handleSubmit}
          className='w-full flex justify-center px-8 sm:px-4'
        >
          <div className='relative w-full max-w-md'>
            <Input
              type='text'
              placeholder='⚡️ 🌀 ⭐️ ✨ 🎲 🎮 🎯 🎪'
              className='bg-[#F3F4F6] text-black border-none pr-12'
              disabled={pending}
            />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
              <CornerDownLeft
                className={`w-4 h-4 transition-colors ${
                  pending ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
