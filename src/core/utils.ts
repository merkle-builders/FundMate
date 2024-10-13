export const collapseAddress = (address: any): string => {
  if (address.length < 10) {
    return address;
  }
  if (typeof address === "string") {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  } else {
    console.error("Provided address is not a string:", address);
    return "";
  }
};

export const convertOctaToApt = (value: number) => {
  return value / 100000000;
};

export const convertAptToOcta = (transferAmount: number) => {
  return transferAmount * 10e7;
};

export const getAddressAsString = (address: any): any => {
  if (typeof address === "string") {
    return address; // It's already a string
  } else if (Array.isArray(address)) {
    return address[0] || ""; // Ensure the array has an element
  } else if (typeof address === "object" && address !== null) {
    const values = Object.values(address);
    if (typeof values[0] === "string") {
      return values[0] as string; // Return the first value as a string
    }
  }
  return ""; // Default fallback if address is not usable
};

export const loadStateFromLocalStorage = () => {
  try {
    if (typeof window !== "undefined") {
      const serializedState = localStorage.getItem("@aptos-connect/keyless-accounts");
      if (serializedState === null) return undefined;

      return JSON.parse(serializedState);
    }
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return undefined;
  }
};

export const getStoredAddress = (): string | undefined => {
  try {
    if (typeof window !== "undefined") {
      const storedAddress = localStorage.getItem("activeAccount");

      if (storedAddress) {
        return storedAddress;
      }
    }
  } catch (error) {
    console.error("Error parsing address:", error);
  }
  return undefined;
};

export const isValidWalletAddress = (address: string): boolean => {
  const walletAddressPattern = /^0x[a-fA-F0-9]{64}$/; // Ethereum-like address pattern
  return walletAddressPattern.test(address);
};

// Function to validate custom text format (e.g., xyz@fundmate)
export const isValidCustomText = (text: string): boolean => {
  const customTextPattern = /^[a-zA-Z0-9+_.-]+@fundmate$/;
  return customTextPattern.test(text);
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function parseReadableStringFromHex(hexStr: string) {
  hexStr = hexStr.slice(2);
  const hexValues = hexStr.split(",").map((part) => parseInt(part, 10));
  const byteArray = new Uint8Array(hexValues);
  const decoder = new TextDecoder();
  return decoder.decode(byteArray);
}

export const formatTimestamp = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
  const formattedDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short", // 'short' gives the 3-letter abbreviation of the month
    year: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedTime} ${formattedDate}`;
};