import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

async function main(imagePath, prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is not set");
    process.exit(1);
  }

  if (!imagePath || !prompt) {
    console.error("Usage: node generate_image.js <image_path> <prompt>");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync(imagePath, buffer);
      console.log(`Image saved as ${imagePath}`);
    }
  }
}

const [,, imagePath, ...promptParts] = process.argv;
const prompt = promptParts.join(" ");

main(imagePath, prompt);