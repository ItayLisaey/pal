"use client";

import { GridDisplay } from "@/components/grid-display";
import { SpiralLoading } from "@/components/spiral-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2Icon, SendIcon } from "lucide-react";
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
    startTransition(async () => {
      const value = e.currentTarget.querySelector("input")?.value;
      if (!value) return;
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
            {pending ? (
              <SpiralLoading
                isLoading={pending}
                size={16}
                cellSize='w-4 h-4 sm:w-5 sm:h-5'
              />
            ) : (
              <GridDisplay data={aiResponse} cellSize='w-4 h-4 sm:w-5 sm:h-5' />
            )}
          </motion.div>
        </div>

        <form
          onSubmit={handleSubmit}
          className='w-full flex flex-col items-center gap-3 sm:gap-4 px-8 sm:px-4'
        >
          <Input
            type='text'
            placeholder='⚡️ 🌀 ⭐️ ✨ 🎲 🎮 🎯 🎪'
            className='bg-[#F3F4F6] text-black border-none'
            // className='w-full'
          />
          <Button
            type='submit'
            disabled={pending}
            className='w-full sm:w-auto bg-[#1b1b1b] text-white'
          >
            {pending ? (
              <Loader2Icon className='w-4 h-4 animate-spin' />
            ) : (
              <SendIcon className='w-4 h-4' />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
