import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MESSAGE_MODULE_ADDRESS } from "@/core/constants";

export type CreateIdArguments = {
  userName: string;
};

export const createId = (args: CreateIdArguments): InputTransactionData => {
  const { userName } = args;

  // Convert the string to hex
  const userNameHex = Buffer.from(userName, "utf8").toString("hex");

  console.log(userNameHex);

  return {
    data: {
      function: `${MESSAGE_MODULE_ADDRESS}::messaging_payment::create_id`,
      functionArguments: [
        `0x${userNameHex}`, // Pass the hex string as an argument
      ],
      typeArguments: [],
    },
  };
};
