import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { term } = await request.json();

    if (typeof term !== "string" || !term.trim()) {
      return Response.json({ error: "A term is required." }, { status: 400 });
    }

    const cleanTerm = term.trim();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You define Gen Z slang. Return only a short, plain-English definition in one or two sentences. No preface.",
        },
        {
          role: "user",
          content: `Define this Gen Z slang term: ${cleanTerm}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 120,
    });

    const definition = completion.choices[0]?.message?.content?.trim();

    if (!definition) {
      return Response.json(
        { error: "Could not generate a definition." },
        { status: 502 },
      );
    }

    return Response.json({
      term: cleanTerm,
      definition,
    });
  } catch (error) {
    console.error("Dictionary route error:", error);
    return Response.json(
      { error: "Something went wrong while fetching this term." },
      { status: 500 },
    );
  }
}
