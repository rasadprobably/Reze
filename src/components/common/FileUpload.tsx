import React, { useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <button
        onClick={handleClick}
        type="button"
        className="w-full bg-slate-800/70 border border-purple-800/50 hover:bg-slate-700/70 hover:border-purple-600 text-gray-300 font-semibold py-3 px-4 transition-all duration-300 flex items-center justify-center gap-3 rounded-lg shadow-md hover:shadow-purple-500/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        {label}
      </button>
    </div>
  );
};

export default FileUpload;
