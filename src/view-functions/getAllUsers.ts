import { testnetClient } from "../core/constants";

// Initialize the Aptos client

// Function to get all registered users with their usernames
export async function getAllUsers() {
  try {
    const allUsers = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev1::get_all_users",
        typeArguments: [],
        functionArguments: [],
      },
    });

    console.log("all user list:", allUsers);
    return allUsers;
    // The returned value is an array of UserInfo objects
    // return allUsers.map((user) => ({
    //   address: user.address,
    //   username: user.user_name,
    // }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}
