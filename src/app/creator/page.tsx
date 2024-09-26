"use client";

import React, { useState, useEffect } from "react";
import { Linechart } from "@/components/ui/linechart";
import Profileicon from "@/components/ui/icons/profileicon";
import { useSelector } from "react-redux";

export default function Creator() {
  const { nexusId } = useSelector((state) => state.authSlice);
  const [customNexusId, setCustomNexusId] = useState("");
  const { idToken, activeAccountAdress, selfNexusId } = useSelector((state) => state.authSlice);

  return (
    <div className="flex flex-col justify-center">
      <div className="flex justify-center mt-24">
        <Profileicon />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{idToken?.state?.accounts[0]?.idToken?.decoded?.email || "not provided"}</h1>
      </div>
      <div className="flex justify-center mt-72">
        <Linechart />
      </div>
    </div>
  );
}
