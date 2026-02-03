import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in .env");
}

const model = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    apiKey: apiKey,
});

export async function summarizeMeeting(transcript: string) {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are an expert meeting assistant. Analyze the transcript and provide a clear title/goal and key points."],
        ["user", "Analyze the following meeting transcript and provide:\n1. The Title/Goal of the meeting.\n2. Key points discussed.\n\nTranscript:\n{transcript}"]
    ]);

    const chain = prompt.pipe(model);

    try {
        const response = await chain.invoke({
            transcript: transcript,
        });
        return response.content;
    } catch (error) {
        console.error("Error summarizing meeting:", error);
        return "Failed to summarize meeting.";
    }
}