function estimateTokens(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.round(words * 1.33);
}

function estimateEmissions(tokens) {
  return tokens * 0.0002;
}

module.exports = { estimateTokens, estimateEmissions };
