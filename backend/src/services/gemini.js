/**
 * Optional Gemini AI Assistance Service
 * Generates structured assistance drafts and classifies issue categories.
 * Fails gracefully if GEMINI_API_KEY is not configured.
 */

export async function draftAssistanceReport(rawUserInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Input validation and length protection
  if (!rawUserInput || typeof rawUserInput !== 'string') {
    throw new Error('Valid description input required');
  }

  const cleanInput = rawUserInput.trim().slice(0, 500);

  // Fallback heuristic draft if no Gemini API key configured
  if (!apiKey) {
    return generateLocalFallbackDraft(cleanInput);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are a helpful train passenger journey assistance assistant for RailMatte.
Given this passenger note: "${cleanInput}"

Formulate a concise, factual assistance report draft and classify into one of these exact categories:
- SEAT_CONFLICT
- LOST_ITEM
- ACCESSIBILITY_NEED
- BERTH_DISPUTE
- GENERAL_ASSISTANCE

Respond ONLY in valid JSON with this exact structure:
{
  "category": "CATEGORY_NAME",
  "summary": "1 sentence title",
  "description": "2-3 clear sentences describing the situation objectively without emotional exaggerations",
  "recommendedAction": "Advised practical step for the passenger"
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Using fallback draft.`);
      return generateLocalFallbackDraft(cleanInput);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      return generateLocalFallbackDraft(cleanInput);
    }

    // Extract JSON block
    const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateLocalFallbackDraft(cleanInput);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      aiGenerated: true,
      category: parsed.category || 'GENERAL_ASSISTANCE',
      summary: parsed.summary || 'Passenger Assistance Request',
      description: parsed.description || cleanInput,
      recommendedAction: parsed.recommendedAction || 'Please notify train staff or fellow passenger politely.'
    };
  } catch (err) {
    console.warn('Gemini drafting error or timeout:', err.message);
    return generateLocalFallbackDraft(cleanInput);
  }
}

function generateLocalFallbackDraft(input) {
  const lower = input.toLowerCase();
  let category = 'GENERAL_ASSISTANCE';
  let recAction = 'Speak courteously with the coach attendant or fellow passenger.';

  if (lower.includes('berth') || lower.includes('sleep') || lower.includes('upper') || lower.includes('lower') || lower.includes('middle')) {
    category = 'BERTH_DISPUTE';
    recAction = 'Verify your confirmed coach and berth assignment before requesting assistance.';
  } else if (lower.includes('lost') || lower.includes('wallet') || lower.includes('bag') || lower.includes('phone')) {
    category = 'LOST_ITEM';
    recAction = 'Check with coach ticket examiner (TTE) and file a missing item notice at the next station.';
  } else if (lower.includes('elderly') || lower.includes('wheelchair') || lower.includes('disabled') || lower.includes('medic')) {
    category = 'ACCESSIBILITY_NEED';
    recAction = 'Request coach attendant for lower-tier accommodation support.';
  } else if (lower.includes('seat') || lower.includes('taken') || lower.includes('occup')) {
    category = 'SEAT_CONFLICT';
    recAction = 'Present your booking reservation quietly to clarify seat allocation.';
  }

  return {
    aiGenerated: false,
    category,
    summary: 'Assistance Report Draft',
    description: `Passenger reports: "${input}". Please verify berth and coach details with travel ticket examiner.`,
    recommendedAction: recAction
  };
}
