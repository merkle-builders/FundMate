import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center">
      Layout
      <div>{children}</div>
    </div>
  );
}
