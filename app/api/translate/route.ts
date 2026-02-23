import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const { translateTo, prompt, intensityValue } = await request.json();

  const genzToNormal =
    "convert this genz statement given by the user to a normal statement. Just translate it 1-to-1. Do not add any statements of your own. Do not even add context messages like 'here is the translation:' and etcetra";
  const normalToGenz =
    "convert this normal statement given by the user to genz slang, Just translate it 1-to-1. Do not add any statements of your own. Do not even add context messages like 'here is the translation:' and etcetra, use the brainrot num (on a scale of 0 to 1) to determine how slangy the response should be: " +
    intensityValue;
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",

    messages: [
      {
        role: "user",
        content:
          translateTo === "genz"
            ? normalToGenz + prompt
            : genzToNormal + prompt,
      },
    ],
  });
  return new Response(JSON.stringify(completion.choices[0]?.message?.content));
}
