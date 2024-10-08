import { testnetClient } from "../core/constants";
import { parseReadableStringFromHex } from "@/core/utils";

// Define a type for the processed user data
type ProcessedUserInfo = {
  address: string;
  username: string;
};

// Function to get all registered users with their usernames
export async function getAllUsers(): Promise<ProcessedUserInfo[]> {
  try {
    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev1::get_all_users",
        typeArguments: [],
        functionArguments: [],
      },
    });

    console.log("Raw result:", result);

    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      const processedUsers = result[0].map((user: any) => ({
        address: user.address,
        username: parseReadableStringFromHex(user.user_name),
      }));

      console.log("Processed user list:", processedUsers);
      return processedUsers;
    } else {
      console.error("Unexpected data format received");
      return [];
    }
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}
