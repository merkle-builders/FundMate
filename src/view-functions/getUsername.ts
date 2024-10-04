import { testnetClient } from "../core/constants";

export const getUsername = async (accountAddress: string) => {

  // Step 1: Convert hex string to readable string (e.g., "0x109,105,104,105,114")
  function hexToAsciiString(hex: string) {
    // Remove the '0x' prefix if present
    hex = hex.replace(/^0x/, '');

    // Convert hex-encoded string to a regular ASCII string
    let asciiStr = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      asciiStr += String.fromCharCode(charCode);
    }

    return asciiStr;
  }

  // Step 2: Convert the comma-separated decimal string to an actual username
  function parseUsernameFromAscii(asciiStr: string) {
    // Split by commas
    const parts = asciiStr.split(',');

    // Convert each part from decimal to an ASCII character
    return parts.map((part) => String.fromCharCode(parseInt(part))).join('');
  }

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
    console.log("Username in hex is:", userNameHex);

    // Step 1: Convert hex to ASCII string (e.g., "0x109,105,104,105,114")
    const asciiString = hexToAsciiString(userNameHex);
    console.log("Decoded ASCII string:", asciiString);

    // Step 2: Parse the actual username from the ASCII string
    const decodedUserName = parseUsernameFromAscii(asciiString.slice(2));
    console.log("User Name:", decodedUserName);

    return decodedUserName;
  } catch (err) {
    console.log("something went wrong:", err);
  }
};
