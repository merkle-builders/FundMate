"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createId } from "@/entry-functions/createID";
import { getUsername } from "@/view-functions/getUsername";
import { getAllUsers } from "@/view-functions/getAllUsers";
// import { getGroupDetails } from "@/view-functions/getGroupDetails";
import { getConversation, ConversationItem } from "@/view-functions/getConversation";
import { sendPayment } from "@/entry-functions/sendPayment";
import { sendMessage } from "@/entry-functions/sendMessage";
import { requestPayment } from "@/entry-functions/requestPayment";
import { createGroup } from "@/entry-functions/createGroup";
import { getGroups } from "@/view-functions/getGroups";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { VanishInput } from "@/components/ui/vanish-input";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import PaymentCard from "@/components/PaymentCard";
import { StarsBackground } from "@/components/ui/star-background";
import WriteIcon from "@/components/ui/icons/writeicon";
import AddUserIcon from "@/components/ui/icons/addUserIcon";

type ProcessedUserInfo = {
  address: string;
  username: string;
};

type ProcessedGroupInfo = {
  groupName: string;
  members: ProcessedUserInfo[];
};

const FundMateChat = ({}) => {
  const [selectedChat, setSelectedChat] = useState<null | string>(null);
  const [message, setMessage] = useState<string>("");
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowPayModal, setIsShowPayModal] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isShowRequestModal, setIsShowRequestModal] = useState<boolean>(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[] | null>();
  const [isChatListHover, setIsChatListHover] = useState<boolean>(false);
  const [isShowGroupModal, setIsShowGroupModal] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [groupInformation, setGroupInformation] = useState<ProcessedGroupInfo[] | null>(null);
  // const [groupData, setGroupData] = useState<ProcessedGroupInfo | null>(null);
  const [isShowAddMember, setIsShowAddMember] = useState<boolean>(false);

  const groupArray = Array.isArray(groupInformation) ? groupInformation : [groupInformation];

  const { account, signAndSubmitTransaction, disconnect } = useWallet();
  const router = useRouter();
  const messagesRef = useRef<HTMLDivElement>(null);

  console.log("selected chat is:", selectedChat);
  useEffect(() => {
    const fetchAllUsers = async () => {
      const users = await getAllUsers();
      setAllUsers(users);
      setFilteredUsers(users);
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const getConvo = async () => {
      if (selectedChat && isUser) {
        try {
          const convo = await getConversation(account?.address, selectedChat);
          setConversation(convo);
          console.log("Sorted Conversation: ", conversation);
        } catch (e) {
          console.log("Failed to get conversation: ", e);
        }
      } else if (isGroup) {
        try {
          // const groupconvo =
        } catch (e) {}
      }
    };
    getConvo();
  }, [account?.address, selectedChat]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    const filtered = allUsers.filter(
      (user) => user.username.toLowerCase().includes(term) || user.address.toLowerCase().includes(term),
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    const fetchUsername = async () => {
      if (account) {
        const fetchedUsername = await getUsername(account?.address);
        setUserName(fetchedUsername ?? "");
        setIsShowModal(!fetchedUsername);
      }
    };

    fetchUsername();
  }, [account]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const foundUser = filteredUsers.find((user) => user.address === selectedChat);
    if (foundUser) setRecipient(foundUser?.address);
  }, [filteredUsers, selectedChat]); // Dependencies to trigger the effect when these change

  useEffect(() => {
    const fetchAllGroups = async () => {
      const groups = await getGroups(account?.address);
      setGroupInformation(groups);
    };
    fetchAllGroups();
    console.log("Group information is:", getGroups);
  }, []);

  const handleCreateProfile = async () => {
    if (!userName) {
      alert("Please enter a username");
      return;
    }

    try {
      const transaction = createId({ userName });
      const result = await signAndSubmitTransaction(transaction);
      console.log("Transaction submitted:", result);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const handleSendPayment = async () => {
    if (!recipient || !amount) {
      alert("Please fill in all the required fields");
      return;
    }

    try {
      setLoading(true);
      const paymentData = sendPayment({
        recipient,
        amount: parseInt(amount, 10),
        note,
      });

      const result = await signAndSubmitTransaction(paymentData);
      console.log("Payment successful:", result);

      // After successful payment, update the conversation
      await updateConversation();
      setIsShowPayModal(false);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreation = async () => {
    try {
      const newGroup = createGroup({ groupName: groupName });
      const result = await signAndSubmitTransaction(newGroup);
      console.log("Group creation request is:", result);

      // After successful group creation, fetch all groups again
      fetchAllGroups();
      setIsShowGroupModal(false);
    } catch (error) {
      console.log("Group creation failed", error);
    }
  };

  const fetchAllGroups = async () => {
    const groups = await getGroups(account?.address);
    setGroupInformation(groups);
  };

  const updateConversation = async () => {
    if (selectedChat && isUser) {
      try {
        const convo = await getConversation(account?.address, selectedChat);
        setConversation(convo);
      } catch (e) {
        console.log("Failed to update conversation: ", e);
      }
    }
  };

  useEffect(() => {
    fetchAllGroups();
  }, [account?.address]);

  const handleRequestPayment = async () => {
    if (!selectedChat || !requestAmount) {
      alert("Please fill in all the required fields");
      return;
    }

    try {
      setLoading(true);
      const requestData = requestPayment({
        requesteeAddress: selectedChat,
        amount: parseInt(requestAmount, 10),
        note: requestNote,
      });

      const result = await signAndSubmitTransaction(requestData);
      console.log("Payment request sent:", result);

      setIsShowRequestModal(false);
    } catch (error) {
      console.error("Payment request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message || !selectedChat) {
      alert("Please select a chat and type a message");
      return;
    }
    if (message.trim()) {
      try {
        setLoading(true);
        const messageData = sendMessage({
          recipientAddress: selectedChat,
          messageContent: message,
        });

        const result = await signAndSubmitTransaction(messageData);
        console.log("Message sent:", result);
        await updateConversation();
        setChatMessages((prevMessages) => [...prevMessages, { role: "user", content: message }]);
        setMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
        alert("Failed to send message. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log(selectedChat);
  }, [selectedChat]);

  const handleDisconnect = async () => {
    await disconnect();
    router.push("/");
  };

  console.log("selected group is:", groupArray);

  return (
    <div className="flex h-screen bg-slate-800 overflow-hidden">
      {/* Main sidebar */}
      <div className="w-1/4 bg-slate-800 border-r border-gray-500 flex flex-col">
        <div className="p-3 border-b border-gray-500 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Menu className="w-6 h-6 text-gray-500 mr-4 cursor-pointer hover:text-gray-300 transition-colors duration-200" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem className="hover:cursor-pointer" onClick={() => router.push("/application/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:cursor-pointer" onClick={() => handleDisconnect()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-grow">
            <VanishInput
              placeholders={["Search your Mate", "enter username"]}
              // value={searchTerm}
              onChange={handleSearch}
              onSubmit={() => console.log("search submit")}
            />
            {/* <Search className="absolute left-2 top-2 w-5 h-5 text-gray-400" /> */}
          </div>
        </div>

        <div
          className="flex flex-col h-full relative overflow-x-hidden"
          onMouseEnter={() => setIsChatListHover(true)}
          onMouseLeave={() => setIsChatListHover(false)}
        >
          <div className="overflow-y-auto flex-grow">
            <div className="relative h-full">
              {groupArray &&
                groupArray.map(
                  (group, index) =>
                    group && (
                      <div
                        key={index}
                        className={`p-4 hover:bg-slate-500 cursor-pointer transition-all duration-200 ${
                          selectedChat === groupName ? "bg-slate-700" : ""
                        } transform hover:scale-105`}
                        onClick={() => {
                          setSelectedChat(groupName);
                          setIsUser(false);
                          setIsGroup(true);
                        }}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500 mr-3"></div>
                          <div className="flex-grow">
                            <h2>{group.groupName}</h2>
                            <p className="text-sm text-gray-200 truncate">0 Members</p>
                          </div>
                        </div>
                      </div>
                    ),
                )}
              {filteredUsers
                .filter((user) => user.address !== account?.address) // Exclude the logged-in user
                .map((user) => (
                  <div
                    key={user.address}
                    className={`p-4 hover:bg-slate-500 cursor-pointer transition-all duration-200 ${
                      selectedChat === user.address ? "bg-slate-700" : ""
                    } transform hover:scale-105`}
                    onClick={() => {
                      setSelectedChat(user.address);
                      setIsGroup(false);
                      setIsUser(true);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 mr-3"></div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{user.username}</h3>
                        <p className="text-sm text-gray-200 truncate">
                          {user.address.slice(0, 10) + "...." + user.address.slice(-7)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              <div className="absolute bottom-0 right-0 p-4">
                {" "}
                {/* Update this line */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger>
                        <DropdownMenuTrigger asChild>
                          <div
                            className={`cursor-pointer rounded-full bg-blue-500 p-2 transition-all duration-300 ${
                              isChatListHover || dropdownOpen ? "opacity-100 scale-110" : "opacity-20 scale-100"
                            }`}
                          >
                            <WriteIcon />
                          </div>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Actions</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent className="w-36">
                    <DropdownMenuItem onClick={() => setIsShowGroupModal(true)} className="hover:cursor-pointer">
                      Create Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chat area */}
      <div className={`flex-grow flex ${selectedChat === groupName ? "flex-row" : "flex-col"}`}>
        {selectedChat === groupName ? (
          <>
            <div className="w-3/4">
              <ChatMessageList
                ref={messagesRef}
                className="flex-grow justify-end bg-slate-950 overflow-y-auto h-full w-full p-0"
              >
                {conversation && conversation.length > 0 && (
                  <>
                    {conversation.map((convo, index) => (
                      <ChatBubble
                        className="mb-1 animate-fadeIn"
                        key={index}
                        variant={convo.sender === account?.address ? "sent" : "received"}
                      >
                        <ChatBubbleAvatar src="" fallback={convo.sender === account?.address ? "👦" : "👧"} />
                        <ChatBubbleMessage className={`${convo.type === "payment" ? "bg-slate-700 p-0" : ""}`}>
                          {convo.type === "payment" ? (
                            <PaymentCard key={index} payment={convo} account={account?.address} />
                          ) : (
                            <>{convo.content}</>
                          )}
                        </ChatBubbleMessage>
                      </ChatBubble>
                    ))}
                  </>
                )}
                <div className=" p-3 border-t bg-slate-800 border-gray-600">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a message..."
                      className="flex-grow px-4 py-2 rounded-full bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <Button type="submit" className="ml-2 transition-transform duration-200 hover:scale-110">
                      <Send className="w-6 h-6 text-blue-500 cursor-pointer" />
                    </Button>
                  </form>
                </div>
              </ChatMessageList>
            </div>

            <div className="flex flex-col h-full w-1/4">
              <div className="flex flex-col p-3 border-t bg-slate-800 border-gray-600">
                <h1 className="text-slate-200 text-center">Group Members</h1>
                <div className="flex justify-end">
                  <div className="flex gap-4 mb-4 mt-[870px]">
                    <div className="flex items-end justify-end">
                      <TooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger>
                            <div
                              onClick={() => {
                                setIsShowAddMember(true);
                              }}
                              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 mr-3 hover:bg-blue-400 transition-all duration-300 cursor-pointer transform hover:scale-110"
                            >
                              <AddUserIcon />
                            </div>
                            <TooltipContent>
                              <p>Add Members</p>
                            </TooltipContent>
                          </TooltipTrigger>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : filteredUsers.find((user) => user.address === selectedChat)?.username ? (
          <>
            <div className="p-4 border-b bg-slate-800 border-gray-600 flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="w-10 h-10 rounded-full bg-blue-500 mr-3 hover:cursor-pointer transition-transform duration-200 hover:scale-110"></div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel></DropdownMenuLabel>
                  <DropdownMenuItem
                    className="hover:cursor-pointer"
                    onClick={() => router.push(`/application/profile?address=${selectedChat}`)}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:cursor-pointer">Add as Friend</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </DropdownMenuContent>
              </DropdownMenu>

              <h2 className="font-semibold text-white">
                {filteredUsers.find((user) => user.address === selectedChat)?.username || "Unknown User"}
              </h2>
            </div>
            <ChatMessageList ref={messagesRef} className="flex-grow bg-slate-950 p-4 w-full overflow-y-auto">
              {conversation && conversation.length > 0 && (
                <>
                  {conversation.map((convo, index) => (
                    <ChatBubble
                      className="mb-1 animate-fadeIn"
                      key={index}
                      variant={convo.sender === account?.address ? "sent" : "received"}
                    >
                      <ChatBubbleAvatar src="" fallback={convo.sender === account?.address ? "👦" : "👧"} />
                      <ChatBubbleMessage className={`${convo.type === "payment" ? "bg-slate-700 p-0" : ""}`}>
                        {convo.type === "payment" ? (
                          <PaymentCard key={index} payment={convo} account={account?.address} />
                        ) : (
                          <>{convo.content}</>
                        )}
                      </ChatBubbleMessage>
                    </ChatBubble>
                  ))}
                </>
              )}
            </ChatMessageList>
            <div className="p-3 border-t bg-slate-800 border-gray-600">
              <div className="flex items-center">
                <div className="flex gap-4 mb-4">
                  <HoverBorderGradient
                    containerClassName="rounded-full"
                    as="button"
                    onClick={() => setIsShowPayModal(true)}
                      className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 transition-transform duration-200 "
                  >
                    Pay
                  </HoverBorderGradient>
                  <Button
                      className="inline-flex h-11 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:bg-[length:300%_100%]"
                    onClick={() => setIsShowRequestModal(true)}
                  >
                    Request Payment
                  </Button>
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                    className="flex-grow px-4 py-2 rounded-full bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                />
                  <Button type="submit" className="ml-2 transition-transform duration-200 hover:scale-105">
                  <Send className="w-6 h-6 text-blue-500 cursor-pointer" />
                </Button>
              </form>
            </div>
          </>
        ) : (
              <div className="flex-grow flex items-center justify-center text-gray-600 animate-pulse">
            Select a chat to start messaging
          </div>
        )}
        <StarsBackground className="pointer-events-none" />
      </div>
      {/* Modal Popup for username Setup */}
      <Dialog open={isShowModal}>
        <DialogContent setIsShowModal={setIsShowModal} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                id="username"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateProfile}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal for Payment */}
      <Dialog open={isShowPayModal}>
        <DialogContent setIsShowModal={setIsShowPayModal} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send a Payment</DialogTitle>
            <DialogDescription>Complete the payment details and confirm the transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                Recipient
              </Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                id="recipient"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                id="amount"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} id="note" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSendPayment} disabled={loading}>
              {loading ? "Sending..." : "Send Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal for Payment Request */}
      <Dialog open={isShowRequestModal}>
        <DialogContent setIsShowModal={setIsShowRequestModal} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request a Payment</DialogTitle>
            <DialogDescription>Enter the payment request details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requestAmount" className="text-right">
                Amount
              </Label>
              <Input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                id="requestAmount"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requestNote" className="text-right">
                Note
              </Label>
              <Input
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                id="requestNote"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleRequestPayment} disabled={loading}>
              {loading ? "Sending Request..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal for Group creation */}
      <Dialog open={isShowGroupModal}>
        <DialogContent setIsShowModal={setIsShowGroupModal} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Group Creation</DialogTitle>
            <DialogDescription>Enter your Group description</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requestAmount" className="text-right">
                Group Name
              </Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                id="groupName"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleGroupCreation} disabled={loading}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for adding members */}
      <Dialog open={isShowAddMember}>
        <DialogContent setIsShowModal={setIsShowAddMember} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Group members</DialogTitle>
            <DialogDescription>Search for members to add</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className=" items-center gap-4">
              <Label htmlFor="requestAmount" className="text-right">
                User Name
              </Label>
              <div className="flex w-full mt-2">
                <Input
                  placeholder={"Find users"}
                  // value={searchTerm}
                  onChange={handleSearch}
                  onSubmit={() => console.log("search submit")}
                />
              </div>
            </div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FundMateChat;
