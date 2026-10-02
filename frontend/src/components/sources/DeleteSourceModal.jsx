import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const DeleteSourceModal = ({
  isOpen,
  onClose,
  onConfirm,
  source,
  isDeleting = false,
}) => {
  if (!source) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Source?"
      description="This action cannot be undone."
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={Trash2}
            onClick={() => onConfirm(source)}
            loading={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-[#6B756F]">
          Are you sure you want to remove{' '}
          <strong className="text-[#17211D]">"{source.title}"</strong> from this notebook?
        </p>
        <p className="text-xs text-[#8E9993]">
          This source will be permanently removed from this notebook's grounding context.
        </p>
      </div>
    </Modal>
  );
};
