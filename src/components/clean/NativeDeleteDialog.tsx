import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Smartphone, ShieldAlert } from 'lucide-react';
import { formatBytes } from '../../services/mediaService';

interface NativeDeleteDialogProps {
  itemCount: number;
  totalBytes: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const NativeDeleteDialog: React.FC<NativeDeleteDialogProps> = ({
  itemCount,
  totalBytes,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E6E9E2] text-center space-y-4"
      >
        {/* System dialog icon */}
        <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 text-[#C86462] flex items-center justify-center mx-auto shadow-2xs">
          <Trash2 className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-[#18231F] leading-snug">
            Allow Luma to delete {itemCount} {itemCount === 1 ? 'item' : 'items'}?
          </h3>
          <p className="text-xs text-[#737B75] mt-1.5 leading-relaxed">
            These files will be permanently removed from device storage, freeing up{' '}
            <strong className="text-[#C86462] font-black">{formatBytes(totalBytes)}</strong> of space.
          </p>
        </div>

        {/* Small system prompt disclaimer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#737B75] bg-[#F8F7F3] py-2 px-3 rounded-2xl border border-[#E6E9E2]">
          <Smartphone className="w-3.5 h-3.5 text-[#244D3F]" />
          <span>iOS & Android System Deletion Gate</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCancel}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl border border-[#E6E9E2] text-xs font-bold text-[#18231F] hover:bg-[#F8F7F3] active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-[#C86462] hover:bg-red-700 text-xs font-black text-white shadow-sm transition-all cursor-pointer"
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
