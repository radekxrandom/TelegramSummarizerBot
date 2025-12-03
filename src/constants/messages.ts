export const MESSAGES = {
  START_READING: "Reading website content...",
  ERROR_NO_TEXT: "Could not extract meaningful text from this URL. 😕",
  START_GENERATING: "Generating summary...",
  ERROR_GENERIC: "Sorry, something went wrong while summarizing this link. 🚨",
  ERROR_NO_URL: "I didn't see a valid URL in that message. Please send a link you'd like me to summarize!",
  ERROR_TOO_MANY_REQUESTS: "You have a request in progress. Please wait for it to finish. ⏳",
};

export const SYSTEM_PROMPTS = {
  SUMMARIZER: `
    You are an expert content summarizer.
    Analyze the provided <source_content> and generate a summary based on the <user_instructions>.
    Focus on key merits, facts, and conclusions. Use simple, direct language.
  `
};
