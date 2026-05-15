import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY is not configured or is placeholder. Using mock AI recommendations generator.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// API endpoint for generating personalized learning paths using Gemini
app.post("/api/personalized-path", async (req, res) => {
  try {
    const { studentName, section, className, currentGrade, strengths, weaknesses, preferences } = req.body;
    
    const client = getGeminiClient();
    
    if (client) {
      const prompt = `
You are an expert academic counselor and AI personal tutor at Poplar School, which has Nursery, Primary, and Secondary sections.
Generate a high-fidelity, highly personalized 4-month academic learning path for the following student:
- Name: ${studentName || 'Student'}
- Section: ${section || 'Primary'}
- Class / Grade Level: ${className || 'Grade 3'}
- Current Grade/Performance: ${currentGrade || 'Average'}
- Strengths: ${strengths || 'Creative tasks, spelling'}
- Weaknesses: ${weaknesses || 'Math word problems, attention span'}
- Learning Preferences: ${preferences || 'Visual aids, interactive stories'}

Return a strictly valid JSON response. The JSON structure must match this scheme precisely:
{
  "studentName": "${studentName || 'Student'}",
  "academicGoal": "A short, inspiring goal statement based on their strengths and weaknesses.",
  "weeklyMilestones": [
    {
      "week": "Month 1, Week 1-2",
      "focus": "Topic or theme focus",
      "activity": "Personalized description of a hands-on activity suitable for their level",
      "type": "math" or "languages" or "science" or "humanities" or "creative"
    },
    {
      "week": "Month 1, Week 3-4",
      "focus": "Topic or theme focus",
      "activity": "Personalized activity content",
      "type": "math" or "languages" or "science" or "humanities" or "creative"
    },
    {
      "week": "Month 2, Week 1-2",
      "focus": "Topic or theme focus",
      "activity": "Personalized activity content",
      "type": "math" or "languages" or "science" or "humanities" or "creative"
    },
    {
      "week": "Month 2, Week 3-4",
      "focus": "Topic or theme focus",
      "activity": "Another tailored milestone",
      "type": "math" or "languages" or "science" or "humanities" or "creative"
    },
    {
      "week": "Month 3",
      "focus": "Consolidation & Application",
      "activity": "Actionable challenge or project description",
      "type": "math" or "languages" or "science" or "humanities" or "creative"
    },
    {
      "week": "Month 4",
      "focus": "Final Achievement Showcase",
      "activity": "A summary celebration milestone",
      "type": "math" or "languages" or "science" or "humanities" or "creative"
    }
  ],
  "personalizedTips": [
    "Specific tip 1 based on their weakness",
    "Specific tip 2 based on their preference",
    "Specific tip 3 to boost motivation"
  ]
}
Return only the json data inside direct enclosing curly braces. Do not wrap in markdown \`\`\`json blocks.
`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text ? response.text.trim() : "";
      const pathData = JSON.parse(responseText || "{}");
      return res.json(pathData);
    } else {
      // Fallback: Elegant, high-fidelity mock AI responses customized dynamically
      const fallbackGoal = weaknesses.toLowerCase().includes("math") 
        ? `To transform math word problems into visual stories, building logic confidence to achieve an A-grade within 4 months.`
        : `To amplify ${strengths} while incrementally constructing advanced strategies for mastering ${weaknesses}.`;

      const fallbackMilestones = [
        {
          week: "Month 1, Week 1-2",
          focus: `Concept Foundation (${weaknesses.split(',')[0]} Focus)`,
          activity: `Engage with personalized interactive visual tutorials and schema diagrams. Spend 15 mins daily using drawing methods.`,
          type: "math"
        },
        {
          week: "Month 1, Week 3-4",
          focus: `Applying Visual Mastery`,
          activity: `Solve hands-on practice puzzles matching real world scenarios, applying the learner's preference for ${preferences}.`,
          type: "languages"
        },
        {
          week: "Month 2, Week 1-2",
          focus: `Critical Connections`,
          activity: `Identify key trigger points in topics. Create color-coded subject maps of ${weaknesses} principles to reinforce retention.`,
          type: "creative"
        },
        {
          week: "Month 2, Week 3-4",
          focus: `Independent Application`,
          activity: `Complete standard homework tasks using memory aid cards. Section Manager Elena Vance or class teacher can conduct live verbal check-ins.`,
          type: "science"
        },
        {
          week: "Month 3, Weeks 1-4",
          focus: `Confidence Accelerator & Collaboration`,
          activity: `Solve peer-group challenge questions. Participate in targeted 1-on-1 feedback reviews with Poplar's digital learning assistant.`,
          type: "math"
        },
        {
          week: "Month 4, Final Stage",
          focus: `Academic Excellence Showcase`,
          activity: `Demonstrate proficiency to your instructor. Earn Poplar School's custom 'Visual Explorer' badge of academic honor!`,
          type: "languages"
        }
      ];

      const fallbackTips = [
        `Divide any complex ${weaknesses.split(',')[0]} problem into 3 tiny chunks; draw a quick diagram for each chunk.`,
        `Utilize ${preferences} heavily by using color-coded highlighter tags for main points.`,
        `Poplar Admin Team Tip: Conduct academic review meetings with Nursery/Primary section heads once a month to verify progression rates.`
      ];

      return res.json({
        studentName: studentName || 'Learner',
        academicGoal: fallbackGoal,
        weeklyMilestones: fallbackMilestones,
        personalizedTips: fallbackTips
      });
    }
  } catch (error: any) {
    console.error("Error generating personalized path:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error.message,
      // Provide clean default path even on severe errors so frontend stays functional and gorgeous
      studentName: "Poplar Scholar",
      academicGoal: "To target weakness areas iteratively and achieve overall visual mastery across all Poplar School subjects.",
      weeklyMilestones: [
        { week: "Month 1", focus: "Self-paced discovery", activity: "Access digital teacher resources and download subject guides.", type: "languages" },
        { week: "Month 2", focus: "Interactive learning drills", activity: "Participate in quizzes, digital feedback sessions, and teacher chats.", type: "math" },
        { week: "Month 3", focus: "Weakness reinforcement", activity: "Receive personalized feedback and complete customized remedial projects.", type: "science" },
        { week: "Month 4", focus: "Excellence demonstration", activity: "Present final digital portfolio items to your Section Head for badge and certificate awards.", type: "creative" }
      ],
      personalizedTips: ["Check in with your class teacher weekly.", "Use the progress charts to identify and improve weak topics."]
    });
  }
});

// Serve static elements or hot development stream
if (process.env.NODE_ENV !== "production") {
  const startDev = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development Server running on http://localhost:${PORT}`);
    });
  };
  startDev();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production Server running on http://localhost:${PORT}`);
  });
}
