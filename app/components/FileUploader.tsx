import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      setSelectedFile(file);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize,
  });

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect?.(null);
  };

  return (
    <div className="w-full gradient-border rounded-lg p-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors
          ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"}
        `}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div
            className="flex items-center w-full justify-between space-x-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <img src="/images/pdf.png" alt="pdf" className="w-10 h-10" />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
            >
              <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
              <img src="/icons/info.svg" alt="upload" className="w-16 h-16" />
            </div>
            <p className="text-lg text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-400">PDF only, max {formatSize(maxFileSize)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
