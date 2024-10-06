"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Send, Menu } from "lucide-react";
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
import { sendPayment } from "@/entry-functions/sendPayment";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";

const TelegramUI = ({ }) => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [isShowPayModal, setIsShowPayModal] = useState<boolean>(false);
  const [userName, setUserName] = useState("");
  const [isSearchList, setIsSearchList] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const { account, signAndSubmitTransaction, disconnect } = useWallet();
  const router = useRouter();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const allUsers = await getAllUsers();
      setIsSearchList([...isSearchList, ...allUsers]);
    };
    fetchAllUsers();
  }, []);

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
    console.log("inside")
    e.preventDefault();
    if (message.trim()) {
      setChatMessages((prevMessages) => [...prevMessages, { role: "user", content: message }]);
      setMessage("");
    }
  };

  useEffect(() => {
    console.log(selectedChat);
  }, [selectedChat])

  const chats = [
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "10:30 AM" },
    { id: 2, name: "Jane Smith", lastMessage: "Did you see the news?", time: "09:15 AM" },
    { id: 3, name: "Bob Johnson", lastMessage: "Let's meet tomorrow", time: "Yesterday" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Main sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center">
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
              <DropdownMenuItem onClick={() => disconnect()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Search className="absolute left-2 top-2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-y-auto flex-grow">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${selectedChat === chat.id ? "bg-blue-100" : ""
                }`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 mr-3"></div>
                <div className="flex-grow">
                  <h3 className="font-semibold">{chat.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-grow flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 mr-3"></div>
              <h2 className="font-semibold">{chats.find((chat) => chat.id === selectedChat)?.name}</h2>
            </div>
            <ChatMessageList ref={messagesRef} className="flex-grow p-4 overflow-y-auto">
              {chatMessages.map((msg, index) => (
                <ChatBubble key={index} variant={msg.role === "user" ? "sent" : "received"}>
                  <ChatBubbleAvatar src="" fallback={msg.role === "user" ? "👦" : "👧"} />
                  <ChatBubbleMessage>{msg.content}</ChatBubbleMessage>
                </ChatBubble>
              ))}
            </ChatMessageList>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex gap-4 mb-4">
                  <Button className="rounded-2xl" onClick={() => setIsShowPayModal(true)}>
                    Pay
                  </Button>
                  <Button className="rounded-2xl">Request Payment</Button>
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-grow px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button type="submit" className="ml-2">
                  <Send className="w-6 h-6 text-blue-500 cursor-pointer" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
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

export default TelegramUI;