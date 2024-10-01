import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MESSAGE_MODULE_ADDRESS } from "@/core/constants";

export type CreateIdArguments = {
  userName: string;
};

export const createId = (args: CreateIdArguments): InputTransactionData => {
  const { userName } = args;

  return {
    data: {
      function: `${MESSAGE_MODULE_ADDRESS}::messaging_payment::create_id`,
      functionArguments: [
        Array.from(new TextEncoder().encode(userName)), // Convert string to Uint8Array
      ],
      typeArguments: [],
    },
  };
};
