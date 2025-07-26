import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface SpiralLoadingProps {
  isLoading: boolean;
  onComplete?: () => void;
  size?: number;
  cellSize?: string;
  targetData?: string[][];
}

function generateSpiralOrder(size: number): number[][] {
  // Create a distance-based spiral from center
  const center = (size - 1) / 2;
  const positions: Array<{
    row: number;
    col: number;
    distance: number;
    angle: number;
  }> = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const dx = col - center;
      const dy = row - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      positions.push({ row, col, distance, angle });
    }
  }

  // Sort by distance first, then by angle for spiral effect
  positions.sort((a, b) => {
    if (Math.abs(a.distance - b.distance) < 0.1) {
      // If distances are very close, sort by angle for spiral
      return a.angle - b.angle;
    }
    return a.distance - b.distance;
  });

  return positions.map((pos) => [pos.row, pos.col]);
}

export function SpiralLoading({
  isLoading,
  onComplete,
  size = 16,
  cellSize = "w-4 h-4 sm:w-5 sm:h-5",
  targetData,
}: SpiralLoadingProps) {
  const [spiralOrder] = useState(() => generateSpiralOrder(size));
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isClosing, setIsClosing] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Reset states when loading starts
      setIsClosing(false);
      setIsMorphing(false);
      setShowFinalResult(false);
      setActiveIndex(-1);

      // Start the spiral animation
      const timer = setTimeout(() => {
        let index = 0;
        const interval = setInterval(() => {
          setActiveIndex(index);
          index++;
          if (index >= spiralOrder.length) {
            clearInterval(interval);
            // Keep all cells active while loading continues
          }
        }, 50); // 50ms delay between each cell

        return () => clearInterval(interval);
      }, 100);

      return () => clearTimeout(timer);
    } else if (targetData && !showFinalResult) {
      // Morphing transition - spiral is complete, now morph to result
      setIsMorphing(true);
      setActiveIndex(spiralOrder.length - 1); // All cells active

      const timer = setTimeout(() => {
        setIsMorphing(false);
        setShowFinalResult(true);
        onComplete?.();
      }, 1500); // Give time for morphing animation

      return () => clearTimeout(timer);
    }
  }, [isLoading, spiralOrder.length, onComplete, targetData, showFinalResult]);

  const getCellDelay = (rowIndex: number, cellIndex: number): number => {
    if (isMorphing) {
      // Top-to-bottom stagger for morphing
      return rowIndex * 80 + cellIndex * 5; // Row delay + slight column offset
    }

    const cellOrder = spiralOrder.findIndex(
      ([r, c]) => r === rowIndex && c === cellIndex
    );
    if (isClosing) {
      // Reverse order for closing, much faster
      return (spiralOrder.length - cellOrder) * 20;
    }
    return cellOrder * 50;
  };

  const isCellActive = (rowIndex: number, cellIndex: number): boolean => {
    const cellOrder = spiralOrder.findIndex(
      ([r, c]) => r === rowIndex && c === cellIndex
    );
    return cellOrder <= activeIndex;
  };

  return (
    <div className='flex flex-col gap-0.5 sm:gap-1'>
      {Array(size)
        .fill(null)
        .map((_, rowIndex) => (
          <div key={rowIndex} className='flex gap-0.5 sm:gap-1'>
            {Array(size)
              .fill(null)
              .map((_, cellIndex) => {
                const isActive = isCellActive(rowIndex, cellIndex);
                const delay = getCellDelay(rowIndex, cellIndex);

                return (
                  <motion.div
                    key={`${rowIndex}-${cellIndex}`}
                    initial={{
                      scale: 0.3,
                      backgroundColor: "#F3F4F6",
                      boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
                    }}
                    animate={
                      showFinalResult && targetData
                        ? {
                            scale: 1,
                            backgroundColor:
                              targetData[rowIndex]?.[cellIndex] === "1"
                                ? "#1b1b1b"
                                : "#F3F4F6",
                            boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
                          }
                        : isLoading
                        ? {
                            scale: isActive ? [0.3, 1.1, 1] : 0.3,
                            backgroundColor: isActive
                              ? ["#F3F4F6", "#3B82F6", "#2563EB"]
                              : "#F3F4F6",
                            boxShadow: isActive
                              ? [
                                  "0 0 0px rgba(59, 130, 246, 0)",
                                  "0 0 8px rgba(59, 130, 246, 0.6)",
                                  "0 0 4px rgba(59, 130, 246, 0.3)",
                                ]
                              : "0 0 0px rgba(59, 130, 246, 0)",
                          }
                        : isMorphing && targetData
                        ? {
                            scale: 1,
                            backgroundColor:
                              targetData[rowIndex]?.[cellIndex] === "1"
                                ? ["#2563EB", "#1b1b1b"]
                                : ["#2563EB", "#F3F4F6"],
                            boxShadow: [
                              "0 0 4px rgba(59, 130, 246, 0.3)",
                              "0 0 0px rgba(59, 130, 246, 0)",
                            ],
                          }
                        : {
                            scale: 0.3,
                            backgroundColor: "#F3F4F6",
                            boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
                          }
                    }
                    transition={{
                      duration: isMorphing ? 0.4 : isClosing ? 0.3 : 0.6,
                      delay:
                        isMorphing || isLoading || isClosing ? delay / 1000 : 0,
                      ease: isMorphing ? "easeOut" : "easeInOut",
                      repeat: isLoading && isActive ? Infinity : 0,
                      repeatType: "reverse",
                      repeatDelay: 0.5,
                    }}
                    className={`${cellSize} rounded-sm`}
                  />
                );
              })}
          </div>
        ))}
    </div>
  );
}
