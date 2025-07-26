import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface GridDisplayProps {
  data: number[][];
  cellSize?: string;
}

export function GridDisplay({
  data,
  cellSize = "w-2 h-2 sm:w-3 sm:h-3",
}: GridDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className='flex flex-col gap-0.5 sm:gap-1'
    >
      {data.map((row, rowIndex) => (
        <div key={rowIndex} className='flex gap-0.5 sm:gap-1'>
          {row.map((cell, cellIndex) => (
            <motion.div
              key={`${rowIndex}-${cellIndex}`}
              initial={{ scale: 0, backgroundColor: "#F3F4F6" }}
              animate={{
                scale: 1,
                backgroundColor: cell === 1 ? "#1b1b1b" : "#F3F4F6",
              }}
              transition={{
                duration: 0.3,
                delay: (rowIndex * row.length + cellIndex) * 0.005, // Reduced delay for more cells
                ease: "easeOut",
              }}
              className={cn(
                cellSize,
                "rounded-sm",
                cell === 1 ? "bg-[#1b1b1b]" : "bg-[#F3F4F6]"
              )}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
}
