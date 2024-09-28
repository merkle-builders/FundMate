"use client"
import React, { useState } from 'react';
import { Search, Send, Paperclip, Mic, Menu, X, Settings, Bookmark, Phone, Moon } from 'lucide-react';

const TelegramUI = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chats = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?', time: '10:30 AM' },
    { id: 2, name: 'Jane Smith', lastMessage: 'Did you see the news?', time: '09:15 AM' },
    { id: 3, name: 'Bob Johnson', lastMessage: 'Let\'s meet tomorrow', time: 'Yesterday' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Main sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Menu className="w-6 h-6 text-gray-500 mr-4 cursor-pointer" onClick={toggleSidebar} />
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
              className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
                selectedChat === chat.id ? 'bg-blue-100' : ''
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
              <h2 className="font-semibold">{chats.find(chat => chat.id === selectedChat)?.name}</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
              {/* Messages would go here */}
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <Paperclip className="w-6 h-6 text-gray-500 mr-2 cursor-pointer" />
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-grow px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {message ? (
                  <Send className="w-6 h-6 text-blue-500 ml-2 cursor-pointer" />
                ) : (
                  <Mic className="w-6 h-6 text-gray-500 ml-2 cursor-pointer" />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Sliding sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Menu</h2>
          <X className="w-6 h-6 text-gray-500 cursor-pointer" onClick={toggleSidebar} />
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <Settings className="w-5 h-5 text-gray-500" />
              <span>Settings</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <Bookmark className="w-5 h-5 text-gray-500" />
              <span>Saved Messages</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>Calls</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <Moon className="w-5 h-5 text-gray-500" />
              <span>Night Mode</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default TelegramUI;