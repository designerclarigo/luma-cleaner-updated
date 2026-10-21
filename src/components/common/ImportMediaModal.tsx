import React, { useState } from 'react';
import { MediaItem } from '../../types/media';
import { mediaService, formatBytes } from '../../services/mediaService';
import {
  Upload,
  X,
  FileImage,
  Video,
  CheckCircle2,
  HardDrive,
  Sparkles,
} from 'lucide-react';

interface ImportMediaModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportMediaModal: React.FC<ImportMediaModalProps> = ({
  onClose,
  onImportComplete,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleProcessImport = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);

    const newItems: MediaItem[] = [];
    const now = Date.now();

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);

      newItems.push({
        id: `user-${now}-${i}`,
        uri: url,
        thumbnailUri: url,
        filename: file.name,
        mediaType: isVideo ? 'video' : 'photo',
        width: isVideo ? 1920 : 3000,
        height: isVideo ? 1080 : 2000,
        creationTime: file.lastModified || now,
        modificationTime: file.lastModified || now,
        fileSize: file.size,
        duration: isVideo ? 10 : undefined,
        albumName: 'Imported',
        source: 'uploaded',
      });

      setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
    }

    mediaService.addUploadedMedia(newItems);
    setIsProcessing(false);
    onImportComplete();
    onClose();
  };

  const totalBytes = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E6E9E2] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E9E2]">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#244D3F]" />
            <h3 className="text-sm font-bold text-[#18231F]">
              Import Local Device Media
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F7F3] flex items-center justify-center text-[#737B75] hover:text-[#18231F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-[#F8F7F3] rounded-2xl border border-[#E6E9E2] text-xs text-[#737B75] leading-relaxed flex items-start gap-2.5">
          <HardDrive className="w-4 h-4 text-[#244D3F] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#18231F]">Private local processing:</strong> Files are read directly in your browser. Nothing is uploaded to any server.
          </div>
        </div>

        {/* Drop / Select zone */}
        <label className="border-2 border-dashed border-[#E6E9E2] hover:border-[#244D3F]/60 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F8F7F3]/40 hover:bg-[#F8F7F3]">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6E9E2] flex items-center justify-center text-[#244D3F] shadow-xs mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#18231F]">
            Choose photos & videos from your device
          </p>
          <p className="text-[11px] text-[#737B75] mt-1">
            Tap to open file picker or drag & drop files here
          </p>
        </label>

        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#18231F]">
              <span>Selected {selectedFiles.length} files</span>
              <span className="tabular-nums text-[#244D3F]">
                {formatBytes(totalBytes)}
              </span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-[11px] text-[#737B75]">
              {selectedFiles.slice(0, 5).map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-1.5 bg-[#F8F7F3] rounded-lg"
                >
                  <span className="truncate max-w-[200px]">{f.name}</span>
                  <span className="tabular-nums">{formatBytes(f.size)}</span>
                </div>
              ))}
              {selectedFiles.length > 5 && (
                <div className="text-center text-[10px] text-[#737B75] italic">
                  + {selectedFiles.length - 5} more files
                </div>
              )}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-[#244D3F]">
              <span>Processing local media...</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="w-full bg-[#E6E9E2] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#244D3F] h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleProcessImport}
          disabled={selectedFiles.length === 0 || isProcessing}
          className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
            selectedFiles.length > 0 && !isProcessing
              ? 'bg-[#244D3F] text-white hover:bg-[#18231F] cursor-pointer active:scale-95'
              : 'bg-gray-100 text-[#737B75] opacity-50 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Add {selectedFiles.length} Files to Luma</span>
        </button>
      </div>
    </div>
  );
};
