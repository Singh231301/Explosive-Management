import type { ReactNode } from "react";
import type { FormHTMLAttributes } from "react";

export function Form({ children, ...props }: FormHTMLAttributes<HTMLFormElement> & { children: ReactNode }) {
  return <form className="space-y-4" {...props}>{children}</form>;
}
