import { aptosClient } from "@/utils/aptosClient";

export const getMessageContent = async (): Promise<string> => {
  const content = await aptosClient()
    .view<[string]>({
      payload: {
        function: `0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::message_board::get_message_content`,
      },
    })
    .catch((error) => {
      console.error(error);
      return ["message not exist"];
    });

  return content[0];
};
