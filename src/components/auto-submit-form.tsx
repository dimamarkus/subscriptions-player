"use client";

import type { FormEvent, PropsWithChildren } from "react";

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
  function handleChange(event: FormEvent<HTMLFormElement>) {
    if (!submitOnChange) {
      return;
    }

    event.currentTarget.requestSubmit();
  }

  return (
    <form action={action} className={className} onChange={handleChange}>
      {children}
    </form>
  );
}
