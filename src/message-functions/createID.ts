import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
// import { MESSAGE_MODULE_ADDRESS } from "@/core/constants";

export type CreateIdArguments = {
  userName: string;
};

export const createId = (args: CreateIdArguments): InputTransactionData => {
  const { userName } = args;

  // Convert the string to a Uint8Array
  const encoder = new TextEncoder();
  const userNameBytes = encoder.encode(userName);

  // Convert the Uint8Array to an array of numbers
  const userNameArray = Array.from(userNameBytes);

  console.log("userName as array:", userNameArray);

  return {
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmate::create_id",
      functionArguments: [
        `0x${userNameArray}`, // Pass the hex string as an argument
      ],
      typeArguments: [],
    },
  };
};
