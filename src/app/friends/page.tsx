"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { EllipsisVertical } from "lucide-react";

export default function Friends() {
  const { account } = useWallet();

  console.log("account object:", account);
  return (
    <div className="flex justify-center">
      <div className="flex justify-center">
        <Table className="w-[500px] mt-24">
          <TableCaption>A list of all your aptos friends</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Email</TableHead>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">mierlo.paul</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell className="flex justify-end ">
                <EllipsisVertical className="hover:cursor-pointer hover:bg-slate-50 hover:opacity-40 transition-all" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
