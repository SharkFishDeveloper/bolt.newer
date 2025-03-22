export interface MessageChat {
    role: "user" | "system" | "assistant";
    parts: {"text":string}[];  // This should be a string, not an array
}