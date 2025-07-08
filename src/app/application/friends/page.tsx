"use client";
import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { EllipsisVertical, User, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Friends() {
  const { account } = useWallet();

  const router = useRouter();

  console.log("account object:", account);
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      <div className="flex justify-center">
        {/* Desktop Table View */}
        <div className="hidden md:block w-full">
          <Table className="w-full">
            <TableCaption className="text-sm sm:text-base">A list of all your aptos friends</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">mierlo.paul</TableCell>
                <TableCell className="font-mono text-sm">{account?.address}</TableCell>
                <TableCell className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <EllipsisVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => router.push("/application/profile")}>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/application")}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden w-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-center mb-2">Your Aptos Friends</h2>
            <p className="text-sm text-gray-600 text-center">A list of all your aptos friends</p>
          </div>
          
          <div className="space-y-4">
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 mr-3 flex-shrink-0 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-lg truncate">mierlo.paul</h3>
                        <p className="text-xs text-gray-500 font-mono truncate">
                          {account?.address?.slice(0, 10)}...{account?.address?.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <EllipsisVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => router.push("/application/profile")}>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/application")}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Action Buttons for Mobile */}
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => router.push("/application/profile")}
                  >
                    <User className="mr-1 h-3 w-3" />
                    Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => router.push("/application")}
                  >
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
