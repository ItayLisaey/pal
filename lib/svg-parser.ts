import sharp from "sharp";

export async function svgToBinaryMatrix(
  svgString: string,
  size: number = 30,
  thresh: number = 128
): Promise<number[][]> {
  try {
    console.log(
      `Converting SVG to ${size}x${size} matrix with threshold ${thresh}`
    );

    // Rasterize the SVG with proper transparency handling
    const raw = await sharp(Buffer.from(svgString))
      .resize(size, size, {
        kernel: sharp.kernel.cubic,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten transparency to white
      .grayscale()
      .threshold(thresh)
      .raw()
      .toBuffer();

    // Build 2D array of 0/1
    const matrix: number[][] = [];
    for (let y = 0; y < size; y++) {
      const row: number[] = [];
      for (let x = 0; x < size; x++) {
        const pixelValue = raw[y * size + x];
        row.push(pixelValue === 0 ? 1 : 0); // 1 for black, 0 for white
      }
      matrix.push(row);
    }

    // Basic logging
    const totalPixels = size * size;
    const blackPixels = matrix.flat().filter((pixel) => pixel === 1).length;
    const blackPercentage = (blackPixels / totalPixels) * 100;
    console.log(
      `Generated matrix: ${matrix.length}x${
        matrix[0]?.length
      }, Black: ${blackPixels} (${blackPercentage.toFixed(1)}%)`
    );

    return matrix;
  } catch (error) {
    console.error("Error in svgToBinaryMatrix:", error);
    throw error;
  }
}

export function validateSvgString(svgString: string): boolean {
  try {
    const trimmed = svgString.trim();
    const isValid =
      trimmed.startsWith("<svg") &&
      trimmed.endsWith("</svg>") &&
      trimmed.includes("xmlns") &&
      trimmed.length > 0;

    console.log(`SVG validation result: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error("SVG validation error:", error);
    return false;
  }
}
