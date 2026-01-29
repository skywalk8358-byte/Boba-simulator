import React, { useRef } from 'react';

export default function FileUploader({
  label,
  description,
  accept,
  onUpload,
  isLoaded,
  recordCount,
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        relative p-6 rounded-xl border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${isLoaded
          ? 'border-emerald-500/50 bg-emerald-500/10'
          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex items-start gap-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${isLoaded ? 'bg-emerald-500' : 'bg-slate-800'}
          `}
        >
          {isLoaded ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${isLoaded ? 'text-emerald-400' : 'text-white'}`}>
            {label}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {description}
          </p>
          {isLoaded && recordCount !== undefined && (
            <p className="text-sm text-emerald-400 mt-2">
              ✓ 已載入 {recordCount.toLocaleString()} 筆資料
            </p>
          )}
          {!isLoaded && (
            <p className="text-xs text-slate-500 mt-2">
              點擊或拖放檔案至此處
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
