"use client";
import React from "react";
import { Linechart } from "@/components/ui/linechart";
import ProfileIcon from "@/components/ui/icons/profileicon";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getUsername } from "@/view-functions/getUsername";

export default function Profile() {
  const { account } = useWallet();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => router.back()} variant="ghost" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center">
            <div className="flex flex-col items-center mb-6 w-24 h-24">
              <ProfileIcon />
              <h2 className="text-xl font-semibold">
                {getUsername("0x6623fc72d1afe4f0b80338ebf99a2453d1e04c7f40f648bf425514785745701f")}
              </h2>
            </div>

            <div className="space-y-4 w-1/2">
              <div>
                <Label className="font-semibold">Account Address</Label>
                <div className="flex items-center ">
                  <Wallet className="mr-2 h-4 w-4 text-gray-500" />
                  <Input value={account?.address} disabled={true} className="font-mono text-sm" />
                </div>
              </div>

              <div>
                <Label className="font-semibold">Name</Label>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  <Input value="paul" disabled={true} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 flex flex-col justify-center items-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center h-fit w-3/4">
            <Linechart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
