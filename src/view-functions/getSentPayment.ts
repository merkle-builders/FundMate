import { MoveValue } from "@aptos-labs/ts-sdk";
import { testnetClient } from "../core/constants";
import { parseReadableStringFromHex } from "@/core/utils";
export type Payment = {
  sender: string;
  amount: number;
  note: string;
  timestamp: string;
};

export const getSentPayment = async (
  senderAddress: string | undefined,
  recipientAddress: string,
): Promise<Payment[] | null> => {
  try {
    if (!senderAddress) {
      console.error("Sender address is undefined");
      return null;
    }

    console.log(`Attempting to get sent payments from ${senderAddress} to ${recipientAddress}`);

    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev1::get_sent_payments",
        typeArguments: [],
        functionArguments: [senderAddress, recipientAddress],
      },
    });

    if (!Array.isArray(result)) {
      console.error("Invalid payment data received. Expected an array.");
      return null;
    }

    const paymentResult = result[0] as MoveValue[];
    const payments: Payment[] = paymentResult?.map((payment: any, index: number) => {
      console.log(`Processing payment ${index}:`, JSON.stringify(payment));

      // Function to format the timestamp
      const formatTimestamp = (unixTimestamp: number): string => {
        const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
        const formattedDate = date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short", // 'short' gives the 3-letter abbreviation of the month
          year: "2-digit",
        });
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${formattedTime} ${formattedDate}`;
      };

      return {
        sender: String(payment.sender),
        amount: Number(payment.amount),
        note: parseReadableStringFromHex(String(payment.note)),
        timestamp: formatTimestamp(Number(payment.timestamp)), // Format the timestamp
      };
    });

    return payments;
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
  }
};
