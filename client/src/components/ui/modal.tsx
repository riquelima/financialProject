import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className={`glass-effect rounded-2xl neon-glow fade-in relative z-10 ${className}`}>
        {children}
      </div>
    </div>,
    document.body
  );
}
