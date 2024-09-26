"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountInfo } from "@/components/AccountInfo";
import { Header } from "@/components/Header";
import { MessageBoard } from "@/components/MessageBoard";
import { NetworkInfo } from "@/components/NetworkInfo";
import { TransferAPT } from "@/components/TransferAPT";
import { WalletDetails } from "@/components/WalletDetails";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletBaselogin } from "@/components/WalletBaselogin";

function App() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/creator");
    }
  }, [connected]);
  console.log("connect status is:", connected);
  return (
    <>
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-10 pt-6">
              <WalletDetails />
              <NetworkInfo />
              <AccountInfo />
              <TransferAPT />
              <MessageBoard />
            </CardContent>
          </Card>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Welcome to Movepay</CardTitle>
            </CardHeader>
            <div className="flex justify-center mt-80">
              <WalletBaselogin />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
