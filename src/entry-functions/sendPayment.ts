import { MoveAddressType } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type SendPaymentArguments = {
  recipient: MoveAddressType; // Address of the recipient
  amount: number; // Payment amount in Aptos coins (u64)
  note: string; // Additional payment note (String)
};

export const sendPayment = (args: SendPaymentArguments): InputTransactionData => {
  const { recipient, amount, note } = args;

  // Ensure that the recipient address is formatted correctly
  const recipientAddress = `0x${recipient.replace(/^0x/, "")}`;

  // Encode the note (String) to a Uint8Array (UTF-8 format)
  const encoder = new TextEncoder();
  const noteBytes = encoder.encode(note);

  // Convert the Uint8Array to an array of numbers
  const noteArray = Array.from(noteBytes);

  // Prepare and return the transaction payload for sending the payment
  return {
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev1::send_payment",
      functionArguments: [
        recipientAddress, // Recipient's address as a hex string
        amount,
        `0x${noteArray}`, // Encoded note as a hex string
      ],
      typeArguments: [],
    },
  };
};
