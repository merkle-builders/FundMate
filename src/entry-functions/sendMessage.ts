import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MoveAddressType } from "@aptos-labs/ts-sdk";

export type WriteMessageArguments = {
  recipientAddress: MoveAddressType;
  messageContent: string; 
};

export const sendMessage = (args: WriteMessageArguments): InputTransactionData => {
  const { recipientAddress, messageContent } = args;
  return {
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev2::send_message",
      functionArguments: [recipientAddress, `0x${messageContent}`],
      typeArguments: [],
    },
  };
};
