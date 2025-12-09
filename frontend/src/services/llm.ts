import { CreateMLCEngine } from "@mlc-ai/web-llm";

let engine: any = null;

export async function initLLM() {
  if (engine) return engine;

  engine = await CreateMLCEngine("Llama-3.1-4B-Instruct-q4f16_1", {
    initProgressCallback: (progress) => {
      console.log("Chargement modèle LLM :", progress);
    },
  });

  return engine;
}

export async function askLLM(prompt: string) {
  const eng = await initLLM();
  const response = await eng.chat.completions.create({
    messages: [
      { role: "system", content: "Tu associes un texte libre à l'activité la plus proche." },
      { role: "user", content: prompt },
    ],
    stream: false,
  });

  return response.choices[0].message.content;
}
