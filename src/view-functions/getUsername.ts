import { MoveValue } from "@aptos-labs/ts-sdk";
import { testnetClient } from "../core/constants";

export const getUsername = async (accountAddress: string) => {
  try {
    console.log(`Attempting to get username for address: ${accountAddress}`);

    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::messaging_payment::get_username",
        typeArguments: [],
        functionArguments: [accountAddress],
      },
    });

    console.log("Raw result from view function:", result);

    // Ensure result is an array with a single element
    if (!result || !Array.isArray(result) || result.length === 0 || typeof result[0] !== "string") {
      console.error("Invalid user name data received.");
      return null;
    }

    const userNameHex = result[0] as string;
    console.log("username in hex is:", userNameHex);

    // Remove the '0x' prefix
    const hexWithoutPrefix = userNameHex.slice(2);
    console.log("usernamehexeprefix:", hexWithoutPrefix);
    const byteValues = hexWithoutPrefix.split(",").map(Number); // Convert the string numbers to an array of numbers
    console.log("value in bytes:", byteValues);
    // Convert the array of numbers to a string
    const decodedUserName = byteValues.map((byte) => String.fromCharCode(byte)).join("");

    console.log("User Name:", decodedUserName);
    return decodedUserName;
  } catch (err) {
    console.log("something gone wrong:", err);
  }
};
