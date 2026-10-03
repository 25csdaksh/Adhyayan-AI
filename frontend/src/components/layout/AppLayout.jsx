import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppNavbar } from './AppNavbar';
import { CreateNotebookModal } from '../notebooks/CreateNotebookModal';
import { notebookService } from '../../api/notebookService';
import { useToast } from '../../context/ToastContext';

export const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleCreateNotebook = async (data) => {
    setIsCreating(true);
    try {
      const res = await notebookService.createNotebook(data);
      const newNotebook = res.data.notebook;
      toast.success(`Notebook "${newNotebook.title}" initialized!`, 'Success');
      setCreateModalOpen(false);
      navigate(`/notebooks/${newNotebook._id || newNotebook.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create notebook');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8F6] text-[#17211D]">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenCreateNotebook={() => setCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCreateNotebook={() => setCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openCreateNotebook: () => setCreateModalOpen(true) }} />
        </main>
      </div>

      {/* Global Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateNotebook}
        isCreating={isCreating}
      />
    </div>
  );
};
