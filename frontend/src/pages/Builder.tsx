import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BACKEND_URL } from "../Util/BACKEND_URL";
import axios from "axios";
import { parseBoltXml } from "../Util/parseXml";
import { FileExplorer } from "../components/FileExplorer";
import Editor from "@monaco-editor/react";
import Loader from "../components/Loader";

interface LLMMessage {
    role: "user" | "assistant" | "system";
    parts: { text: string }[];
}

export interface FileNode {
    name: string;
    type: "file" | "folder";
    path: string;
    content?: string;
    children?: FileNode[];
}

const Builder = () => {
    const location = useLocation();
    const prompt = location.state?.prompt || "";
    const [llmMessages, setLlmMessages] = useState<LLMMessage[]>([]);
    const [files, setFiles] = useState<FileNode[]>([]);
    const [editorContent, setEditorContent] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [steps, setSteps] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [textAreaChat,setTextAreaChat] = useState("");

    const dfsFilesOnly = useCallback((node: FileNode, stepsArray: string[]) => {
        if (node.type === "file") {
            stepsArray.push(`Created ${node.name} at ${node.path}`);
        }
        if (node.children) {
            node.children.forEach(child => dfsFilesOnly(child, stepsArray));
        }
    }, []);

    const updateFiles = useCallback((newFiles: FileNode[], existingFiles: FileNode[]): FileNode[] => {
        const fileMap = new Map(existingFiles.map(file => [file.path, file]));
        newFiles.forEach(newFile => {
            if (fileMap.has(newFile.path)) {
                const existingFile = fileMap.get(newFile.path)!;
                if (existingFile.type === "file") {
                    existingFile.content = newFile.content;
                } else if (newFile.children) {
                    existingFile.children = updateFiles(newFile.children, existingFile.children || []);
                }
            } else {
                existingFiles.push(newFile);
            }
        });
        return [...existingFiles];
    }, []);

    const handleFileSelect = (file: FileNode) => {
        setSelectedFile(file);
        setEditorContent(file.content || "");
    };

    const handleEditorChange = (value: string | undefined) => {
        if (!selectedFile) return;
        setEditorContent(value || "");
        setFiles(prevFiles => {
            const updateFileContent = (nodes: FileNode[]): FileNode[] =>
                nodes.map(node =>
                    node.path === selectedFile.path
                        ? { ...node, content: value || "" }
                        : node.children
                        ? { ...node, children: updateFileContent(node.children) }
                        : node
                );  
            return updateFileContent(prevFiles);
        });
    };


    useEffect(() => {
        const setTemplateFunction = async () => {
            try {
                setLoading(true);
                const response = await axios.post(`${BACKEND_URL}/template`, { prompt });
                const parsedSteps = await parseBoltXml(response.data.uiPrompts);
                setFiles(parsedSteps);
                const newFiles: string[] = [];
                parsedSteps.forEach(step => dfsFilesOnly(step, newFiles));
                setSteps(newFiles);

                const newMessages: LLMMessage[] = [
                    { role: "user", parts: [{ text: JSON.stringify(parsedSteps) }] },
                    { role: "user", parts: [{ text: prompt }] }
                ];
                setLlmMessages(prev => [...prev, ...newMessages]);

                const chatResponse = await axios.post(`${BACKEND_URL}/chat`, { content: newMessages });
                const againParsedSteps = parseBoltXml([chatResponse.data.response]);
                const updatedFiles2 = updateFiles(againParsedSteps, parsedSteps)
                setFiles(updatedFiles2);
                againParsedSteps.forEach(step => dfsFilesOnly(step, newFiles));

                setLlmMessages((prev)=>{
                    const updatedMessages = [...prev];
                    updatedMessages[0] = {
                        ...updatedMessages[0],
                        parts: [{ text: JSON.stringify(updatedFiles2)  }], // Modify the text content
                    };
                    return updatedMessages;
                })
                
            } catch (error) {
                console.error("Error fetching template:", error);
            }finally{
                setLoading(false);
            }
        };
        if (performance.navigation.type === 1) {
            setTemplateFunction();
        }
    }, [dfsFilesOnly, prompt, updateFiles]);

   
    const handleSend = async()=>{
        if(textAreaChat==="")return;
        setLoading(true);
        const allLLmMessages:LLMMessage[] = [...llmMessages,{role:"user",parts:[{text:textAreaChat}]}]
        const chatResponse = await axios.post(`${BACKEND_URL}/chat`,{
            content:allLLmMessages
        })
        const againParsedSteps = parseBoltXml(chatResponse.data.response);
        const updatedFiles2 = updateFiles(againParsedSteps, files)
        setFiles(updatedFiles2);
        const newFiles: string[] = [];
        againParsedSteps.forEach(step => dfsFilesOnly(step, newFiles));
        setSteps((prev)=>[...prev, ...newFiles])
        setLlmMessages((prev)=>{
            const updatedMessages = [...prev];
            updatedMessages[0] = {
                ...updatedMessages[0],
                parts: [{ text: JSON.stringify(updatedFiles2)  }], // Modify the text content
            };
            return updatedMessages;
        })
        if (selectedFile) {
            const updatedFile = updatedFiles2.find(file => file.path === selectedFile.path);
            if (updatedFile) {
                setSelectedFile(updatedFile);
                setEditorContent(updatedFile.content || "");
            }
        }
    
        setLoading(false);
    }


    return (
        <div className="min-h-screen flex flex-col bg-gray-800 relative">
            {/* Loader (Fixed at the very top, stays above everything) */}
            {loading && (
                <div className="fixed top-0 left-0 w-full h-[2rem] bg-gray-800 flex items-center justify-center z-50">
                    <Loader />
                </div>
            )}
    
            <div className="flex flex-col md:flex-row flex-1 pt-[2rem]">
                {/* Sidebar */}
                <div className="w-full md:w-[20rem] h-auto md:h-full bg-gray-900 p-4 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col">
                    
                    {/* Process Section (Fixed height) */}
                    <div className="h-[6rem]">
                        <h2 className="text-lg font-semibold text-green-500 mb-2">Process</h2>
                        <div className="bg-gray-800 text-white px-3 py-2 rounded-md shadow-md">
                            Total Steps: <span className="text-green-400 font-bold">{steps.length}</span>
                        </div>
                    </div>
    
                    {/* Steps (Scrollable if needed) */}
                    <div className="mt-2 max-h-[6rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600">
                        {steps.map((step, index) => (
                            <div key={index} className="bg-gray-800 text-sm text-white p-2 rounded-md border border-gray-700 mb-1">
                                {step}
                            </div>
                        ))}
                    </div>
    
                    {/* File Explorer (Fixed height & Scrollable) */}
                    <div className="mt-4 border-t border-gray-700 pt-3 h-[18rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                        <FileExplorer files={files} onFileSelect={handleFileSelect} />
                    </div>
    
                    {/* Text Input & Send Button */}
                    <div className="mt-4">
                        <textarea
                            className="w-full h-[100px] bg-gray-800 text-white border border-gray-700 p-2 rounded-md resize-none"
                            placeholder="Ask AI to do something"
                            onChange={(e) => setTextAreaChat(e.target.value)}
                        />
                        <button 
                            className="mt-2 w-full md:w-[5rem] h-[2.5rem] bg-blue-700 text-white rounded-md"
                            onClick={handleSend}
                        >
                            Send
                        </button>
                    </div>
                </div>
    
                {/* Editor Section */}
                <div className="flex-1 p-4 overflow-auto">
                    <Editor 
                        height="100%" 
                        defaultLanguage="javascript" 
                        theme="vs-dark" 
                        value={editorContent} 
                        onChange={handleEditorChange} 
                    />
                </div>
            </div>
        </div>
    );
    
};

export default Builder;
