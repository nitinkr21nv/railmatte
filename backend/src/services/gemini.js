/**
 * Gemini AI Assistance Service for RailMatte
 * Generates structured assistance drafts and classifies issue categories.
 * Uses official Gemini API with graceful heuristic fallback.
 */

export async function draftAssistanceReport(rawUserInput) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!rawUserInput || typeof rawUserInput !== 'string') {
    throw new Error('Valid description input required');
  }

  const cleanInput = rawUserInput.trim().slice(0, 500);

  // If no API key configured, use local rule-based heuristic draft
  if (!apiKey) {
    return generateLocalFallbackDraft(cleanInput, 'Gemini API key not configured on server');
  }

  // Model cascade: try gemini-2.5-flash first, then gemini-2.0-flash / gemini-flash-latest
  const modelCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

  const prompt = `You are an empathetic, practical railway journey assistant for RailMatte (a voluntary passenger seat exchange & travel coordination platform).
Given this passenger note: "${cleanInput}"

Formulate a concise, factual assistance report draft and classify into one of these exact categories:
- SEAT_CONFLICT (seat occupied by wrong person, double allocation, refusal to move)
- BERTH_DISPUTE (luggage on berth, dispute over upper/middle/lower berth timing or occupancy)
- ACCESSIBILITY_NEED (elderly passenger, mobility/wheelchair assistance, medical comfort)
- LOST_ITEM (misplaced bags, wallets, phones, documents on train or platform)
- GENERAL_ASSISTANCE (cooling, cleanliness, attendant help, coach coordination)

Respond ONLY with valid JSON with this exact structure:
{
  "category": "CATEGORY_NAME",
  "summary": "Concise 1-sentence headline",
  "description": "2-3 clear, objective sentences describing the situation without emotional hyperbole",
  "recommendedAction": "Advised practical step for the passenger (e.g. speak politely with coach TTE or fellow passenger)"
}`;

  for (const model of modelCandidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 400
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Gemini AI] Model ${model} returned HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) continue;

      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        aiGenerated: true,
        modelUsed: model,
        category: parsed.category || 'GENERAL_ASSISTANCE',
        summary: parsed.summary || 'Passenger Assistance Request',
        description: parsed.description || cleanInput,
        recommendedAction:
          parsed.recommendedAction || 'Please notify train staff or fellow passenger politely.'
      };
    } catch (err) {
      console.warn(`[Gemini AI] Attempt with ${model} failed:`, err.message);
    }
  }

  // If all Gemini attempts failed, return clearly labeled local heuristic
  return generateLocalFallbackDraft(
    cleanInput,
    'Gemini API request timed out or returned an error. Local rule-based draft provided.'
  );
}

function generateLocalFallbackDraft(input, fallbackReason = 'Local heuristics active') {
  const lower = input.toLowerCase();
  let category = 'GENERAL_ASSISTANCE';
  let recAction = 'Speak courteously with the coach attendant (TTE) or fellow passenger.';

  if (
    lower.includes('luggage') ||
    lower.includes('bag') && lower.includes('berth')
  ) {
    category = 'BERTH_DISPUTE';
    recAction =
      'Kindly ask nearby passengers whose luggage is occupying the berth. If unclaimed, notify the Travelling Ticket Examiner (TTE) at the next stop.';
  } else if (
    lower.includes('berth') ||
    lower.includes('sleep') ||
    lower.includes('upper') ||
    lower.includes('lower') ||
    lower.includes('middle')
  ) {
    category = 'BERTH_DISPUTE';
    recAction = 'Verify your confirmed coach and berth assignment before requesting assistance.';
  } else if (
    lower.includes('lost') ||
    lower.includes('wallet') ||
    lower.includes('phone')
  ) {
    category = 'LOST_ITEM';
    recAction = 'Check with coach ticket examiner (TTE) and file a missing item notice at the next station.';
  } else if (
    lower.includes('elderly') ||
    lower.includes('wheelchair') ||
    lower.includes('disabled') ||
    lower.includes('medic')
  ) {
    category = 'ACCESSIBILITY_NEED';
    recAction = 'Request coach attendant for lower-tier accommodation support.';
  } else if (
    lower.includes('seat') ||
    lower.includes('taken') ||
    lower.includes('occup')
  ) {
    category = 'SEAT_CONFLICT';
    recAction = 'Present your booking reservation quietly to clarify seat allocation.';
  }

  return {
    aiGenerated: false,
    fallbackReason,
    category,
    summary: 'Assistance Report Draft (Local Rule-Based)',
    description: `Passenger reports: "${input}". Please verify berth and coach details with the on-duty Travelling Ticket Examiner (TTE).`,
    recommendedAction: recAction
  };
}
