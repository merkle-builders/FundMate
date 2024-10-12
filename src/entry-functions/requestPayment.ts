import { MoveAddressType } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type RequestPaymentArguments = {
  accountAddress: MoveAddressType;
  requesteeAddress: MoveAddressType;
  amount: number; 
  note: string; 
};

export const requestPayment = (args: RequestPaymentArguments): InputTransactionData => {
  const { accountAddress, requesteeAddress, amount, note } = args;

  const recipientAddress = `0x${requesteeAddress.replace(/^0x/, "")}`;

  const encoder = new TextEncoder();
  const noteBytes = encoder.encode(note);

  const noteArray = Array.from(noteBytes);

  return {
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev2::request_payment",
      functionArguments: [
        accountAddress,
        recipientAddress,
        amount,
        `0x${noteArray}`, 
      ],
      typeArguments: [],
    },
  };
};
