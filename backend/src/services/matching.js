/**
 * Deterministic Seat Exchange Compatibility Engine
 *
 * Implements rule-based, transparent scoring for voluntary passenger seat exchanges.
 * No black-box or non-deterministic mechanisms are used.
 */

function normalizeText(text) {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Evaluates compatibility between a base request and a candidate request
 * @param {Object} base The requesting passenger's exchange request
 * @param {Object} candidate Another passenger's candidate exchange request
 * @returns {{ isCompatible: boolean, score: number, reasons: string[] }}
 */
export function evaluateCompatibility(base, candidate) {
  const reasons = [];

  // 1. Participant & Identity Checks
  if (base.id === candidate.id) {
    return { isCompatible: false, score: 0, reasons: ['Cannot match a request with itself'] };
  }

  if (base.user_id && candidate.user_id && base.user_id === candidate.user_id) {
    return { isCompatible: false, score: 0, reasons: ['Both requests belong to the same passenger account'] };
  }

  // 2. Request Status Validation
  if (candidate.status !== 'OPEN') {
    return { isCompatible: false, score: 0, reasons: [`Candidate request is not open (current status: ${candidate.status})`] };
  }

  if (base.status !== 'OPEN') {
    return { isCompatible: false, score: 0, reasons: [`Your request is not in open status (current: ${base.status})`] };
  }

  // 3. Travel Date Matching (Strict Requirement)
  if (base.travel_date !== candidate.travel_date) {
    return { isCompatible: false, score: 0, reasons: [`Travel dates do not match (${base.travel_date} vs ${candidate.travel_date})`] };
  }
  reasons.push(`Matching travel date: ${base.travel_date}`);

  // 4. Origin & Destination Route Check
  const normBaseOrigin = normalizeText(base.origin_station);
  const normCandOrigin = normalizeText(candidate.origin_station);
  const normBaseDest = normalizeText(base.destination_station);
  const normCandDest = normalizeText(candidate.destination_station);

  if (normBaseOrigin !== normCandOrigin || normBaseDest !== normCandDest) {
    return {
      isCompatible: false,
      score: 0,
      reasons: [`Route mismatch: ${base.origin_station} -> ${base.destination_station} vs ${candidate.origin_station} -> ${candidate.destination_station}`]
    };
  }
  reasons.push(`Matching travel sector: ${base.origin_station} to ${base.destination_station}`);

  // 5. Coach Class Compatibility
  if (normalizeText(base.coach_class) !== normalizeText(candidate.coach_class)) {
    return {
      isCompatible: false,
      score: 0,
      reasons: [`Coach class mismatch: ${base.coach_class} vs ${candidate.coach_class}`]
    };
  }
  reasons.push(`Identical travel class: ${base.coach_class}`);

  // 6. Train Number Verification
  let trainScore = 0;
  if (base.train_number && candidate.train_number) {
    if (normalizeText(base.train_number) !== normalizeText(candidate.train_number)) {
      return {
        isCompatible: false,
        score: 0,
        reasons: [`Train identifier mismatch: Train ${base.train_number} vs Train ${candidate.train_number}`]
      };
    }
    trainScore = 15;
    reasons.push(`Verified same train: ${base.train_number}`);
  } else {
    trainScore = 5;
    reasons.push('Train number not specified on both requests (pending seat confirmation)');
  }

  // 7. Berth Preference Complementarity
  let berthScore = 0;
  const baseHas = normalizeText(base.current_berth_type);
  const baseWants = normalizeText(base.desired_berth_type);
  const candHas = normalizeText(candidate.current_berth_type);
  const candWants = normalizeText(candidate.desired_berth_type);

  const directReciprocal = baseHas === candWants && baseWants === candHas;
  const oneWayCandidateHasDesired = candHas === baseWants;
  const oneWayBaseHasDesired = baseHas === candWants;

  if (directReciprocal) {
    berthScore = 40;
    reasons.push(`Perfect reciprocal exchange: You have ${base.current_berth_type} (they want it) and they have ${candidate.current_berth_type} (you want it)`);
  } else if (oneWayCandidateHasDesired) {
    berthScore = 25;
    reasons.push(`Fulfills your preference: Candidate has ${candidate.current_berth_type} which matches your desired ${base.desired_berth_type}`);
  } else if (oneWayBaseHasDesired) {
    berthScore = 20;
    reasons.push(`Candidate desires your berth: You hold ${base.current_berth_type} which matches their preference`);
  } else {
    berthScore = 10;
    reasons.push(`General swap in class ${base.coach_class}`);
  }

  // 8. Coach Proximity
  let coachScore = 0;
  if (normalizeText(base.current_coach) === normalizeText(candidate.current_coach)) {
    coachScore = 10;
    reasons.push(`Same coach (${base.current_coach}): immediate proximity for minimal disruption`);
  }

  // Base score for route, date and class match
  const baseRuleScore = 35;
  const totalScore = Math.min(100, baseRuleScore + trainScore + berthScore + coachScore);

  return {
    isCompatible: true,
    score: totalScore,
    reasons
  };
}

/**
 * Searches and ranks all compatible open requests for a given base request
 * @param {Object} baseRequest
 * @param {Array<Object>} allRequests
 * @returns {Array<Object>} Sorted list of compatible candidates with scores and reasons
 */
export function findCompatibleRequests(baseRequest, allRequests) {
  if (!baseRequest || !Array.isArray(allRequests)) return [];

  const matches = [];

  for (const candidate of allRequests) {
    const evaluation = evaluateCompatibility(baseRequest, candidate);
    if (evaluation.isCompatible) {
      matches.push({
        candidate,
        score: evaluation.score,
        reasons: evaluation.reasons
      });
    }
  }

  // Sort by highest compatibility score first
  matches.sort((a, b) => b.score - a.score);

  return matches;
}
