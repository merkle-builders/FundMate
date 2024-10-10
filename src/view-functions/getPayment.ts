import { testnetClient } from "../core/constants";

export type Payment = {
  sender: string;
  amount: number;
  note: string;
  timestamp: number;
};

// Custom function to parse hex string or return original string if not hex
function parseHexOrString(input: string): string {
  // Check if the input is a valid hex string
  if (/^0x[0-9A-Fa-f]*$/.test(input)) {
    // Remove '0x' prefix and convert hex to string
    const hex = input.slice(2);
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }
  // If not a valid hex string, return the original input
  return input;
}

export const getPayment = async (
  senderAddress: string | undefined,
  recipientAddress: string,
): Promise<Payment[] | null> => {
  try {
    if (!senderAddress) {
      console.error("Sender address is undefined");
      return null;
    }

    console.log("the received recipient address is", recipientAddress);

    console.log(`Attempting to get sent payments from ${senderAddress} to ${recipientAddress}`);

    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev1::get_sent_payments",
        typeArguments: [],
        functionArguments: [senderAddress, recipientAddress],
      },
    });

    console.log("Raw result from view function:", JSON.stringify(result, null, 2));

    if (!Array.isArray(result)) {
      console.error("Invalid payment data received. Expected an array.");
      return null;
    }

    const payments: Payment[] = result.map((payment: any, index: number) => {
      console.log(`Processing payment ${index}:`, JSON.stringify(payment, null, 2));

      return {
        sender: String(payment.sender),
        amount: Number(payment.amount),
        note: parseHexOrString(String(payment.note)),
        timestamp: Number(payment.timestamp),
      };
    });

    console.log("Parsed payments:", JSON.stringify(payments, null, 2));

    return payments;
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
  }
};
