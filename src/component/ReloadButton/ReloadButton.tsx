import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

interface ReloadButtonProps {
  onReload: () => Promise<void> | void;
  loadingText?: string;
}

export default function ReloadButton({ onReload, loadingText = "Loading..." }: ReloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // If onReload is a promise, await it
      if (onReload && typeof onReload === 'function') {
        await onReload();
      }
    } catch (error) {
      console.error('Error during reload:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          flex items-center justify-center gap-2
          px-4 py-2 rounded-md
          bg-blue-500 text-white
          hover:bg-blue-600
          transition-colors
          disabled:opacity-70
          focus:outline-none focus:ring-2 focus:ring-blue-300
        `}
      >
        <RotateCw 
          className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
        />
        <span>{loading ? loadingText : 'Reload'}</span>
      </button>
      
      {/* Demo functionality */}
      <div className="text-gray-500 text-sm mt-2">
        {loading ? 'Request in progress...' : 'Ready'}
      </div>
    </div>
  );
};
