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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createId } from "@/entry-functions/createID";
import { getUsername } from "@/view-functions/getUsername";
import { getAllUsers } from "@/view-functions/getAllUsers";
import { getSentPayment, Payment } from "@/view-functions/getSentPayment";
import { sendPayment } from "@/entry-functions/sendPayment";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { VanishInput } from "@/components/ui/vanish-input";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import PaymentCard from "@/components/PaymentCard";
import { StarsBackground } from "@/components/ui/star-background";

const FundMateChat = ({}) => {
  const [selectedChat, setSelectedChat] = useState<null | string>(null);
  const [message, setMessage] = useState("");
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowPayModal, setIsShowPayModal] = useState<boolean>(false);
  const [userName, setUserName] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  // const [searchTerm, setSearchTerm] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentPayments, setSentPayments] = useState<Payment[] | null>();

  const { account, signAndSubmitTransaction, disconnect } = useWallet();
  const router = useRouter();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const users = await getAllUsers();
      setAllUsers(users);
      setFilteredUsers(users);
      console.log(typeof users[0].address);
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const getPayments = async () => {
      if (recipient) {
        try {
          const payment = await getSentPayment(account?.address, recipient);
          setSentPayments(payment);
          console.log("Sent Payments: ", sentPayments);
        } catch (error) {
          console.error("Failed to get payment:", error);
        }
      }
    };
    getPayments();
  }, [recipient, account?.address]); // Adding recipient to the dependency array

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    // setSearchTerm(term);
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
    console.log("Selected chat: ", selectedChat);
    const foundUser = filteredUsers.find((user) => user.address === selectedChat);
    if (foundUser) setRecipient(foundUser?.address);
    console.log("Recipient: ", recipient);
  }, [filteredUsers, selectedChat]); // Dependencies to trigger the effect when these change

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

      setIsShowPayModal(false);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("inside");
    e.preventDefault();
    if (message.trim()) {
      setChatMessages((prevMessages) => [...prevMessages, { role: "user", content: message }]);
      setMessage("");
    }
  };

  useEffect(() => {
    console.log(selectedChat);
  }, [selectedChat]);

  const handleDisconnect = async () => {
    await disconnect();
    router.push("/");
  };

  console.log("this is the recipient value:", recipient);

  return (
    <div className="flex h-screen bg-slate-800 overflow-hidden">
      {/* Main sidebar */}
      <div className="w-1/4 bg-slate-800 border-r border-gray-500 flex flex-col">
        <div className="p-3 border-b border-gray-500 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Menu className="w-6 h-6 text-gray-500 mr-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem className="hover:cursor-pointer" onClick={() => router.push("/application/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem>
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

        <div className="overflow-y-auto flex-grow">
          {filteredUsers
            .filter((user) => user.address !== account?.address) // Exclude the logged-in user
            .map((user) => (
              <div
                key={user.address}
                className={`p-4 hover:bg-slate-500 cursor-pointer transition-colors duration-200 ${
                  selectedChat === user.address ? "bg-slate-700" : ""
                }`}
                onClick={() => setSelectedChat(user.address)}
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
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-grow flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b bg-slate-800 border-gray-600 flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="w-10 h-10 rounded-full bg-blue-500 mr-3 hover:cursor-pointer"></div>
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
              {sentPayments && sentPayments.length > 0 && (
                <>
                  {sentPayments.map((payment, index) => (
                    <ChatBubble
                      className="mb-1 "
                      key={index}
                      variant={payment.sender === account?.address ? "sent" : "received"}
                    >
                      <ChatBubbleAvatar src="" fallback={payment.sender === account?.address ? "👦" : "👧"} />
                      <ChatBubbleMessage className="bg-slate-700 p-0">
                        <PaymentCard key={index} payment={payment} account={account?.address} />
                      </ChatBubbleMessage>
                    </ChatBubble>
                  ))}
                </>
              )}
              {chatMessages.map((msg, index) => (
                <ChatBubble key={index} variant={msg.role === "user" ? "sent" : "received"}>
                  <ChatBubbleAvatar src="" fallback={msg.role === "user" ? "👦" : "👧"} />
                  <ChatBubbleMessage>{msg.content}</ChatBubbleMessage>
                </ChatBubble>
              ))}
            </ChatMessageList>
            <div className="p-3 border-t bg-slate-800 border-gray-600">
              <div className="flex items-center">
                <div className="flex gap-4 mb-4">
                  <HoverBorderGradient
                    containerClassName="rounded-full"
                    as="button"
                    onClick={() => setIsShowPayModal(true)}
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                  >
                    Pay
                  </HoverBorderGradient>
                  <Button className="inline-flex h-11 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                    Request Payment
                  </Button>
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-grow px-4 py-2 rounded-full bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button type="submit" className="ml-2">
                  <Send className="w-6 h-6 text-blue-500 cursor-pointer" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-600">
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
    </div>
  );
};

export default FundMateChat;
