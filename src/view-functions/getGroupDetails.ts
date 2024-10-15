import { testnetClient } from "../core/constants";
import { parseReadableStringFromHex } from "@/core/utils";

// Define a type for the processed user data
type UserInfo = {
  address: string;
  username: string;
};

type ProcessedGroupInfo = {
  groupName: string;
  members: UserInfo[];
};

// Function to get group details
export async function getGroupDetails(groupCreator: string | undefined): Promise<ProcessedGroupInfo | null> {
  if (!groupCreator) {
    console.error("Group creator address is required");
    return null;
  }

  try {
    const result = await testnetClient.view({
      payload: {
        function: "0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev4::get_group_details",
        typeArguments: [],
        functionArguments: [groupCreator],
      },
    });

    console.log("getGroupDetails view is used");
    console.log("Raw result:", result);

    // Ensure the result is an array and has two elements
    if (Array.isArray(result) && result.length === 2) {
      const [rawGroupName, rawMembers] = result;

      // Check if rawGroupName is defined and is a string
      if (typeof rawGroupName !== "string") {
        console.error("Group name is undefined or not a string");
        return null;
      }

      // Parse the group name
      const groupName = parseReadableStringFromHex(rawGroupName);

      // Check if rawMembers is an array before mapping
      if (Array.isArray(rawMembers)) {
        const members = rawMembers.map((member: any) => ({
          address: member.address,
          username: member.user_name ? parseReadableStringFromHex(member.user_name) : "Unknown", // Provide a default value if undefined
        }));

        console.log("Processed group details:", { groupName, members });
        return { groupName, members };
      } else {
        console.error("Raw members is not an array or is undefined");
        return null;
      }
    } else {
      console.error("Unexpected data format received");
      return null;
    }
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
}
