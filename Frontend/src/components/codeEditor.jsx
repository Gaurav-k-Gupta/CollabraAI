import React, { useState, useEffect, useRef } from 'react';
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Play, 
  Settings,
  FileText,
  Code2,
  Image,
  Archive,
  Database
} from 'lucide-react';

const CollaborativeCodeEditor = ({ projectId, currentUser }) => {
  // Layout states - removed fileTreeWidth since parent controls overall width
  const [showFileTree, setShowFileTree] = useState(true);
  const [fileTreeWidth, setFileTreeWidth] = useState(280); // Fixed pixel width instead of percentage
  const [isResizing, setIsResizing] = useState(false);
  
  // File management states
  const [fileTree, setFileTree] = useState({});
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [fileContents, setFileContents] = useState({});
  
  // UI states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('file');
  const [selectedPath, setSelectedPath] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
  // Build/Run states
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [startCommand, setStartCommand] = useState('npm start');
  const [showCommands, setShowCommands] = useState(false);
  
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // File type icons
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code2 className={`${iconClass} text-yellow-400`} />;
      case 'css':
      case 'scss':
      case 'less':
        return <FileText className={`${iconClass} text-blue-400`} />;
      case 'html':
        return <FileText className={`${iconClass} text-orange-400`} />;
      case 'json':
        return <Database className={`${iconClass} text-green-400`} />;
      case 'md':
        return <FileText className={`${iconClass} text-slate-400`} />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className={`${iconClass} text-purple-400`} />;
      case 'zip':
      case 'tar':
      case 'gz':
        return <Archive className={`${iconClass} text-red-400`} />;
      default:
        return <File className={`${iconClass} text-slate-400`} />;
    }
  };

  // Initialize Firebase and load project files
  useEffect(() => {
    console.log(projectId);
    loadProjectFiles();
  }, [projectId]);

  const loadProjectFiles = async () => {
    try {
      // TODO: Load from Firebase
      // For now, simulate some initial files
      const mockFileTree = {
        'src': {
          type: 'folder',
          children: {
            'App.js': { type: 'file', content: '// Welcome to your collaborative editor!\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\nexport default App;' },
            'index.js': { type: 'file', content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));' },
            'components': {
              type: 'folder',
              children: {
                'Header.js': { type: 'file', content: 'import React from "react";\n\nconst Header = () => {\n  return (\n    <header>\n      <h1>My App</h1>\n    </header>\n  );\n};\n\nexport default Header;' },
                'Footer.js': { type: 'file', content: 'import React from "react";\n\nconst Header = () => {\n  return (\n    <header>\n      <h1>My App</h1>\n    </header>\n  );\n};\n\nexport default Header;' }
              }
            }
          }
        },
        'package.json': { 
          type: 'file', 
          content: '{\n  "name": "collaborative-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  },\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build"\n  }\n}'
        },
        'package-lock.json': { 
          type: 'file', 
          content: '{\n  "name": "collaborative-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  },\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build"\n  }\n}'
        },
        'README.md': { type: 'file', content: '# Collaborative Project\n\nThis is a collaborative coding project!\n\n## Getting Started\n\n1. Install dependencies: `npm install`\n2. Start the development server: `npm start`\n\n## Features\n\n- Real-time collaboration\n- File management\n- Code editing\n\nHappy coding! 🚀' }
      };
      
      setFileTree(mockFileTree);
      
      // Auto-expand src folder
      setExpandedFolders(new Set(['src']));
      
    } catch (error) {
      console.error('Error loading project files:', error);
    }
  };

  // Sync file changes to Firebase
  const syncFileChange = async (filePath, content) => {
    try {
      console.log('File synced:', filePath);
    } catch (error) {
      console.error('Error syncing file:', error);
    }
  };

  // Handle file tree operations
  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const openFile = (path, fileName) => {
    const fullPath = path ? `${path}/${fileName}` : fileName;
    
    // Get file content
    const content = getFileContent(fullPath);
    
    // Add to open tabs if not already open
    if (!openTabs.find(tab => tab.path === fullPath)) {
      setOpenTabs(prev => [...prev, { path: fullPath, name: fileName, content }]);
    }
    
    // Set as active tab
    setActiveTab(fullPath);
    
    // Store content for editing
    setFileContents(prev => ({ ...prev, [fullPath]: content }));
  };

  const closeTab = (path) => {
    setOpenTabs(prev => prev.filter(tab => tab.path !== path));
    if (activeTab === path) {
      const remainingTabs = openTabs.filter(tab => tab.path !== path);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].path : null);
    }
  };

  const getFileContent = (path) => {
    const pathParts = path.split('/');
    let current = fileTree;
    
    for (const part of pathParts) {
      if (current[part]) {
        if (current[part].type === 'file') {
          return current[part].content || '';
        } else {
          current = current[part].children || {};
        }
      }
    }
    return '';
  };

  const handleFileContentChange = (path, content) => {
    setFileContents(prev => ({ ...prev, [path]: content }));
    
    // Debounce the sync operation
    clearTimeout(window.syncTimeout);
    window.syncTimeout = setTimeout(() => {
      syncFileChange(path, content);
    }, 1000);
  };

  // Add new file/folder
  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    
    try {
      const fullPath = selectedPath ? `${selectedPath}/${newItemName}` : newItemName;
      console.log('Adding item:', fullPath, newItemType);
      
      setShowAddModal(false);
      setNewItemName('');
      setSelectedPath('');
      
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Resize functionality for file tree
  const handleMouseDown = (e) => {
    if (!showFileTree) return;
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    
    // Set min and max width constraints
    if (newWidth >= 200 && newWidth <= containerRect.width * 0.6) {
      setFileTreeWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Render file tree recursively
  const renderFileTree = (tree, path = '') => {
    return Object.entries(tree).map(([name, item]) => {
      const currentPath = path ? `${path}/${name}` : name;
      const isFolder = item.type === 'folder';
      const isExpanded = expandedFolders.has(currentPath);
      
      return (
        <div key={currentPath}>
          <div
            className={`flex items-center space-x-2 px-2 py-1.5 hover:bg-white/5 cursor-pointer rounded group ${
              activeTab === currentPath ? 'bg-cyan-500/20 border-l-2 border-cyan-400' : ''
            }`}
            onClick={() => isFolder ? toggleFolder(currentPath) : openFile(path, name)}
            style={{ paddingLeft: `${(path.split('/').length) * 16 + 8}px` }}
          >
            {isFolder && (
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </div>
            )}
            
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400" />
              )
            ) : (
              getFileIcon(name)
            )}
            
            <span className="text-sm text-white flex-1 truncate">{name}</span>
            
            {!isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPath(path);
                  setShowAddModal(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
              >
                <Plus className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
          
          {isFolder && isExpanded && item.children && (
            <div>
              {renderFileTree(item.children, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div ref={containerRef} className="flex h-full w-full">
      {/* File Tree */}
      {showFileTree && (
        <div 
          className="bg-white/5 border-r border-white/10 flex flex-col flex-shrink-0"
          style={{ width: `${fileTreeWidth}px` }}
        >
          {/* File Tree Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Explorer</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setSelectedPath('');
                  setShowAddModal(true);
                }}
                className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                title="New File"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowFileTree(false)}
                className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                title="Hide Explorer"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* File Tree Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.keys(fileTree).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <FileText className="w-8 h-8 text-slate-500 mb-2" />
                <p className="text-slate-400 text-sm mb-3">No files yet</p>
                <button
                  onClick={() => {
                    setSelectedPath('');
                    setShowAddModal(true);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add File</span>
                </button>
              </div>
            ) : (
              renderFileTree(fileTree)
            )}
          </div>

          {/* Build Commands */}
          <div className="border-t border-white/10 p-3">
            <button
              onClick={() => setShowCommands(!showCommands)}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-white/5 rounded"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-white text-sm font-medium">Commands</span>
              </div>
              {showCommands ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {showCommands && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Build Command</label>
                  <input
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Start Command</label>
                  <input
                    type="text"
                    value={startCommand}
                    onChange={(e) => setStartCommand(e.target.value)}
                    className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <button className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded text-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-200">
                  <Play className="w-3 h-3" />
                  <span>Run Project</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resize Handle */}
      {showFileTree && (
        <div
          onMouseDown={handleMouseDown}
          className="w-1 bg-white/10 hover:bg-cyan-500/50 cursor-col-resize transition-colors duration-200 relative flex-shrink-0"
        >
          <div className="absolute inset-y-0 -left-1 -right-1"></div>
        </div>
      )}

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Header */}
        <div className="flex items-center justify-between bg-white/5 border-b border-white/10 min-h-[48px] flex-shrink-0">
          <div className="flex items-center min-w-0 flex-1">
            {!showFileTree && (
              <button
                onClick={() => setShowFileTree(true)}
                className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors flex-shrink-0"
                title="Show Explorer"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            
            {/* Tabs */}
            <div className="flex items-center overflow-x-auto min-w-0 flex-1">
              {openTabs.map((tab) => (
                <div
                  key={tab.path}
                  className={`flex items-center space-x-2 px-4 py-2 border-r border-white/10 cursor-pointer flex-shrink-0 ${
                    activeTab === tab.path ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                  onClick={() => setActiveTab(tab.path)}
                >
                  {getFileIcon(tab.name)}
                  <span className="text-white text-sm truncate max-w-32">{tab.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.path);
                    }}
                    className="p-0.5 hover:bg-white/20 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 relative overflow-hidden">
          {activeTab && fileContents[activeTab] !== undefined ? (
            <textarea
              ref={editorRef}
              value={fileContents[activeTab] || ''}
              onChange={(e) => handleFileContentChange(activeTab, e.target.value)}
              className="w-full h-full p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", consolas, "source-code-pro", monospace' }}
              placeholder="Start coding..."
              spellCheck={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Code2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Welcome to the Code Editor</p>
                <p className="text-slate-500 text-sm">
                  {Object.keys(fileTree).length === 0 
                    ? "Create your first file to get started!" 
                    : "Select a file from the explorer to start editing"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Item</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItemName('');
                  setSelectedPath('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="file"
                      checked={newItemType === 'file'}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-white">File</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="folder"
                      checked={newItemType === 'folder'}
                      onChange={(e) => setNewItemType(e.target.value)}
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-white">Folder</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`Enter ${newItemType} name...`}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  autoFocus
                />
              </div>

              {selectedPath && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-slate-400 text-sm">
                    {selectedPath}/
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItemName('');
                  setSelectedPath('');
                }}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create {newItemType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCodeEditor;