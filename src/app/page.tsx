"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
// import { AccountInfo } from "@/components/AccountInfo";
import { Header } from "@/components/Header";
// import { MessageBoard } from "@/components/MessageBoard";
// Internal Components
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletBaselogin } from "@/components/WalletBaselogin";

function App() {
  const { connected, wallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push("/application/tg");
    }
  }, [connected]);
  console.log("connect status is:", connected);

  console.log("wallet info", wallet);

  return (
    <>
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="w-full h-full"
        >
          <Header />
          <div className="flex items-center justify-center flex-col">
            {connected ? (
              <div className="h-screen">{"You are connected"}</div>
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
        </motion.div>
      </AuroraBackground>
    </>
  );
}

export default App;
