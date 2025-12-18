// Shared answer validation helpers (client-side)

// Levenshtein distance for fuzzy matching (allows typos)
export function levenshteinDistance(a, b) {
  const aa = String(a ?? '');
  const bb = String(b ?? '');
  const matrix = [];
  for (let i = 0; i <= bb.length; i++) matrix[i] = [i];
  for (let j = 0; j <= aa.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= bb.length; i++) {
    for (let j = 1; j <= aa.length; j++) {
      if (bb.charAt(i - 1) === aa.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bb.length][aa.length];
}

export function isFillBlankCorrect(userAnswer, correctAnswer) {
  const user = String(userAnswer ?? '').toLowerCase().trim();
  const correct = String(correctAnswer ?? '').toLowerCase().trim();
  const isYear = /^\d{4}$/.test(correct);
  if (isYear) return user === correct;
  return levenshteinDistance(user, correct) <= 3;
}

