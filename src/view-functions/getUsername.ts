import { testnetClient } from "../core/constants";
import { parseReadableStringFromHex } from "@/core/utils";
export const getUsername = async (accountAddress: string) => {
  try {
    console.log(`Attempting to get username for address: ${accountAddress}`);

    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev4::get_username",
        typeArguments: [],
        functionArguments: [accountAddress],
      },
    });

    if (!result || !Array.isArray(result) || result.length === 0 || typeof result[0] !== "string") {
      console.error("Invalid user name data received.");
      return null;
    }

    const decodedUserName = parseReadableStringFromHex(result[0] as string);
    console.log("User Name:", decodedUserName);

    return decodedUserName;
  } catch (err) {
    console.log("something went wrong:", err);
  }
};
