const debugLog = (scope, message, extra = undefined) => {
  const suffix = extra === undefined ? "" : ` ${JSON.stringify(extra)}`;
  console.log(`[AquaEdge:${scope}] ${message}${suffix}`);
};

module.exports = debugLog;
