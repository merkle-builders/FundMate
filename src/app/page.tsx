"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/Header";
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { WalletBaselogin } from "@/components/WalletBaselogin";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
function App() {
  const { account, connected, wallet, connect } = useWallet();

  const router = useRouter();

  useEffect(() => {
    if (connected) {
      console.log("connected: ", account?.address);
      router.push("/application/tg");
    }
    console.log("wallet info", wallet?.name);
  }, [connected]);
  console.log("connect status is:", connected);

  console.log("wallet info", wallet?.name);

  useEffect(() => {
    const handleLaunch = () => {
      if (connected) {
        console.log("connected: ", account?.address);
        router.push("/application/tg");
      } else if (!connected) {
        connect("Continue with Google" as WalletName);
      }
    };
    handleLaunch();
  });

  return (
    <>
      <Header />
      <div className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className=" p-4 max-w-7xl flex flex-col justify-center items-center  mx-auto relative z-10  w-full pt-20 md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            FundMate.
          </h1>
          <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            Decentralized messaging with built-in crypto payments on Aptos. Connect, chat, and send funds effortlessly.
          </p>
          {connected ?<Button className="font-bold" onClick={() => router.push("application/tg")}>Launching App...</Button> : <WalletBaselogin />}
        </div>
      </div>
    </>
  );
}

export default App;
