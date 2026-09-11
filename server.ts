import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini initialization with telemetry header
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Health
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// 1. Natural language scenario parser
app.post("/api/gemini/parse-scenario", async (req, res) => {
  try {
    const { prompt, language = "en" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        source: "fallback",
        message: "Offline or Gemini API Key not configured; using high-fidelity parser fallback.",
      });
    }

    const systemInstruction = `You are RealityForge AI Scenario Extraction Engine.
Analyze the user's real-world problem or simulation request.
Extract entities, numeric variables with baseline/min/max, constraints, objectives, time horizon (start 2026, end 2050), causal dependencies, and major risks.
Support both English and Tamil inputs. Provide labels in English and Tamil (titleTa, descriptionTa, etc.) if possible.
Return strictly valid JSON.`;

    const extractionPrompt = `User prompt: "${prompt}"
Language: ${language}

Generate a structured JSON simulation scenario with:
- "title": string
- "titleTa": string (Tamil translation)
- "description": string
- "descriptionTa": string (Tamil translation)
- "category": one of ["Urban & Transport", "Corporate & Automation", "Energy & Climate", "Healthcare & Bio", "Macro Economy", "Custom"]
- "timeHorizon": { "startYear": 2026, "endYear": 2050 }
- "entities": array of { "id": string, "name": string, "nameTa": string, "category": string, "description": string }
- "variables": array of 4 to 8 variables with:
  {
    "id": string,
    "entityId": string,
    "name": string,
    "nameTa": string,
    "value": number,
    "baselineValue": number,
    "unit": string,
    "min": number,
    "max": number,
    "step": number,
    "category": string,
    "description": string
  }
- "constraints": array of string
- "objectives": array of string
- "dependencies": array of { "source": string (var id), "target": string (var id), "strength": number (-1 to 1), "description": string }
- "risks": array of { "name": string, "severity": "low"|"medium"|"high"|"critical", "trigger": string }
- "assumptions": array of string`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: extractionPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      return res.json({ source: "gemini", scenario: parsed });
    } catch {
      return res.json({ source: "fallback", raw: text });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Scenario parsing error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to parse scenario" });
  }
});

// 2. AI Decision Copilot
app.post("/api/gemini/copilot", async (req, res) => {
  try {
    const { question, simulationContext, language = "en" } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        source: "fallback",
        message: "Offline or Gemini API Key not configured; using fallback copilot.",
      });
    }

    const systemInstruction = `You are the RealityForge AI Mission Control Decision Copilot.
You are embedded directly inside an active future simulation model.
Your role: Provide incisive, mathematically grounded, and causal explanations of the user's simulation.
Reference specific variable names, percentage changes, risk metrics, and time horizons (2026-2050).
Never speak generically like a chatbot. Always cite the active variables and forecast deviations.
If language is "ta", answer in Tamil (with key technical terms in English/Tamil for clarity), otherwise in English.
Avoid false scientific certainty; label assumptions clearly.`;

    const prompt = `Active Scenario Context:
Title: ${simulationContext?.title || "Active Scenario"}
Current Year Scrubber: ${simulationContext?.currentYear || 2035}
Key Variables: ${JSON.stringify(simulationContext?.variables || [])}
Forecast Trends & Stress: ${JSON.stringify(simulationContext?.metrics || {})}
Current Strategies Tested: ${JSON.stringify(simulationContext?.strategies || [])}

User Question: "${question}"
Language requested: ${language}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    return res.json({
      source: "gemini",
      answer: response.text || "No response generated.",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Copilot error:", err.message);
    return res.status(500).json({ error: err.message || "Copilot error" });
  }
});

// 3. AI Explanation for Specific Prediction / Metric
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { metricName, metricValue, baselineValue, year, contributingFactors, language = "en" } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.json({ source: "fallback" });
    }

    const prompt = `Metric: "${metricName}"
Forecast Value at Year ${year}: ${metricValue} (Baseline: ${baselineValue})
Top Contributing Factors & Elasticities: ${JSON.stringify(contributingFactors || [])}
Language: ${language}

Provide an explainable AI causal breakdown:
1. Why this changed (root cause & primary vector)
2. Main contributing variables and their elasticities
3. Key feedback loops or system stresses
4. Level of uncertainty & confidence bounds
5. Counter-action / alternative mitigation`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Simulation Explanation Specialist. Provide clear, structured, transparent causal reasoning.",
        temperature: 0.3,
      },
    });

    return res.json({ source: "gemini", explanation: response.text });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message || "Failed to explain" });
  }
});

// 4. Strategy Battle AI Verdict
app.post("/api/gemini/strategy-battle", async (req, res) => {
  try {
    const { scenarioTitle, strategyA, strategyB, simulationDeltas, language = "en" } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.json({ source: "fallback" });
    }

    const prompt = `Scenario: "${scenarioTitle}"
Strategy A: "${strategyA?.name}" — ${strategyA?.description}
Strategy B: "${strategyB?.name}" — ${strategyB?.description}
Comparative Simulated Metrics (2026-2050):
${JSON.stringify(simulationDeltas || {})}

Language: ${language}

Provide an explainable AI verdict. Rather than simply declaring a winner, provide:
1. Synthesis of Strategy A strengths & vulnerabilities
2. Synthesis of Strategy B strengths & vulnerabilities
3. Trade-off Matrix (Cost vs Speed vs Long-term Sustainability vs System Stress)
4. Strategic Verdict & Hybrid Recommendation`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a Chief Decision Intelligence Strategist at RealityForge AI. Give transparent, balanced, high-level analysis.",
        temperature: 0.3,
      },
    });

    return res.json({ source: "gemini", verdict: response.text });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message || "Failed to evaluate strategies" });
  }
});

// Mount Vite middleware for dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`REALITYFORGE AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
