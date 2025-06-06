import React, { useEffect } from 'react';
import { XIcon } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  backdropBlur?: boolean; // Kept for potential use in dark theme, but new theme is mostly opaque
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', backdropBlur = true }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  // Use primary-bg-rgb with a higher opacity for the new theme
  const backdropBgColor = `rgba(var(--primary-bg-rgb, 30, 30, 30), 0.6)`; // Adjusted default for dark theme
  const currentBackdropBlur = document.body.classList.contains('theme-light') ? false : backdropBlur;


  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-4 z-[60] transition-opacity duration-300 ease-in-out ${currentBackdropBlur ? 'backdrop-blur-sm' : ''}`} // Softer blur if used
      style={{ backgroundColor: backdropBgColor }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--modal-border)', boxShadow: 'var(--ref-box-shadow)'}} // Use ref-box-shadow
        className={`rounded-[20px] p-6 m-4 w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow`} // More rounded
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          {title && <h2 id="modal-title" className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>{title}</h2>} {/* Poppins Semibold, smaller title */}
          <button 
            onClick={onClose} 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-full hover:bg-[var(--button-hover-bg)]"
            aria-label="Fechar modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes modalShow {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalShow {
          animation: modalShow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;