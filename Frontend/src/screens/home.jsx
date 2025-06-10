import React, { useState , useContext } from 'react';
import { Plus, Code, Folder, Calendar, X, ArrowRight, Zap, Users, Star } from 'lucide-react';
import { UserContext } from '../context/user.context';
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

const Home = () => {
  const { user } = useContext(UserContext);

  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Full-stack React application with Node.js backend',
      lastModified: '2 hours ago',
      collaborators: 3
    },
    {
      id: 2,
      name: 'Mobile App UI',
      description: 'React Native application for task management',
      lastModified: '1 day ago',
      collaborators: 2
    },
    {
      id: 3,
      name: 'Data Visualization',
      description: 'Interactive dashboard with D3.js and Python',
      lastModified: '3 days ago',
      collaborators: 5
    }
  ]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    axios.post('/projects/create' , {
      name : projectName,
    }).then((res)=>{
      console.log(res);
    }).catch((error)=>{
      console.log(error);
    })


    setTimeout(() => {
      const newProject = {
        id: projects.length + 1,
        name: projectName,
        description: 'New project ready for collaboration',
        lastModified: 'Just now',
        collaborators: 1
      };
      
      setProjects([newProject, ...projects]);
      setProjectName('');
      setShowModal(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProjectName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <CollabraLogo size="md" />
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">U</span>
              </div>
              <span>Welcome back!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Your <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Projects</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Manage your collaborative coding projects with AI-powered assistance
            </p>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 flex items-center space-x-2 mx-auto group"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <Folder className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{project.collaborators}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {project.name}
                </h3>
                
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{project.lastModified}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{project.collaborators}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{projects.length}</h3>
                  <p className="text-slate-400">Active Projects</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {projects.reduce((acc, p) => acc + p.collaborators, 0)}
                  </h3>
                  <p className="text-slate-400">Collaborators</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-teal-500/20 rounded-lg">
                  <Code className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">24/7</h3>
                  <p className="text-slate-400">AI Assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Project</h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !projectName.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"

                  onClick={handleCreateProject}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;