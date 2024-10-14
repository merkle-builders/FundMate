import { MoveAddressType } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type SendPaymentArguments = {
  recipient: MoveAddressType;
  amount: number;
  note: string; 
};

export const sendPayment = (args: SendPaymentArguments): InputTransactionData => {
  const { recipient, amount, note } = args;

  const recipientAddress = `0x${recipient.replace(/^0x/, "")}`;

  const encoder = new TextEncoder();
  const noteBytes = encoder.encode(note);

  const noteArray = Array.from(noteBytes);

  return {
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev4::send_payment",
      functionArguments: [
        recipientAddress, 
        amount,
        `0x${noteArray}`,
      ],
      typeArguments: [],
    },
  };
};
