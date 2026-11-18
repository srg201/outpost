"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mic01Icon, StopIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

// The browser's built-in speech recognition (Chrome, Edge, Safari). TypeScript doesn't ship
// its types, so only the parts we use are declared here.
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => Recognition;

function getRecognition() {
  const w = window as unknown as Record<string, RecognitionConstructor | undefined>;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

// Support is only knowable in the browser; the server renders no button (Firefox never shows it).
const noopSubscribe = () => () => {};
const isSupported = () => getRecognition() !== undefined;
const isSupportedOnServer = () => false;

// Dictates into a text box: what you say is appended to the current text, and stays editable.
export function MicButton({
  value,
  onChange,
  disabled,
  className,
}: {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const t = useI18n().dict.workspace;
  const supported = useSyncExternalStore(noopSubscribe, isSupported, isSupportedOnServer);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  if (!supported) return null;

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = getRecognition();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Recognize in the interface language, so a Russian UI dictates Russian.
    recognition.lang = document.documentElement.lang || navigator.language;

    const base = value.trim() ? `${value.trim()} ` : "";
    recognition.onresult = (event) => {
      const spoken = Array.from(event.results, (result) => result[0].transcript).join("");
      onChange(base + spoken);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const label = listening ? t.stopDictation : t.dictate;

  return (
    <Button
      type="button"
      size="icon"
      variant={listening ? "destructive" : "ghost"}
      onClick={toggle}
      disabled={disabled}
      className={className}
      aria-label={label}
      aria-pressed={listening}
      title={label}
    >
      <HugeiconsIcon icon={listening ? StopIcon : Mic01Icon} aria-hidden />
    </Button>
  );
}
