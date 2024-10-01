"use client";

import React from "react";
import { Linechart } from "@/components/ui/linechart";
import Profileicon from "@/components/ui/icons/profileicon";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const { account } = useWallet();

  return (
    <div className="flex flex-col justify-center">
      <div className="flex justify-center mt-24">
        <Profileicon />
      </div>

      <div className="flex flex-col justify-center items-center gap-2 mt-5">
        <Label className="font-semibold ">Account Address</Label>
        <Input className="w-[500px] font-semibold " value={account?.address} disabled={true} />
      </div>
      <div className="flex flex-col justify-center items-center gap-2 mt-5">
        <Label className="font-semibold">Name</Label>
        <Input className="w-[500px] font-semibold" value={"Paul"} disabled={true} />
      </div>
      <div className="flex justify-center mt-48">
        <Linechart />
      </div>
    </div>
  );
}
