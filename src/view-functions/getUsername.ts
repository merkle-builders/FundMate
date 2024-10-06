import { testnetClient } from "../core/constants";

export const getUsername = async (accountAddress: string) => {
  function parseUsernameFromAscii(asciiStr: string) {
    asciiStr = asciiStr.slice(2);

    const parts = asciiStr.split(",");

    return parts.map((part) => String.fromCharCode(parseInt(part))).join("");
  }

  try {
    console.log(`Attempting to get username for address: ${accountAddress}`);

    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev1::get_username",
        typeArguments: [],
        functionArguments: [accountAddress],
      },
    });

    console.log("Raw result from view function:", result);

    if (!result || !Array.isArray(result) || result.length === 0 || typeof result[0] !== "string") {
      console.error("Invalid user name data received.");
      return null;
    }

    const userNameHex = result[0] as string;
    console.log("Username in hex is:", userNameHex);

    const decodedUserName = parseUsernameFromAscii(userNameHex);
    console.log("User Name:", decodedUserName);

    return decodedUserName;
  } catch (err) {
    console.log("something went wrong:", err);
  }
};
