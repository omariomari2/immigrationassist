import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, Loader2, Sparkles, Brain } from 'lucide-react';

interface SourceFile {
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
}

import { MegaTab, TabOption } from '../../types';
import { PageHeader } from '../PageHeader';

interface SourceOfTruthProps {
    activeMegaTab: MegaTab;
    activeTab: TabOption;
    onMegaTabChange: (tab: MegaTab) => void;
    onUserClick: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'learning' | 'success';

export const SourceOfTruth: React.FC<SourceOfTruthProps> = ({ activeMegaTab, activeTab, onMegaTabChange, onUserClick }) => {
    const [files, setFiles] = useState<SourceFile[]>([
        { id: '1', name: 'USCIS_Policy_Manual_2024.pdf', type: 'PDF', date: '2024-01-15', size: '2.4 MB' },
        { id: '2', name: 'H1B_FY2025_Guidelines.pdf', type: 'PDF', date: '2024-02-01', size: '1.8 MB' },
        { id: '3', name: 'DOJ_Immigration_Court_Practice_Manual.pdf', type: 'PDF', date: '2023-11-20', size: '5.1 MB' },
    ]);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [currentFile, setCurrentFile] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const uploadFile = async (file: File) => {
        if (uploadStatus !== 'idle') return;

        setUploadStatus('uploading');
        setCurrentFile(file.name);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8001'}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            // Success - Move to Learning Phase
            setUploadStatus('learning');

            // Simulate AI Learning (2.5 seconds)
            setTimeout(() => {
                setUploadStatus('success');

                // Add file to list
                const newFile: SourceFile = {
                    id: `new-${Date.now()}`,
                    name: file.name,
                    type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                    date: new Date().toISOString().split('T')[0],
                    size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                };
                setFiles(prev => [...prev, newFile]);

                // Reset after showing success
                setTimeout(() => {
                    setUploadStatus('idle');
                    setCurrentFile('');
                }, 3000);
            }, 2500);

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('idle');
            setCurrentFile('');
            alert('Failed to upload file');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            uploadFile(droppedFiles[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFile(e.target.files[0]);
        }
    };

    const removeFile = (id: string) => {
        setFiles(files.filter(f => f.id !== id));
    };

    return (
        <div className="flex flex-col gap-6 mb-8">
            <PageHeader
                title="Source of Truth"
                breadcrumbs={
                    <div className="flex items-center gap-2 text-xs text-textTertiary">
                        <span className="w-2 h-2 bg-gray-300 rounded-sm"></span>
                        <span>Knowledge Base</span>
                        <span className="text-gray-300">/</span>
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="font-medium text-gray-500">Active</span>
                    </div>
                }
                activeMegaTab={activeMegaTab}
                activeTab={activeTab}
                onMegaTabChange={onMegaTabChange}
                onUserClick={onUserClick}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Area */}
                <div
                    className={`lg:col-span-1 bg-white p-6 rounded-3xl shadow-soft flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed transition-all group relative overflow-hidden ${uploadStatus === 'idle' ? 'border-transparent hover:border-gray-200' :
                            uploadStatus === 'success' ? 'border-green-100 bg-green-50/30' : 'border-gray-100'
                        }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => uploadStatus === 'idle' && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.docx,.txt"
                    />

                    {uploadStatus === 'idle' && (
                        <>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors mb-4">
                                <Upload className="w-5 h-5" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Upload Documents</h3>
                            <p className="text-sm text-gray-500 mb-4 px-4">Drag and drop PDF or DOCX files here to add to the knowledge base.</p>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max 10MB</span>
                        </>
                    )}

                    {uploadStatus === 'uploading' && (
                        <div className="flex flex-col items-center animate-in fade-in duration-300">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black mb-4">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Uploading...</h3>
                            <p className="text-sm text-gray-500">{currentFile}</p>
                        </div>
                    )}

                    {uploadStatus === 'learning' && (
                        <div className="flex flex-col items-center animate-in fade-in duration-500">
                            <div className="relative mb-4">
                                <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center absolute inset-0 animate-ping"></div>
                                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white relative z-10 shadow-lg">
                                    <Brain className="w-8 h-8 animate-pulse" />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                                    <Sparkles className="w-4 h-4 text-yellow-500 animate-bounce" />
                                </div>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Garvey is learning...</h3>
                            <p className="text-xs text-gray-500 px-4">Processing {currentFile} into knowledge graph</p>
                        </div>
                    )}

                    {uploadStatus === 'success' && (
                        <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-sm">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Knowledge Added</h3>
                            <p className="text-xs text-gray-500">{currentFile} is now available to Garvey</p>
                        </div>
                    )}
                </div>

                {/* File List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-soft">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Active Documents ({files.length})
                        </h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        {files.map((file) => (
                            <div key={file.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{file.type}</span>
                                            <span className="text-[10px] text-gray-400">{file.size}</span>
                                            <span className="text-[10px] text-gray-300">•</span>
                                            <span className="text-[10px] text-gray-400">{file.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {files.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-sm text-gray-400">No documents uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
