import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type CreateGroupArguments = {
  groupName: string;
};

export const createGroup = (args: CreateGroupArguments): InputTransactionData => {
  const { groupName } = args;

  // Convert the string to a Uint8Array
  const encoder = new TextEncoder();
  const groupNameBytes = encoder.encode(groupName);

  // Convert the Uint8Array to an array of numbers
  const groupNameArray = Array.from(groupNameBytes);

  console.log("userName as array:", groupNameArray);

  return {
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev4::create_group",
      functionArguments: [`0x${groupNameArray}`],
      typeArguments: [],
    },
  };
};
