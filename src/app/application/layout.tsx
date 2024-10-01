"use client";

import React, { ReactNode, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { account } = useWallet();
  useEffect(() => {
    if (!account) {
      router.push("/");
    }
  }, [account]);

  return (
    <div className="">
      <div>{children}</div>
    </div>
  );
}
