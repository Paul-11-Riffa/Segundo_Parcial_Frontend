import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './Modal.css';

/**
 * Modal - Componente modal reutilizable con diseño minimalista
 * 
 * Props:
 * - isOpen: boolean - controla si el modal está visible
 * - onClose: function - función para cerrar el modal
 * - title: string - título del modal
 * - children: ReactNode - contenido del modal
 * - size: 'sm' | 'md' | 'lg' | 'xl' - tamaño del modal
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  const modalRef = useRef(null);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* Modal wrapper (centering container) */}
      <div className="modal-wrapper" onClick={onClose}>
        {/* Modal content */}
        <div
          ref={modalRef}
          className={`modal-content modal-${size}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="modal-close-button"
                aria-label="Close modal"
              >
                <XMarkIcon />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
