"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [translateTo, setTranslateTo] = useState<"normal" | "genz">("normal");
  const [translation, setTranslation] = useState("");

  function handleToggle() {
    const nextTranslate = translateTo === "normal" ? "genz" : "normal";
    setTranslateTo(nextTranslate);
  }

  function handleSubmit() {
    // send the api request here, and then get the output and assign it to a state variable

    setTranslation("This is a response");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div>Genz Translator.</div>

      <div>
        <div className="flex gap-2">
          <div>Translating to:</div>
          <button className="border" onClick={handleToggle}>
            {translateTo}
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input type="text" placeholder="enter your text here." />
          <button>Click to submit</button>
        </form>

        <div>
          <div>Output box:</div>
          <div>{translation}</div>
        </div>
      </div>
    </div>
  );
}
