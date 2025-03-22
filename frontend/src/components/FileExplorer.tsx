import { useState } from "react";
import { FileNode } from "../pages/Builder";
import { Folder, FolderOpen, FileText } from "lucide-react";

interface FileExplorerProps {
    files: FileNode[];
    onFileSelect: (file: FileNode) => void; // Change here
  }
  export const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
    return (
      <div className="w-72 h-full bg-gray-900 text-white p-3 text-sm font-mono shadow-md">
        <h2 className="text-gray-300 text-xs uppercase tracking-wide mb-2">Explorer</h2>
        {files.map((file) => (
          <FileNodeComponent key={file.path} file={file} level={0} onFileSelect={onFileSelect} />
        ))}
      </div>
    );
  };
  
  const FileNodeComponent: React.FC<{ file: FileNode; level: number; onFileSelect: (file: FileNode) => void }> = ({
    file,
    level,
    onFileSelect,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = file.children && file.children.length > 0;
  
    return (
      <div>
        <div
          className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer select-none transition hover:bg-gray-800"
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => {
            if (file.type === "file") {
              onFileSelect(file); // Pass full file instead of just content
            } else if (hasChildren) {
              setIsOpen(!isOpen);
            }
          }}
        >
          {file.type === "folder" ? (
            isOpen ? <FolderOpen className="w-4 h-4 text-yellow-400" /> : <Folder className="w-4 h-4 text-yellow-500" />
          ) : (
            <FileText className="w-4 h-4 text-gray-400" />
          )}
          <span className="truncate">{file.name}</span>
        </div>
  
        {hasChildren && isOpen && (
          <div className="ml-3 border-l border-gray-700 pl-2">
            {file.children?.map((child) => (
              <FileNodeComponent key={child.path} file={child} level={level + 1} onFileSelect={onFileSelect} />
            ))}
          </div>
        )}
      </div>
    );
  };