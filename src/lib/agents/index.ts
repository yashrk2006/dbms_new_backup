import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

export async function analyzeResumeAgent(resumeText: string) {
  try {
    const response = await cohere.chat({
      message: `You are a Resume Analyzer Agent.
      Analyze the following resume for a high-stakes Corporate Recruitment Pipeline:
      - Extract specific technical skills (Found Skills).
      - Identify critical missing keywords based on modern Software Engineering roles (Missing Keywords).
      - Generate 3-5 tactical suggestions for improvement (Bullet points).
      - Calculate a strictly logical ATS Score (0-100) based on role alignment.
      
      Respond ONLY with a valid JSON document matching this structure exactly (no markdown formatting, no backticks, just raw JSON):
      {
        "score": 78,
        "skills": ["JavaScript", "React", "TypeScript"],
        "missing": ["System Design", "AWS", "Docker"],
        "suggestions": [
          "Quantify your backend impact with specific metrics (e.g., 'Reduced latency by 20%')",
          "Add a Dedicated 'Technologies' section for better scannability",
          "Ensure your LinkedIn profile URL is clickable"
        ]
      }
      
      Resume text for processing:
      ${resumeText}
      `,
      temperature: 0.2
    });

    // Clean any potential markdown wrapping
    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(rawText);
  } catch (error) {
    console.error("Resume Analyzer Error:", error);
    return {
      score: 0,
      skills: [],
      missing: [],
      suggestions: ["Failed to analyze resume. Please try again."]
    };
  }
}

export async function jobMatchingAgent(skills: string[]) {
  // In a full DB setup, you'd pull all ACTIVE internships. For the agent logic, the AI maps the skills to roles.
  try {
    const response = await cohere.chat({
      message: `You are a Job Matching Agent for a college placement platform.
      A student has the following skills: ${skills.join(", ")}.
      
      Suggest the top 5 internship roles they should apply for, estimating a Match Percentage (Match % = common skills / required skills).
      
      Respond ONLY with a valid JSON document matching this structure exactly (no markdown):
      {
        "internships": [
          { "role": "Frontend Developer", "company": "TechCorp", "match_percentage": 85 },
          { "role": "Backend Engineer", "company": "Innovate Inc", "match_percentage": 60 }
        ]
      }
      `,
      temperature: 0.3
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(rawText);
  } catch (error) {
    console.error("Job Matcher Error:", error);
    return { internships: [] };
  }
}

export async function skillGapAgent(studentSkills: string[], requiredSkills: string[]) {
  try {
    const response = await cohere.chat({
      message: `You are a Skill Gap Agent.
      Student currently knows: ${studentSkills.join(", ")}.
      The target role requires: ${requiredSkills.join(", ")}.
      
      Identify the missing skills and generate a high-level 2-week learning roadmap.
      
      Respond ONLY with a valid JSON document matching this structure exactly (no markdown):
      {
        "missing_skills": ["SQL", "Docker"],
        "roadmap": [
          "Week 1: Learn basic SQL querying and database design.",
          "Week 2: Containerize a simple app using Docker."
        ],
        "summary": "You are 70% ready for Backend roles. Learn SQL + Docker -> Apply to jobs."
      }
      `,
      temperature: 0.3
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(rawText);
  } catch (error) {
    console.error("Skill Gap Error:", error);
    return { missing_skills: [], roadmap: [], summary: "Could not generate roadmap." };
  }
}

export async function studentAssistantAgent(message: string, history: { role: string, message: string }[] = []) {
  try {
    const chatHistory = history.map(h => ({
      role: h.role === "user" ? "USER" : "CHATBOT",
      message: h.message
    }));

    const response = await cohere.chat({
      message: message,
      chatHistory: chatHistory as any,
      preamble: `You are SkillSync Pulse, the intelligent career navigator for the SkillSync platform.
      Your goal is to help students with:
      - Career advice and internship roles.
      - Skill development roadmaps.
      - Resume improvement tips.
      - General motivation and guidance.
      
      You must always identify as SkillSync Pulse. Be professional, encouraging, and concise. Use markdown for better formatting (bullet points, bold text).
      If the student asks about a specific tech stack, provide actionable advice.`,
      temperature: 0.7
    });

    return response.text;
  } catch (error) {
    console.error("Student Assistant Error:", error);
    return "I'm having trouble connecting to my brain right now. Please try again in a moment!";
  }
}

export async function recruiterShortlistAgent(jobDescription: string, candidates: { name: string, skills: string[] }[]) {
  try {
    const response = await cohere.chat({
      message: `You are a Recruiter Agent.
      Job Description: ${jobDescription}
      
      Candidates:
      ${JSON.stringify(candidates, null, 2)}
      
      Evaluate all candidates and select the top 3. Match them against the Job Description.
      Respond ONLY with a valid JSON document matching this structure exactly:
      {
        "shortlisted": [
          { "name": "Candidate Name", "match_score": 92, "reasoning": "Strong React + Node expertise matches core requirements." }
        ]
      }
      `,
      temperature: 0.3
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Recruiter Agent Error:", error);
    return { shortlisted: [] };
  }
}

export async function adminPlacementPredictorAgent(collegeStats: any) {
  try {
    const response = await cohere.chat({
      message: `You are an Admin Strategic Agent.
      College Placement Statistics:
      ${JSON.stringify(collegeStats, null, 2)}
      
      Based on these stats, predict the placement success rate and identify critical areas for improvement.
      Respond ONLY with a valid JSON document matching this structure:
      {
        "predicted_success_rate": 85,
        "recommendations": [
          "Increase focus on Java/Spring Boot for 3rd-year students.",
          "Partner with more Fintech companies based on current student skill trends."
        ],
        "risk_factors": ["Low project visibility for 15% of students."]
      }
      `,
      temperature: 0.4
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Admin Agent Error:", error);
    return { predicted_success_rate: 0, recommendations: [], risk_factors: ["Prediction failed."] };
  }
}
