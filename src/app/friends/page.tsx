import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Friends() {
  const { account } = useWallet();

  return (
    <div className="flex flex-col">
      <div className="flex gap-3">
        <Table>
          <TableCaption>A list of all your aptos friends</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">{account?.ansName}</TableCell>
              <TableCell>Paid</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
