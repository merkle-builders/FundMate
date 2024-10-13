import { MoveAddressType, MoveValue } from "@aptos-labs/ts-sdk";
import { testnetClient } from "../core/constants";
import { parseReadableStringFromHex, formatTimestamp } from "@/core/utils";

export type Message = {
  type: 'message';
  sender: MoveAddressType;
  content: string;
  timestamp: string;
};

export type Payment = {
  type: 'payment';
  sender: string;
  amount: number;
  note: string;
  timestamp: string;
};

export type ConversationItem = Message | Payment;

export const getConversation = async (
  sender: string | undefined,
  recipientAddress: string
): Promise<ConversationItem[] | null> => {
  try {
    if (!sender) {
      console.error("Sender address is undefined");
      return null;
    }

    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev2::get_conversation",
        typeArguments: [],
        functionArguments: [sender, recipientAddress],
      },
    });

    if (!Array.isArray(result) || result.length !== 2) {
      console.error("Invalid data received. Expected an array with two elements.");
      return null;
    }

    const [messagesResult, paymentsResult] = result as [MoveValue[], MoveValue[]];

    const messages: Message[] = messagesResult.map((message: any) => ({
      type: 'message',
      sender: message.sender,
      content: parseReadableStringFromHex(String(message.content)),
      timestamp: formatTimestamp(Number(message.timestamp)),
    }));

    const payments: Payment[] = paymentsResult.map((payment: any) => ({
      type: 'payment',
      sender: String(payment.sender),
      amount: Number(payment.amount),
      note: parseReadableStringFromHex(String(payment.note)),
      timestamp: formatTimestamp(Number(payment.timestamp)),
    }));

    const combinedItems: ConversationItem[] = [...messages, ...payments];

    // Sort the combined array by timestamp
    const sortedItems = combinedItems.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log("Sorted conversation items: ", sortedItems);
    return sortedItems;
  } catch (err) {
    console.error("Something went wrong:", err);
    return null;
  }
};