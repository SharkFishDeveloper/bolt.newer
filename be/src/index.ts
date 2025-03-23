require("dotenv").config();
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
// import { BASE_PROMPT } from "./prompts/BasePrompt";
import { reactbasePrompt } from "./prompts/react";
import { nextbasePrompt } from "./prompts/next";
import { nodebasePrompt } from "./prompts/node";
import { MessageChat } from "./Interface/Message";
import { BASE_PROMPT } from "./prompts/BasePrompt";
import { getSystemPrompt } from "./prompts/getSystemPrompt";
// import { BASE_PROMPT, getSystemPrompt } from "./prompts";
// import { basePrompt as nodeBasePrompt } from "./defaults/node";
// import { basePrompt as reactBasePrompt } from "./defaults/react";
// import { basePrompt as nextBasePrompt } from "./defaults/next";
// import { MessageChat } from "./type/Message";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const app = express();
app.use(cors());
app.use(express.json());


app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: prompt }] },  
                { role: "user", parts: [{ text: "Return 'node','react','next' based on what do you think this project should be. Only return a single word: 'node','react','next. Do not return anything extra. If confuse bw react and next return react" }] } 
            ],
            generationConfig: { maxOutputTokens: 20 }
        });

        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? "";

        if (answer === "react") {
            res.json({
                prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactbasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                ],
                uiPrompts: [reactbasePrompt]
            });
            return;
        }

        if (answer === "next") {
            res.json({
                prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextbasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                ],
                uiPrompts: [nextbasePrompt]
            });
            return;
        }

        if (answer === "node") {
            res.json({
                prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodebasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
                ],
                uiPrompts: [nodebasePrompt]
            });
            return;
        }
    } catch (error) {
        console.error("❌ Error generating response:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/chat", async (req, res) => {
    const now = new Date();
console.log(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
    const messages = req.body.content;
    const formattedMessages = messages.map((message: MessageChat) => ({
        role: message.role,
        //@ts-ignore
        parts: [{ text: message.parts[0].text }] 
    }));
    // console.log(JSON.stringify(messages,null,2))
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent({
            contents:formattedMessages,
            generationConfig: { maxOutputTokens: 8000 },
            systemInstruction: getSystemPrompt
        });

        const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated.";
        //@ts-ignore
        result.response.candidates[0].content.parts.map((part)=>console.log(part))
        console.log("responseText, ",responseText)
        res.json({ response: responseText });
    } catch (error) {
        console.error("❌ Error generating chat response:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
