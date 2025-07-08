"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Menu, X } from "lucide-react";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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

  const handleChatSelect = (chatId: string, isGroupChat: boolean) => {
    setSelectedChat(chatId);
    setIsGroup(isGroupChat);
    setIsUser(!isGroupChat);
    // Close mobile sidebar when a chat is selected
    setIsMobileSidebarOpen(false);
  };

  console.log("selected group is:", groupArray);

  return (
    <div className="flex h-screen bg-slate-800 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-gray-500 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-gray-300"
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        {selectedChat && (
          <h2 className="text-white font-semibold truncate">
            {isUser 
              ? filteredUsers.find((user) => user.address === selectedChat)?.username || "Unknown User"
              : groupName || "Group Chat"
            }
          </h2>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="w-6 h-6 text-gray-300" />
            </Button>
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
      </div>

      {/* Sidebar */}
      <div className={`
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative
        fixed inset-y-0 left-0 z-40
        w-full sm:w-80 md:w-1/4 
        bg-slate-800 border-r border-gray-500 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'pt-16' : 'pt-0'}
        md:pt-0
      `}>
        {/* Desktop Header */}
        <div className="hidden md:block p-3 border-b border-gray-500 flex items-center">
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
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden p-3 border-b border-gray-500">
          <VanishInput
            placeholders={["Search your Mate", "enter username"]}
            onChange={handleSearch}
            onSubmit={() => console.log("search submit")}
          />
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
                        onClick={() => handleChatSelect(groupName, true)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-500 mr-3 flex-shrink-0"></div>
                          <div className="flex-grow min-w-0">
                            <h2 className="truncate">{group.groupName}</h2>
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
                    onClick={() => handleChatSelect(user.address, false)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 mr-3 flex-shrink-0"></div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold truncate">{user.username}</h3>
                        <p className="text-sm text-gray-200 truncate">
                          {user.address.slice(0, 6) + "...." + user.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              <div className="absolute bottom-0 right-0 p-4">
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

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Chat area */}
      <div className={`flex-grow flex ${selectedChat === groupName ? "flex-col lg:flex-row" : "flex-col"} pt-16 md:pt-0`}>
        {selectedChat === groupName ? (
          <>
            <div className="flex-grow lg:w-3/4">
              <ChatMessageList
                ref={messagesRef}
                className="flex-grow justify-end bg-slate-950 overflow-y-auto h-full w-full p-0"
              >
                {conversation && conversation.length > 0 && (
                  <>
                    {conversation.map((convo, index) => (
                      <ChatBubble
                        className="mb-1 animate-fadeIn mx-2 sm:mx-4"
                        key={index}
                        variant={convo.sender === account?.address ? "sent" : "received"}
                      >
                        <ChatBubbleAvatar src="" fallback={convo.sender === account?.address ? "👦" : "👧"} />
                        <ChatBubbleMessage className={`${convo.type === "payment" ? "bg-slate-700 p-0" : ""} max-w-[80%] sm:max-w-none`}>
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
                <div className="p-3 border-t bg-slate-800 border-gray-600">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a message..."
                      className="flex-grow px-3 py-2 text-sm sm:px-4 sm:text-base rounded-full bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <Button type="submit" size="sm" className="transition-transform duration-200 hover:scale-110 p-2">
                      <Send className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
                    </Button>
                  </form>
                </div>
              </ChatMessageList>
            </div>

            <div className="flex flex-col h-auto lg:h-full lg:w-1/4 border-t lg:border-t-0 lg:border-l border-gray-600">
              <div className="flex flex-col p-3 bg-slate-800">
                <h1 className="text-slate-200 text-center text-sm sm:text-base">Group Members</h1>
                <div className="flex justify-center lg:justify-end mt-4">
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger>
                        <div
                          onClick={() => setIsShowAddMember(true)}
                          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 hover:bg-blue-400 transition-all duration-300 cursor-pointer transform hover:scale-110"
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
          </>
        ) : filteredUsers.find((user) => user.address === selectedChat)?.username ? (
          <>
            {/* Desktop Header */}
            <div className="hidden md:block p-4 border-b bg-slate-800 border-gray-600 flex items-center">
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

            <ChatMessageList ref={messagesRef} className="flex-grow bg-slate-950 p-2 sm:p-4 w-full overflow-y-auto">
              {conversation && conversation.length > 0 && (
                <>
                  {conversation.map((convo, index) => (
                    <ChatBubble
                      className="mb-1 animate-fadeIn"
                      key={index}
                      variant={convo.sender === account?.address ? "sent" : "received"}
                    >
                      <ChatBubbleAvatar src="" fallback={convo.sender === account?.address ? "👦" : "👧"} />
                      <ChatBubbleMessage className={`${convo.type === "payment" ? "bg-slate-700 p-0" : ""} max-w-[85%] sm:max-w-none`}>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  <HoverBorderGradient
                    containerClassName="rounded-full flex-1 sm:flex-none"
                    as="button"
                    onClick={() => setIsShowPayModal(true)}
                      className="dark:bg-black bg-white text-black dark:text-white flex items-center justify-center space-x-2 transition-transform duration-200 text-sm px-3 py-2"
                  >
                    Pay
                  </HoverBorderGradient>
                  <Button
                      className="flex-1 sm:flex-none inline-flex h-9 sm:h-11 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-4 sm:px-6 font-medium text-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:bg-[length:300%_100%] text-xs sm:text-sm"
                    onClick={() => setIsShowRequestModal(true)}
                  >
                    Request
                  </Button>
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                    className="flex-grow px-3 py-2 text-sm sm:px-4 sm:text-base rounded-full bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-300"
                />
                  <Button type="submit" size="sm" className="transition-transform duration-200 hover:scale-105 p-2">
                  <Send className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
                </Button>
              </form>
            </div>
          </>
        ) : (
              <div className="flex-grow flex items-center justify-center text-gray-600 animate-pulse p-4 text-center">
            Select a chat to start messaging
          </div>
        )}
        <StarsBackground className="pointer-events-none" />
      </div>

      {/* Modal Popup for username Setup */}
      <Dialog open={isShowModal}>
        <DialogContent setIsShowModal={setIsShowModal} className="sm:max-w-[425px] mx-4 max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit profile</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="username" className="sm:text-right text-sm sm:text-base">
                Username
              </Label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                id="username"
                className="sm:col-span-3 text-sm sm:text-base"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateProfile} className="w-full sm:w-auto text-sm sm:text-base">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for Payment */}
      <Dialog open={isShowPayModal}>
        <DialogContent setIsShowModal={setIsShowPayModal} className="sm:max-w-[425px] mx-4 max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Send a Payment</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Complete the payment details and confirm the transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="recipient" className="sm:text-right text-sm sm:text-base">
                Recipient
              </Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                id="recipient"
                className="sm:col-span-3 text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="amount" className="sm:text-right text-sm sm:text-base">
                Amount
              </Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                id="amount"
                className="sm:col-span-3 text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="note" className="sm:text-right text-sm sm:text-base">
                Note
              </Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} id="note" className="sm:col-span-3 text-sm sm:text-base" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSendPayment} disabled={loading} className="w-full sm:w-auto text-sm sm:text-base">
              {loading ? "Sending..." : "Send Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for Payment Request */}
      <Dialog open={isShowRequestModal}>
        <DialogContent setIsShowModal={setIsShowRequestModal} className="sm:max-w-[425px] mx-4 max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Request a Payment</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Enter the payment request details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="requestAmount" className="sm:text-right text-sm sm:text-base">
                Amount
              </Label>
              <Input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                id="requestAmount"
                className="sm:col-span-3 text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="requestNote" className="sm:text-right text-sm sm:text-base">
                Note
              </Label>
              <Input
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                id="requestNote"
                className="sm:col-span-3 text-sm sm:text-base"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleRequestPayment} disabled={loading} className="w-full sm:w-auto text-sm sm:text-base">
              {loading ? "Sending Request..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for Group creation */}
      <Dialog open={isShowGroupModal}>
        <DialogContent setIsShowModal={setIsShowGroupModal} className="sm:max-w-[425px] mx-4 max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Group Creation</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Enter your Group description</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="groupName" className="sm:text-right text-sm sm:text-base">
                Group Name
              </Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                id="groupName"
                className="sm:col-span-3 text-sm sm:text-base"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleGroupCreation} disabled={loading} className="w-full sm:w-auto text-sm sm:text-base">
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for adding members */}
      <Dialog open={isShowAddMember}>
        <DialogContent setIsShowModal={setIsShowAddMember} className="sm:max-w-[425px] mx-4 max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add Group members</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Search for members to add</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-2 sm:gap-4">
              <Label htmlFor="userName" className="text-sm sm:text-base">
                User Name
              </Label>
              <div className="flex w-full mt-2">
                <Input
                  placeholder={"Find users"}
                  onChange={handleSearch}
                  onSubmit={() => console.log("search submit")}
                  className="text-sm sm:text-base"
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
