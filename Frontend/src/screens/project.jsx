import React, { useState, useRef, useEffect, useContext } from 'react';
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
  Clock,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';
import { initializeSocket , sendMessage , receiveMessage } from '../config/socket';

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
  const project = location.state?.project;
  const { user: currentUser } = useContext(UserContext);

  const [leftWidth, setLeftWidth] = useState(40); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [message, setMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  
  // API related states
  const [allUsers, setAllUsers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  
  // Add user modal states
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('member');
  const [emailSearchStatus, setEmailSearchStatus] = useState(null); // null, 'searching', 'found', 'not-found', 'already-exists'
  const [foundUser, setFoundUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Socket initialization flag
  const [socketInitialized, setSocketInitialized] = useState(false);
  
  const containerRef = useRef(null);
  const resizeRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Random avatars and activity generator
  const avatars = ["👤", "👩", "👨", "👩‍💻", "👨‍💼", "👩‍🔬", "👨‍🎨", "👩‍🚀", "👨‍🏫"];
  const getRandomAvatar = () => avatars[Math.floor(Math.random() * avatars.length)];
  const getRandomOnlineStatus = () => Math.random() > 0.5;

  // Messages state - start with empty array for real-time chat
  const [messages, setMessages] = useState([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchProjectData();
    fetchAllUsers();
  }, []);

  // Separate useEffect for socket initialization to prevent multiple connections
  useEffect(() => {
    if (project?._id && currentUser?._id && !socketInitialized) {
      console.log('Initializing socket for project:', project._id);
      
      initializeSocket(project._id);
      setSocketInitialized(true);

      // Set up message receiver
      receiveMessage('project-message', (data) => {
        console.log('Received message:', data);
        
        // Only add message if it's not from current user (to avoid duplicates)
        if (data.sender !== currentUser._id) {
          const receivedMessage = {
            ...data.newMessage,
            isOwn: false,
            user: {
              ...data.newMessage.user,
              avatar: getRandomAvatar() // Generate avatar for received messages
            }
          };
          
          setMessages(prevMessages => [...prevMessages, receivedMessage]);
        }
      });
    }

    // Cleanup function to prevent multiple socket connections
    return () => {
      // Don't disconnect here as it might be needed for other components
      // Socket cleanup should be handled at app level or when actually leaving the project
    };
  }, [project?._id, currentUser?._id, socketInitialized]);

  const fetchProjectData = async () => {
    if (!project?._id || !currentUser?._id) return;
    
    try {
      const response = await axios.get(`/projects/get-project/${project._id}`);
      if (response.data.success) {
        setProjectData(response.data.project);
        
        // Find current user's role in the project
        const currentUserInProject = response.data.project.users.find(
          userObj => userObj.user._id === currentUser._id
        );
        if (currentUserInProject) {
          setCurrentUserRole(currentUserInProject.role);
        }
        
        // Transform project users to collaborators format and sort them
        const transformedCollaborators = response.data.project.users.map(userObj => ({
          id: userObj.user._id,
          name: userObj.user.name || userObj.user.email,
          email: userObj.user.email,
          avatar: getRandomAvatar(),
          role: userObj.role,
          online: getRandomOnlineStatus(),
          isCurrentUser: userObj.user._id === currentUser._id
        }));
        
        // Sort collaborators: owner first, then current user, then others
        const sortedCollaborators = transformedCollaborators.sort((a, b) => {
          if (a.role === 'owner') return -1;
          if (b.role === 'owner') return 1;
          if (a.isCurrentUser) return -1;
          if (b.isCurrentUser) return 1;
          return 0;
        });
        
        setCollaborators(sortedCollaborators);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/users/all');
      if (response.data.success) {
        setAllUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const searchUserByEmail = (email) => {
    if (!email.trim()) {
      setEmailSearchStatus(null);
      setFoundUser(null);
      return;
    }

    setEmailSearchStatus('searching');
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      // Check if user already exists in project
      const existsInProject = collaborators.some(collab => collab.email.toLowerCase() === email.toLowerCase());
      if (existsInProject) {
        setEmailSearchStatus('already-exists');
        setFoundUser(null);
        return;
      }

      // Search in all users
      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setEmailSearchStatus('found');
        setFoundUser(user);
      } else {
        setEmailSearchStatus('not-found');
        setFoundUser(null);
      }
    }, 300);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setUserEmail(email);
    
    // Clear previous search status
    if (!email.trim()) {
      setEmailSearchStatus(null);
      setFoundUser(null);
      return;
    }
    
    // Debounce search - only search when user stops typing
    clearTimeout(window.emailSearchTimeout);
    window.emailSearchTimeout = setTimeout(() => {
      searchUserByEmail(email);
    }, 500);
  };

  const handleAddUser = async () => {
    if (!foundUser || !projectData) return;
    
    setIsAddingUser(true);
    
    try {
      const response = await axios.put('/projects/add-user', {
        projectId: projectData._id,
        users: [{
          user: foundUser._id,
          role: userRole || 'member'
        }]
      });

      if (response.data.success) {
        // Update local state with new collaborator
        const newCollaborator = {
          id: foundUser._id,
          name: foundUser.name || foundUser.email,
          email: foundUser.email,
          avatar: getRandomAvatar(),
          role: userRole || 'member',
          online: getRandomOnlineStatus(),
          isCurrentUser: false
        };

        setCollaborators(prev => [...prev, newCollaborator]);
        
        // Reset modal state
        setUserEmail('');
        setUserRole('member');
        setEmailSearchStatus(null);
        setFoundUser(null);
        setShowAddUsersModal(false);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsAddingUser(false);
    }
  };

  // Check if current user can add users (only owner or admin)
  const canAddUsers = currentUserRole === 'owner' || currentUserRole === 'admin';

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
      id: Date.now(), // Use timestamp as unique ID
      user: {
        id: currentUser._id,
        name: currentUser.name || currentUser.email,
        avatar: "👤" // Current user avatar
      },
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    
    // Add message to local state immediately for current user
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');

    // Send message via socket to other users
    sendMessage('project-message', {
      newMessage: {
        ...newMessage,
        isOwn: false // For other users, this will be false
      },
      sender: currentUser._id
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = () => {
    switch (emailSearchStatus) {
      case 'searching':
        return <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>;
      case 'found':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'not-found':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'already-exists':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (emailSearchStatus) {
      case 'searching':
        return 'Searching...';
      case 'found':
        return `User found: ${foundUser?.name || foundUser?.email}`;
      case 'not-found':
        return 'User not found on platform';
      case 'already-exists':
        return 'User already in project';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading project...</p>
        </div>
      </div>
    );
  }

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
            <span className="font-semibold">{projectData?.name || 'Project'}</span>
            <Users className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-slate-300">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{currentUser?.name?.[0] || 'U'}</span>
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
            
            {showUsers && canAddUsers && (
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
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      user.isCurrentUser 
                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:from-cyan-500/15 hover:to-blue-500/15' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        user.isCurrentUser 
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600' 
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}>
                        {user.avatar}
                      </div>
                      {user.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${user.isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                          {user.isCurrentUser ? 'You' : user.name}
                        </span>
                        {user.role === "owner" && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <span className={`text-sm capitalize ${user.isCurrentUser ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {user.role}
                      </span>
                    </div>
                    
                    <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                  </div>
                ))}
              </div>
            ) : (
              /* Chat Messages */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">No messages yet</p>
                        <p className="text-slate-500 text-sm">Start a conversation with your team!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
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
                    ))
                  )}
                  <div ref={messagesEndRef} />
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
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Collaborator</h2>
              <button
                onClick={() => {
                  setShowAddUsersModal(false);
                  setUserEmail('');
                  setUserRole('member');
                  setEmailSearchStatus(null);
                  setFoundUser(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  User Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userEmail}
                    onChange={handleEmailChange}
                    placeholder="Enter user email..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon()}
                  </div>
                </div>
                
                {/* Status Message */}
                {emailSearchStatus && getStatusMessage() && (
                  <div className={`mt-2 text-sm flex items-center space-x-2 ${
                    emailSearchStatus === 'found' ? 'text-green-400' :
                    emailSearchStatus === 'not-found' ? 'text-red-400' :
                    emailSearchStatus === 'already-exists' ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>
                    <span>{getStatusMessage()}</span>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role (Optional)
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                >
                  <option value="member" className="bg-slate-800">Member</option>
                  <option value="admin" className="bg-slate-800">Admin</option>
                  <option value="developer" className="bg-slate-800">Developer</option>
                  <option value="designer" className="bg-slate-800">Designer</option>
                  <option value="backend" className="bg-slate-800">Backend</option>
                  <option value="frontend" className="bg-slate-800">Frontend</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddUsersModal(false);
                  setUserEmail('');
                  setUserRole('member');
                  setEmailSearchStatus(null);
                  setFoundUser(null);
                }}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!foundUser || emailSearchStatus !== 'found' || isAddingUser}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAddingUser ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  'Add User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;