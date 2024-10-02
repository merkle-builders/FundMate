// import { AptosClient } from "aptos";

// const client = new AptosClient("https://fullnode.testnet.aptoslabs.com"); // Replace with the appropriate network

// export async function getUsername(accountAddress: string) {
//   try {
//     const result = await client.view({
//       function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::messaging_payment::get_username",
//       type_arguments: [],
//       arguments: [accountAddress],
//     });

//     // The result is a vector<u8>, so we need to convert it back to a string
//     const userNameBytes = result[0]; // result will be an array, first element is the username in bytes
//     const userName = new TextDecoder().decode(new Uint8Array(userNameBytes));

//     console.log("Username:", userName);
//     return userName;
//   } catch (error) {
//     console.error("Error retrieving username:", error);
//   }
// }
