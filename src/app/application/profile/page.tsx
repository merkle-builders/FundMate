"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Linechart } from "@/components/ui/linechart";
import ProfileIcon from "@/components/ui/icons/profileicon";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { getUsername } from "@/view-functions/getUsername";


// Create a separate component for the content that uses useSearchParams
const ProfileContent = () => {
  const { account } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams(); // This is now inside a component wrapped by Suspense
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileAddress, setProfileAddress] = useState("");

  useEffect(() => {
    const addressParam = searchParams.get("address");
    if (addressParam) {
      setProfileAddress(addressParam);
    } else if (account) {
      setProfileAddress(account.address);
    }
  }, [searchParams, account]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (profileAddress) {
        setLoading(true);
        const fetchedUsername = await getUsername(profileAddress);
        setUsername(fetchedUsername ?? "");
        setLoading(false);
      }
    };

    fetchUsername();
  }, [profileAddress]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      <Button onClick={() => router.back()} variant="secondary" className="mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col gap-4 sm:gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center p-4 sm:p-6">
            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-3">
                <ProfileIcon />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-center">
                {loading ? "Loading..." : username || "Username not found"}
              </h2>
            </div>
            <div className="space-y-3 sm:space-y-4 w-full max-w-md sm:max-w-lg">
              <div>
                <Label className="font-semibold text-sm sm:text-base">Account Address</Label>
                <div className="flex items-center mt-1">
                  <Wallet className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                  <Input 
                    value={account?.address} 
                    disabled={true} 
                    className="font-mono text-xs sm:text-sm min-w-0" 
                  />
                </div>
              </div>

              <div>
                <Label className="font-semibold text-sm sm:text-base">Name</Label>
                <div className="flex items-center mt-1">
                  <User className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                  <Input 
                    value={username} 
                    disabled={true} 
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center p-4 sm:p-6">
            <div className="w-full max-w-full overflow-x-auto">
              <Linechart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Profile component
export default function Profile() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
