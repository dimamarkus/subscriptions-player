"use client";

import type { FormEvent, PropsWithChildren } from "react";
import { useRouter } from "next/navigation";

type AutoSubmitFormProps = PropsWithChildren<{
  action: string;
  className?: string;
  submitOnChange?: boolean;
}>;

export function AutoSubmitForm({
  action,
  className,
  submitOnChange = true,
  children,
}: AutoSubmitFormProps) {
  const router = useRouter();

  function handleChange(event: FormEvent<HTMLFormElement>) {
    if (!submitOnChange) {
      return;
    }

    event.currentTarget.requestSubmit();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const searchParams = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") {
        continue;
      }

      const trimmedValue = value.trim();

      if (!trimmedValue) {
        continue;
      }

      searchParams.append(key, trimmedValue);
    }

    const href = searchParams.size > 0 ? `${action}?${searchParams}` : action;
    router.push(href);
  }

  return (
    <form
      action={action}
      className={className}
      onChange={handleChange}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}
