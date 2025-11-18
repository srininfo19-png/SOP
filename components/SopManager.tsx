import React, { useRef } from 'react';
import { SOPDocument } from '../types';
import { FilePlusIcon } from './icons/FilePlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SopManagerProps {
  sopDocs: SOPDocument[];
  onAddSop: (doc: SOPDocument) => void;
  onRemoveSop: (id: number) => void;
}

export const SopManager: React.FC<SopManagerProps> = ({ sopDocs, onAddSop, onRemoveSop }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      // Rely on browser-provided mime type, but have fallbacks for text-like extensions
      const isText = file.type.startsWith('text/') || file.name.endsWith('.md');

      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const newDoc: SOPDocument = {
            id: Date.now() + Math.random(),
            name: file.name,
            content: isText ? result : result.substring(result.indexOf(',') + 1),
            // Use browser mime type, which is generally accurate
            mimeType: file.type || (isText ? 'text/plain' : 'application/octet-stream'),
          };
          onAddSop(newDoc);
        }
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
    
    // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-1/3 md:h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">SOP Documents</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your knowledge base.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <ul className="space-y-2">
          {sopDocs.map(doc => (
            <li key={doc.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
              <span className="truncate text-sm font-medium" title={doc.name}>{doc.name}</span>
              <button onClick={() => onRemoveSop(doc.id)} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </li>
          ))}
          {sopDocs.length === 0 && (
            <div className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
              No documents uploaded.
            </div>
          )}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md,.text,.pdf,.doc,.docx"
          multiple
        />
        <button
          onClick={handleAddClick}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          <FilePlusIcon className="w-5 h-5" />
          Add SOP
        </button>
      </div>
    </div>
  );
};