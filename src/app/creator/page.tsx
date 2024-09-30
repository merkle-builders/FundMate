"use client";

import React from "react";
import { Linechart } from "@/components/ui/linechart";
import Profileicon from "@/components/ui/icons/profileicon";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Creator() {
  const { account } = useWallet();
  return (
    <div className="flex flex-col justify-center">
      <div className="flex justify-center mt-24">
        <Profileicon />
      </div>
      <div className="flex justify-center mt-5">
        <h1 className="text-sm font-bold">{account?.address}</h1>
      </div>
      <div className="flex justify-center mt-72">
        <Linechart />
      </div>
    </div>
  );
}
