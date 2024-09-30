"use client";
import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Friends() {
  const { account } = useWallet();

  const router = useRouter();

  console.log("account object:", account);
  return (
    <div className="flex justify-center">
      <div className="flex justify-center">
        <Table className="w-[500px] mt-24">
          <TableCaption>A list of all your aptos friends</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">mierlo.paul</TableCell>
              <TableCell>{account?.address}</TableCell>
              <TableCell className="flex justify-end ">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <EllipsisVertical className="hover:cursor-pointer hover:bg-slate-50 hover:opacity-40 transition-all" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {" "}
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push("/creator")}>Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/message")}>Message</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
