"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Linechart } from "@/components/ui/linechart";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Wallet, 
  Edit3, 
  Copy, 
  Check, 
  MessageCircle, 
  Send, 
  TrendingUp,
  Users,
  Award,
  Activity,
  DollarSign,
  Eye,
  EyeOff,
  Settings,
  Share2,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, useSearchParams } from "next/navigation";
import { getUsername } from "@/view-functions/getUsername";
import { getAccountAPTBalance } from "@/view-functions/getAccountBalance";
import { getAllUsers } from "@/view-functions/getAllUsers";
import { getGroups } from "@/view-functions/getGroups";
import { getSentPayment } from "@/view-functions/getSentPayment";
import { getConversation } from "@/view-functions/getConversation";
import { motion } from "framer-motion";
import { StarsBackground } from "@/components/ui/star-background";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

interface ProfileStats {
  totalTransactions: number;
  totalSent: string;
  totalReceived: string;
  friendsCount: number;
  groupsCount: number;
  accountBalance: string;
  joinedDate: string;
}

interface RecentActivity {
  type: 'payment' | 'receive' | 'message' | 'group';
  action: string;
  time: string;
  timestamp: number;
}

// Create a separate component for the content that uses useSearchParams
const ProfileContent = () => {
  const { account } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [profileAddress, setProfileAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [editedUsername, setEditedUsername] = useState("");
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalTransactions: 0,
    totalSent: "0 APT",
    totalReceived: "0 APT", 
    friendsCount: 0,
    groupsCount: 0,
    accountBalance: "0 APT",
    joinedDate: "2024"
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Achievement logic based on real stats
  const getAchievements = (stats: ProfileStats) => {
    const achievements = [];
    
    if (stats.totalTransactions >= 100) {
      achievements.push({ 
        name: "Transaction Master", 
        icon: "💰", 
        description: `Completed ${stats.totalTransactions}+ transactions` 
      });
    }
    
    if (stats.friendsCount >= 10) {
      achievements.push({ 
        name: "Social Butterfly", 
        icon: "🦋", 
        description: `Connected with ${stats.friendsCount}+ users` 
      });
    }
    
    if (stats.groupsCount >= 1) {
      achievements.push({ 
        name: "Group Member", 
        icon: "👥", 
        description: `Active in ${stats.groupsCount} group${stats.groupsCount > 1 ? 's' : ''}` 
      });
    }
    
    if (parseFloat(stats.totalSent.replace(' APT', '')) >= 50) {
      achievements.push({ 
        name: "Big Spender", 
        icon: "🚀", 
        description: "Sent over 50 APT total" 
      });
    }

    // Add default achievement if no others qualify
    if (achievements.length === 0) {
      achievements.push({ 
        name: "Getting Started", 
        icon: "🌟", 
        description: "Welcome to FundMate!" 
      });
    }
    
    return achievements;
  };

  useEffect(() => {
    const addressParam = searchParams.get("address");
    if (addressParam) {
      setProfileAddress(addressParam);
    } else if (account) {
      setProfileAddress(account.address);
    }
  }, [searchParams, account]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (profileAddress) {
        setLoading(true);
        const fetchedUsername = await getUsername(profileAddress);
        const name = fetchedUsername ?? "";
        setUsername(name);
        setEditedUsername(name);
        setLoading(false);
      }
    };

    fetchUsername();
  }, [profileAddress]);

  // Fetch all profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profileAddress) return;
      
      setDataLoading(true);
      try {
        // Fetch all data in parallel
        const [
          balance,
          allUsers,
          userGroups,
          // We'll fetch activity from multiple users for demo
        ] = await Promise.all([
          getAccountAPTBalance({ accountAddress: profileAddress }),
          getAllUsers(),
          getGroups(profileAddress),
        ]);

        // Calculate friends count (users who aren't the current user)
        const friendsCount = allUsers.filter(user => user.address !== profileAddress).length;

        // Calculate groups count
        const groupsCount = userGroups?.length || 0;

        // Fetch payment data from all users to calculate sent/received
        let totalSent = 0;
        let totalReceived = 0;
        let transactionCount = 0;
        const activities: RecentActivity[] = [];

        // Fetch sent payments to all users
        for (const user of allUsers.slice(0, 5)) { // Limit to prevent too many requests
          if (user.address !== profileAddress) {
            try {
              const sentPayments = await getSentPayment(profileAddress, user.address);
              const receivedPayments = await getSentPayment(user.address, profileAddress);
              
              if (sentPayments) {
                sentPayments.forEach(payment => {
                  totalSent += payment.amount / 100000000; // Convert from octas to APT
                  transactionCount++;
                  activities.push({
                    type: 'payment',
                    action: `Sent ${(payment.amount / 100000000).toFixed(2)} APT to ${user.username}`,
                    time: payment.timestamp,
                    timestamp: new Date(payment.timestamp).getTime()
                  });
                });
              }
              
              if (receivedPayments) {
                receivedPayments.forEach(payment => {
                  totalReceived += payment.amount / 100000000; // Convert from octas to APT
                  transactionCount++;
                  activities.push({
                    type: 'receive',
                    action: `Received ${(payment.amount / 100000000).toFixed(2)} APT from ${user.username}`,
                    time: payment.timestamp,
                    timestamp: new Date(payment.timestamp).getTime()
                  });
                });
              }

              // Fetch conversation for recent messages
              const conversation = await getConversation(profileAddress, user.address);
              if (conversation) {
                conversation.slice(-2).forEach(item => {
                  if (item.type === 'message') {
                    activities.push({
                      type: 'message',
                      action: `${item.sender === profileAddress ? 'Sent' : 'Received'} message ${item.sender === profileAddress ? 'to' : 'from'} ${user.username}`,
                      time: item.timestamp,
                      timestamp: new Date(item.timestamp).getTime()
                    });
                  }
                });
              }
            } catch (error) {
              console.log(`Error fetching data for user ${user.address}:`, error);
            }
          }
        }

        // Add group activities
        if (userGroups) {
          userGroups.forEach(group => {
            activities.push({
              type: 'group',
              action: `Member of '${group.groupName}' group`,
              time: new Date().toISOString(),
              timestamp: Date.now()
            });
          });
        }

        // Sort activities by timestamp and take the most recent 5
        const sortedActivities = activities
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)
          .map(activity => ({
            ...activity,
            time: getRelativeTime(activity.timestamp)
          }));

        const stats: ProfileStats = {
          totalTransactions: transactionCount,
          totalSent: `${totalSent.toFixed(2)} APT`,
          totalReceived: `${totalReceived.toFixed(2)} APT`,
          friendsCount: Math.max(friendsCount - 1, 0), // Subtract 1 to exclude self, minimum 0
          groupsCount,
          accountBalance: `${(balance / 100000000).toFixed(4)} APT`,
          joinedDate: new Date().getFullYear().toString() // Could be enhanced with actual join date
        };

        setProfileStats(stats);
        setRecentActivity(sortedActivities);

      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfileData();
  }, [profileAddress]);

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSaveEdit = () => {
    setUsername(editedUsername);
    setIsEditing(false);
    // Here you would typically make an API call to update the username
  };

  const isOwnProfile = profileAddress === account?.address;
  const achievements = getAchievements(profileStats);

  const StatCard = ({ icon: Icon, label, value, color, isLoading }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Loading...</span>
            </div>
          ) : (
            <p className="text-lg font-semibold text-white">{value}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const AchievementBadge = ({ achievement }: any) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
    >
      <div className="text-center">
        <div className="text-2xl mb-2">{achievement.icon}</div>
        <h4 className="font-semibold text-sm text-white mb-1">{achievement.name}</h4>
        <p className="text-xs text-gray-400">{achievement.description}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black relative">
      <StarsBackground className="absolute inset-0 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="mb-6 text-gray-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-4">
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative inline-block mb-4"
                    >
                      <Avatar className="w-24 h-24 border-4 border-blue-500/30">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                          {loading ? "..." : username.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isOwnProfile && (
                        <Button
                          size="sm"
                          className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>

                    {/* Username */}
                    <div className="mb-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            className="text-center bg-slate-800 border-slate-600"
                          />
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <h1 className="text-2xl font-bold text-white">
                            {loading ? "Loading..." : username || "Unknown User"}
                          </h1>
                          {isOwnProfile && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setIsEditing(true)}
                              className="p-1 h-auto text-gray-400 hover:text-white"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      <p className="text-gray-400 text-sm">Joined {profileStats.joinedDate}</p>
                    </div>

                    {/* Address */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm text-gray-300">
                          {profileAddress ? `${profileAddress.slice(0, 6)}...${profileAddress.slice(-6)}` : ""}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(profileAddress)}
                          className="p-1 h-auto"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="mb-6">
                      <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Account Balance</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBalanceVisible(!balanceVisible)}
                            className="p-1 h-auto"
                          >
                            {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                        </div>
                        {dataLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-white">
                            {balanceVisible ? profileStats.accountBalance : "••••••"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!isOwnProfile ? (
                        <div className="grid grid-cols-2 gap-2">
                          <HoverBorderGradient
                            containerClassName="rounded-lg"
                            as="button"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-sm font-medium"
                            onClick={() => router.push('/application')}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </HoverBorderGradient>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Send className="w-4 h-4 mr-2" />
                            Send APT
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" className="border-slate-600">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                          <Button variant="outline" className="border-slate-600">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <StatCard
                  icon={Activity}
                  label="Transactions"
                  value={profileStats.totalTransactions}
                  color="bg-blue-600"
                  isLoading={dataLoading}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Total Sent"
                  value={profileStats.totalSent}
                  color="bg-red-600"
                  isLoading={dataLoading}
                />
                <StatCard
                  icon={DollarSign}
                  label="Total Received"
                  value={profileStats.totalReceived}
                  color="bg-green-600"
                  isLoading={dataLoading}
                />
                <StatCard
                  icon={Users}
                  label="Connections"
                  value={profileStats.friendsCount}
                  color="bg-purple-600"
                  isLoading={dataLoading}
                />
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dataLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-400">Loading achievements...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement, index) => (
                          <AchievementBadge key={index} achievement={achievement} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dataLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-400">Loading activity...</span>
                      </div>
                    ) : recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'payment' ? 'bg-red-500' :
                              activity.type === 'receive' ? 'bg-green-500' :
                              activity.type === 'group' ? 'bg-blue-500' : 'bg-purple-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-white text-sm">{activity.action}</p>
                              <p className="text-gray-400 text-xs">{activity.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No recent activity found</p>
                        <p className="text-gray-500 text-sm mt-1">Start sending messages or payments to see activity here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Activity Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full">
                      <Linechart />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main Profile component
export default function Profile() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
