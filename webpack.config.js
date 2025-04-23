module.exports = {
  // ... existing code ...
  module: {
    rules: [
      // ... existing code ...
    ],
  },
  // ... existing code ...
  ignoreWarnings: [
    {
      module: /html2pdf\.js/,
      message: /Failed to parse source map/,
    },
  ],
  // ... existing code ...
}; 