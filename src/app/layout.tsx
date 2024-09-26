"use client";

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import type { ReactNode } from "react";
import "./globals.css";
import store from "../redux/store";
import { Provider, useSelector } from "react-redux";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <WalletProvider>
            <ReactQueryProvider>
              <div id="root">{children}</div>
              <WrongNetworkAlert />
              <Toaster />
            </ReactQueryProvider>
          </WalletProvider>
        </Provider>
      </body>
    </html>
  );
}
