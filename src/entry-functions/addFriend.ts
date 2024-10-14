import { MoveAddressType } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export type AddFriendArguments = {
  friendAddress: MoveAddressType; // Address of the friend to add
};

export const addFriend = (args: AddFriendArguments): InputTransactionData => {
  const { friendAddress } = args;

  // The address is passed as a hex string, no additional formatting needed
  const formattedFriendAddress = friendAddress; // Keep the hex string as-is

  // Prepare and return the transaction payload for adding a friend
  return {
    data: {
      function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev4::add_friend",
      functionArguments: [
        formattedFriendAddress, // Friend's address as a hex string
      ],
      typeArguments: [],
    },
  };
};
