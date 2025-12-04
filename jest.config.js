export default {
  testEnvironment: "jest-environment-jsdom",

  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },

  moduleFileExtensions: ["js", "jsx"],

  transformIgnorePatterns: [
    "/node_modules/(?!(lucide-react|framer-motion)/)",
  ],

  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};


