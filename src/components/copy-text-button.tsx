"use client";

import { useState } from "react";

type CopyTextButtonProps = {
  text: string;
};

export function CopyTextButton({ text }: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-white/30"
    >
      {copied ? "Copied" : "Copy address"}
    </button>
  );
}
