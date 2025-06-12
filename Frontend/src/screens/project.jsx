import React, { useState, useRef, useEffect } from 'react';
import { 
  Code, 
  Send, 
  Users, 
  ArrowLeft, 
  Plus, 
  X, 
  Check,
  User,
  MessageCircle,
  Crown,
  Clock
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';

const CollabraLogo = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
        <Code className={`${sizeClasses[size]} text-white`} />
      </div>
      <span className={`${sizeClasses[size]} font-bold text-white`}>Collabra AI</span>
    </div>
  );
};

const ProjectPage = () => {

    const location = useLocation();
    console.log(location.state);

  const [leftWidth, setLeftWidth] = useState(40); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [message, setMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const containerRef = useRef(null);
  const resizeRef = useRef(null);


  useEffect(() => {
    
    axios.get('/users/all').then((res)=>{
      // setAllUsers(res.data.users);
      console.log(res);
    }).catch((err)=>{
      console.log(err);
    })


  }, [])
  



  // Dummy data
  const projectName = "E-commerce Platform";
  const currentUser = { id: 1, name: "You", avatar: "👤" };
  
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: "You", avatar: "👤", role: "Owner", online: true },
    { id: 2, name: "Alice Johnson", avatar: "👩", role: "Developer", online: true },
    { id: 3, name: "Bob Smith", avatar: "👨", role: "Designer", online: false },
    { id: 4, name: "Carol Williams", avatar: "👩‍💻", role: "Developer", online: true }
  ]);

  const [allUsers , setAllUsers ] = useState([
    { id: 5, name: "David Brown", avatar: "👨‍💼", role: "Manager" },
    { id: 6, name: "Emma Davis", avatar: "👩‍🔬", role: "QA Engineer" },
    { id: 7, name: "Frank Wilson", avatar: "👨‍🎨", role: "UI Designer" },
    { id: 8, name: "Grace Lee", avatar: "👩‍🚀", role: "DevOps" },
    { id: 9, name: "Henry Taylor", avatar: "👨‍🏫", role: "Tech Lead" }
  ]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      user: { id: 2, name: "Alice Johnson", avatar: "👩" },
      text: "Hey everyone! I've pushed the latest changes to the authentication module.",
      time: "10:30 AM",
      isOwn: false
    },
    {
      id: 2,
      user: currentUser,
      text: "Great work! I'll review the changes and merge them.",
      time: "10:32 AM",
      isOwn: true
    },
    {
      id: 3,
      user: { id: 4, name: "Carol Williams", avatar: "👩‍💻" },
      text: "I'm working on the payment integration. Should have it ready by EOD.",
      time: "10:45 AM",
      isOwn: false
    },
    {
      id: 4,
      user: currentUser,
      text: "Perfect! Let me know if you need any help with the API documentation.",
      time: "10:47 AM",
      isOwn: true
    }
  ]);

  // Handle resize functionality
  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      user: currentUser,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddUsers = () => {
    const usersToAdd = allUsers.filter(user => selectedUsers.includes(user.id));
    const newCollaborators = usersToAdd.map(user => ({
      ...user,
      role: "Developer",
      online: false
    }));
    
    setCollaborators([...collaborators, ...newCollaborators]);
    setSelectedUsers([]);
    setShowAddUsersModal(false);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CollabraLogo size="sm" />
          
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          >
            <span className="font-semibold">{projectName}</span>
            <Users className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-slate-300">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">U</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex-1 flex relative z-10 overflow-hidden"
      >
        {/* Left Column - Chat */}
        <div 
          className="bg-white/5 backdrop-blur-sm border-r border-white/20 flex flex-col h-full"
          style={{ width: `${leftWidth}%` }}
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            {showUsers ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowUsers(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                <h3 className="text-white font-semibold">Collaborators</h3>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold">Team Chat</h3>
              </div>
            )}
            
            {showUsers && (
              <button
                onClick={() => setShowAddUsersModal(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Users</span>
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {showUsers ? (
              /* Users List */
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {collaborators.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      {user.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{user.name}</span>
                        {user.role === "Owner" && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <span className="text-slate-400 text-sm">{user.role}</span>
                    </div>
                    
                    <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                  </div>
                ))}
              </div>
            ) : (
              /* Chat Messages */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {!msg.isOwn && (
                            <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-sm">
                              {msg.user.avatar}
                            </div>
                          )}
                          <span className="text-slate-400 text-xs">
                            {msg.isOwn ? 'You' : msg.user.name}
                          </span>
                          <span className="text-slate-500 text-xs">{msg.time}</span>
                        </div>
                        
                        <div
                          className={`p-3 rounded-xl ${
                            msg.isOwn
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                              : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex-shrink-0 p-4 border-t border-white/10">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          ref={resizeRef}
          onMouseDown={handleMouseDown}
          className="w-1 bg-white/10 hover:bg-cyan-500/50 cursor-col-resize transition-colors duration-200 relative"
        >
          <div className="absolute inset-y-0 -left-1 -right-1"></div>
        </div>

        {/* Right Column - Code Editor (Blank for now) */}
        <div 
          className="bg-white/5 backdrop-blur-sm flex items-center justify-center h-full"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="text-center">
            <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Code Editor</p>
            <p className="text-slate-500 text-sm">Coming soon...</p>
          </div>
        </div>
      </div>

      {/* Add Users Modal */}
      {showAddUsersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-full max-w-md max-h-96">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Collaborators</h2>
              <button
                onClick={() => {
                  setShowAddUsersModal(false);
                  setSelectedUsers([]);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-6 max-h-48">
              {allUsers.filter(user => !collaborators.some(c => c.id === user.id)).map((user) => (
                <div
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedUsers.includes(user.id)
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-lg">
                    {user.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <span className="text-white font-medium block">{user.name}</span>
                    <span className="text-slate-400 text-sm">{user.role}</span>
                  </div>
                  
                  {selectedUsers.includes(user.id) && (
                    <Check className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowAddUsersModal(false);
                  setSelectedUsers([]);
                }}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUsers}
                disabled={selectedUsers.length === 0}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add ({selectedUsers.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;