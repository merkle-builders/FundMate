import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MoveAddressType } from "@aptos-labs/ts-sdk";

export type WriteMessageArguments = {
  sender: MoveAddressType | undefined;
  recipient: MoveAddressType;
  content: string; // the content of the message
};

export const sendMessage = (args: WriteMessageArguments): InputTransactionData => {
  const { sender, recipient, content } = args;
  return {
    sender,
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev2::send_message",
      functionArguments: [recipient, `0x${content}`],
    },
  };
};
