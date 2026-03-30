import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { skills, title } = await req.json();

    if (!skills || !title) {
       return NextResponse.json({ success: false, error: 'Missing parameters. Requires skills and title.' }, { status: 400 });
    }

    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) {
       return NextResponse.json({ success: false, error: 'AI Simulator is currently offline. Missing API Key.' }, { status: 500 });
    }

    const prompt = `You are an expert technical interviewer for a "${title}" position. The candidate has the following core skills: ${skills.join(', ')}. Generate exactly 3 highly specific, challenging technical behavioral or system-design interview questions tailored towards testing their understanding of those specific skills in the context of the requested job role.
    
CRITICAL RULE: Return ONLY a raw JSON array of exactly 3 strings. Do NOT wrap it in a markdown code block (no \`\`\`json). Do NOT add any preamble. 
Example exactly like this:
["Question 1?", "Question 2?", "Question 3?"]`;

    const response = await fetch('https://api.cohere.com/v1/chat', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${cohereKey}`,
         'Content-Type': 'application/json',
         'accept': 'application/json'
       },
       body: JSON.stringify({
         message: prompt,
         model: 'command-r', // Faster than command-r-plus, perfect for generating 3 questions
         temperature: 0.6,
       })
    });

    const data = await response.json();
    
    if (!response.ok) {
       console.error("Cohere API Error:", data);
       return NextResponse.json({ success: false, error: 'AI encountered an error generating questions.', details: data.message }, { status: 500 });
    }

    let rawText = data.text.trim();
    
    // Safely strip markdown if Cohere disobeys the prompt
    if (rawText.startsWith('```json')) {
      rawText = rawText.substring(7);
      if (rawText.endsWith('```')) rawText = rawText.slice(0, -3);
    } else if (rawText.startsWith('```')) {
      rawText = rawText.substring(3);
      if (rawText.endsWith('```')) rawText = rawText.slice(0, -3);
    }
    rawText = rawText.trim();

    try {
        const parsedQuestions = JSON.parse(rawText);
        if (!Array.isArray(parsedQuestions)) {
            throw new Error("Parsed output is not an array");
        }
        return NextResponse.json({ success: true, questions: parsedQuestions });
    } catch (parseError) {
        console.error("Failed to parse AI output:", rawText);
        // Fallback gracefully if AI goes completely off the rails
        return NextResponse.json({ 
            success: true, 
             questions: [
                `Given your background in ${skills[0] || 'your core skills'}, how would you approach building a ${title} system?`,
                `Describe a time you solved a complex problem. How did you document and test it?`,
                `What is the most difficult technical hurdle you foresee in this role, and how would you overcome it?`
             ] 
        });
    }

  } catch (error) {
    console.error("Interview generation failed:", error);
    return NextResponse.json({ success: false, error: 'Failed to generate interview simulation.' }, { status: 500 });
  }
}
