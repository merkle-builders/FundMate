import type { Network } from "@aptos-labs/wallet-adapter-react";

export const NETWORK: Network = (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? "testnet";
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

export const GOOGLE_CLIENT_ID = "306513074110-tci597uh8358u7o9il0au1ucok2ib787.apps.googleusercontent.com";
