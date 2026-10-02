import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const DeleteNotebookModal = ({
  isOpen,
  onClose,
  onConfirm,
  notebookTitle = '',
  isDeleting = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Notebook"
      description="This action cannot be undone."
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isDeleting}
            leftIcon={Trash2}
          >
            Delete Notebook
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-rose-900">
            Are you sure you want to delete <span className="font-bold">"{notebookTitle}"</span>?
          </p>
          <p className="text-rose-700 leading-relaxed text-xs">
            All associated notes and configurations for this notebook will be permanently removed from your workspace.
          </p>
        </div>
      </div>
    </Modal>
  );
};
