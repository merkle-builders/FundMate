import React from "react";
import { Linechart } from "@/components/ui/linechart";
import Profileicon from "@/components/ui/icons/profileicon";

export default function Creator() {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex justify-center mt-24">
        <Profileicon />
      </div>
      <div className="flex justify-center mt-72">
        <Linechart />
      </div>
    </div>
  );
}
