import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BACKEND_URL } from "../Util/BACKEND_URL";
import axios from "axios";
import { parseBoltXml } from "../Util/parseXml";
import { FileExplorer } from "../components/FileExplorer";
import Editor from "@monaco-editor/react";
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
    const [steps,setSteps] = useState<string[]>([]);
    
    const dfsFilesOnly = useCallback((node: FileNode, stepsArray: string[]) => {
        if (node.type === "file") {
            stepsArray.push(`Created ${node.name} at ${node.path}`);
        }
        if (node.type === "folder" && node.children) {
            for (const child of node.children) {
                dfsFilesOnly(child, stepsArray);
            }
        }
    }, []);

    const handleFileSelect = (file: FileNode) => {
        setSelectedFile(file);
        setEditorContent(file.content || "");
    };
    useEffect(() => {
        const setTemplateFunction = async () => {
            const response = await axios.post(`${BACKEND_URL}/template`, {
                prompt
            });
            const parsedSteps = await parseBoltXml(response.data.uiPrompts);
            setFiles(parsedSteps);
            let newSteps: string[] = [];
            parsedSteps.forEach((step) => {
                dfsFilesOnly(step, newSteps);
            });
            setSteps(newSteps); 
            
            const newMessages: LLMMessage[] = [
                { role: "user", parts: [{ text: JSON.stringify(parsedSteps) }] },
                { role: "user", parts: [{ text: prompt }] }
            ];
            setLlmMessages((prev) => [...prev, ...newMessages]);

            const chatResponse = await axios.post(`${BACKEND_URL}/chat`,{
                content:newMessages
            })

        };
        setTemplateFunction();
    }, [dfsFilesOnly, prompt]);

    const handleEditorChange = (value: string | undefined) => {
        if (!selectedFile) return;
        
        setEditorContent(value || "");
    
        // Update the content of the selected file in `files`
        setFiles((prevFiles) => {
            const updateFileContent = (nodes: FileNode[]): FileNode[] => {
                return nodes.map(node => {
                    if (node.path === selectedFile.path) {
                        return { ...node, content: value || "" };
                    } else if (node.children) {
                        return { ...node, children: updateFileContent(node.children) };
                    }
                    return node;
                });
            };
            return updateFileContent(prevFiles);
        });
    };



    return (
        <div className="flex h-screen bg-gray-800">
            <p className="text-white">{JSON.stringify(files)}</p>
            {/* <div className="w-[20rem] h-full bg-gray-900 p-4 border-r border-gray-700 flex flex-col">
                <h2 className="text-lg font-semibold text-green-500 mb-2">Process</h2>
                <div className="bg-gray-800 text-white px-3 py-2 rounded-md shadow-md ">
                    Total Steps: <span className="text-green-400 font-bold">{steps.length}</span>
                </div>

                <div className="mt-4 h-10 overflow-hidden">
                    <div className="overflow-y-auto h-full pr-2 scrollbar-none">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 text-sm text-white p-2 rounded-md border border-gray-700"
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 border-t border-gray-700 pt-3">
                    <FileExplorer files={files} onFileSelect={handleFileSelect} />
                </div>
            </div>
            
            <div className="flex-1 p-4">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={editorContent}
                    onChange={handleEditorChange}
                />
            </div> */}
        </div>
    );
};

export default Builder;
