import React, { ReactNode } from "react";

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-2">
        <div
            className="
        relative
        bg-gradient-to-br from-slate-800 to-slate-900
        rounded-xl
        shadow-2xl
        p-4 md:p-8
        w-full
        max-w-xl
        md:max-w-2xl
        text-slate-100
        text-[0.97rem]
      "
        >
            <button
                onClick={onClose}
                aria-label="Close Modal"
                className="
          absolute right-3 top-3
          bg-indigo-700 text-white
          w-8 h-8 md:w-9 md:h-9
          rounded-full flex items-center justify-center text-lg md:text-xl
          hover:bg-indigo-600
          transition
        "
                type="button"
            >
                ×
            </button>
            <div className="overflow-y-auto max-h-[80dvh]">{children}</div>
        </div>
    </div>
);

export default Modal;

