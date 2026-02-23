"use client";
import Image from "next/image";
import { Slider } from "../components/ui/slider";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [translateTo, setTranslateTo] = useState<"normal" | "genz">("normal");
  const [translation, setTranslation] = useState("");
  const [message, setMessage] = useState("");
  const [intensityValue, setIntensityValue] = useState([0.75]);

  const [emptyInputError, setEmptyInputError] = useState(false);

  useEffect(() => {
    setMessage("");
    setTranslation("");
  }, [translateTo]);

  function handleToggle() {
    const nextTranslate = translateTo === "normal" ? "genz" : "normal";
    setTranslateTo(nextTranslate);
  }

  async function handleSubmit() {
    if (!message) {
      setEmptyInputError(true);
      return;
    }
    // send the api request here, and then get the output and assign it to a state variable
    setEmptyInputError(false);

    const Translation = await axios.post("/api/translate", {
      translateTo: translateTo,
      prompt: message,
      intensityValue,
    });

    console.log("Here's the translation: " + Translation.data);
    setTranslation(Translation.data);
  }
  return (
    <div className="min-h-screen max-w-[40%] mx-auto pt-10 font-genz">
      <div className="">Genz Translator.</div>

      <div className="mt-6">
        <div className="flex gap-2 items-baseline">
          <div className="text-sm">Translating to:</div>
          <button
            className="border block bg-amber-200 px-4 py-2 text-sm cursor-pointer"
            onClick={handleToggle}
          >
            {translateTo}
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-4"
        >
          <textarea
            placeholder="Enter your text here."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block border-gray-100 w-full bg-gray-100 py-2 px-2 placeholder:text-sm text-sm"
          />

          {translateTo === "genz" && (
            <div className="mt-4">
              <div className="flex justify-between max-w-[50%]">
                <label
                  htmlFor="intensity-slider"
                  className="text-sm text-gray-600"
                >
                  Brainrot Intensity
                </label>
                <div className="text-gray-800">{intensityValue}</div>
              </div>
              <Slider
                id="intensity-slider"
                value={intensityValue}
                onValueChange={setIntensityValue}
                min={0.1}
                max={1}
                step={0.05}
                className="mt-2 mb-4 w-full max-w-xs text-yellow-300"
              />
            </div>
          )}

          {emptyInputError && (
            <div className="text-red-400 text-sm">
              The input cannot be empty.
            </div>
          )}
          <button className="py-2 px-2 mt-2 bg-yellow-300 hover:bg-linear-to-br text-sm text-gray-800 cursor-pointer">
            Translate
          </button>
        </form>

        <div className="w-full border-b border-dashed mt-10"></div>

        <div className="mt-10">
          <div className="text-sm text-gray-800">Output box:</div>
          <div className="min-w-[50%] text-sm bg-gray-100 py-2 px-2 min-h-25">
            {translation}
          </div>
        </div>
      </div>
    </div>
  );
}
