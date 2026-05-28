import React, { useState } from 'react';
import { useVault } from '../context/VaultContext.jsx';
import PasswordCard from '../components/PasswordCard.jsx';
import PasswordModal from '../components/PasswordModal.jsx';
import { LayoutGrid, List, ShieldAlert as EmptyShield, Plus, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast.jsx';

export default function Vault() {
  const { 
    credentials, 
    isVaultLoading, 
    searchQuery, 
    setSearchQuery, 
    deleteCredential 
  } = useVault();
  
  const showToast = useToast();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);

  const categories = ['All', 'Social', 'Banking', 'Work', 'Shopping', 'Other'];

  // Handle Edit click
  const handleEdit = (credential) => {
    setEditingCredential(credential);
    setIsModalOpen(true);
  };

  // Handle Delete click
  const handleDelete = async (id, siteName) => {
    const confirm = window.confirm(`Are you sure you want to delete the credential for ${siteName}?`);
    if (confirm) {
      try {
        await deleteCredential(id, siteName);
        showToast('Credential deleted from vault', 'success');
      } catch (err) {
        showToast('Failed to delete credential', 'error');
      }
    }
  };

  // Filtered credentials list
  const filteredCredentials = credentials.filter(item => {
    // 1. Filter by category
    const matchesCategory = selectedCategory === 'All' || 
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    // 2. Filter by search query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      item.siteName?.toLowerCase().includes(query) ||
      item.username?.toLowerCase().includes(query) ||
      item.url?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vault Credentials</h1>
          <p className="text-sm text-[#8e9192] mt-1">
            Access, copy, and manage your encrypted logins.
          </p>
        </div>

        {/* View Mode & Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#131313] border border-[#444748] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-[#8e9192] hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-white text-black' : 'text-[#8e9192] hover:text-white'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => { setEditingCredential(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> ADD NEW
          </button>
        </div>
      </div>

      {/* Main Grid: Filter Sidebar + Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Category Filter Sidebar */}
        <div className="md:col-span-1 glass-card p-5 space-y-4">
          <h3 className="label-caps flex items-center gap-1.5 border-b border-[#444748]/50 pb-2">
            <Filter className="h-3.5 w-3.5" /> Categories
          </h3>
          
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-xs font-semibold text-left transition-all cursor-pointer flex-shrink-0 md:w-full ${
                  selectedCategory === cat 
                    ? 'bg-white text-black' 
                    : 'text-[#8e9192] hover:text-white border border-transparent hover:border-[#444748]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials list */}
        <div className="md:col-span-3 space-y-4">
          
          {/* Skeleton Loaders while loading */}
          {isVaultLoading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className={`animate-pulse border border-[#444748] bg-[#131313]/25 ${viewMode === 'grid' ? 'h-52' : 'h-16'}`} 
                />
              ))}
            </div>
          ) : filteredCredentials.length === 0 ? (
            
            /* Empty State */
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
              <div className="p-4 bg-[#131313] border border-[#444748]">
                <EmptyShield className="h-10 w-10 text-[#8e9192]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">No credentials found</h3>
                <p className="text-xs text-[#8e9192] mt-1 max-w-xs mx-auto">
                  {searchQuery 
                    ? "We couldn't find any entries matching your search filter." 
                    : "Your vault is currently empty. Start by saving your first credential!"
                  }
                </p>
              </div>
              {!searchQuery && (
                <button
                  onClick={() => { setEditingCredential(null); setIsModalOpen(true); }}
                  className="btn-primary"
                >
                  CREATE AN ENTRY
                </button>
              )}
            </div>

          ) : (
            /* Items List */
            <motion.div 
              layout
              className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              <AnimatePresence mode="popLayout">
                {filteredCredentials.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PasswordCard
                      credential={item}
                      viewMode={viewMode}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>

      </div>

      {/* Add / Edit Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCredential(null); }}
        editingCredential={editingCredential}
      />

    </div>
  );
}
