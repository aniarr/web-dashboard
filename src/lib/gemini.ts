export async function generateReportAI(keywords: string) {
  // Integration Placeholder for Google Gemini or other LLM
  // To enable, add GEMINI_API_KEY to your .env file
  
  if (!process.env.GEMINI_API_KEY) {
    // Structural Fallback: Elaboration Logic
    const parts = keywords.split(',').map(k => k.trim());
    const mainEvent = parts[0] || "the event";
    
    return {
      report: `The initiative organized was centered around ${mainEvent}, which served as a pivotal platform for knowledge exchange and professional development. Key focus areas allowed participants to engage with contemporary challenges and innovative solutions.\n\nThrough structured sessions and interactive dialogues, the programme successfully bridged the gap between theoretical concepts and practical applications. The event fostered an environment of collaborative learning, where diverse perspectives contributed to a richer understanding of the subject matter.`,
      feedback: "Participants expressed high levels of satisfaction with the session content and delivery. The interactive nature of the programme was particularly praised, with many noting the practical relevance of the topics discussed.",
      outcome: [
        "Enhanced understanding of core concepts",
        "Development of practical skills",
        "Improved professional networking",
        "Knowledge sharing among peers",
        "Exposure to innovative methodologies"
      ]
    };
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Act as a professional academic report writer for an institutional document. 
            Expand the following details into a structured JSON response with exactly three keys: "report", "feedback", and "outcome".
            
            1. "report": A formal, descriptive summary of the event (1-2 paragraphs). Use the event title, date, and organizing team to build a cohesive narrative.
            2. "feedback": A summary of participant responses and engagement (1 paragraph).
            3. "outcome": An array of exactly 5 professional strings detailing the achievements and impact of the programme. Do NOT include bullet symbols like "•" in the strings.
            
            Ensure a professional institutional tone. Return ONLY valid JSON.
            
            Input Details: ${keywords}`
          }]
        }]
      })
    });
    
    // Handle API quota exhaustion (Status 429)
    if (response.status === 429) {
      throw new Error("Quota exhausted for AI generation. Please try again later.");
    }

    const data = await response.json();
    
    // Check if candidates exist (safety filters might block response)
    if (!data.candidates || data.candidates.length === 0) {
      console.warn("Gemini API returned no candidates. This might be due to safety filters.");
      throw new Error("AI could not generate a response for this content.");
    }

    const text = data.candidates[0].content?.parts?.[0]?.text || "";
    
    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    // Clean JSON response in case AI adds markdown blocks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI JSON. Raw text:", text);
      throw new Error("AI response was not in the expected format.");
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      report: "The system encountered an error during automated elaboration. Please review the manual input.",
      feedback: "The AI was unable to analyze participant feedback at this time.",
      outcome: [
        "Knowledge acquisition and professional growth",
        "Development of core competencies",
        "Improved understanding of industry trends",
        "Networking and collaborative learning",
        "Enhanced practical implementation skills"
      ]
    };
  }
}
