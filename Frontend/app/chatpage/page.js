"use client"
import { useEffect, useRef, useState } from 'react';
import SideNav from '@/app/componant/nav';
import { BsPersonCircle, BsPaperclip, BsEmojiSmile, BsX, BsImage, BsFileEarmark } from 'react-icons/bs';
import { IoSend, IoCheckmarkDone, IoClose } from 'react-icons/io5';
import { FiFile, FiImage, FiVideo, FiMusic } from 'react-icons/fi';
import { endpoint } from '@/endpoints';
import axios from 'axios';
import { redirect, useRouter } from 'next/navigation';

const Chats = () => {
    const router = useRouter()
    const [input, setInput] = useState({
        "action": "message",
        "message": "",
        "receiver": ""
    });
    const [chatHistory, setChatHistory] = useState([])
    const [userChat, setUserChat] = useState({})
    const [userLogData, setUserLogData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const [error, setError] = useState(null)
    const socket = useRef(null)
    const inputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    const roomIdRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)
    const reconnectAttempts = useRef(0)
    const typingTimeoutRef = useRef(null)
    const typingDebounceRef = useRef(null)

    useEffect(() => {
        const isLogin = JSON.parse(localStorage.getItem('user'))
        if (!isLogin) {
            redirect('/')
            setIsLoading(false)
        } else {
            setIsLoading(false)
        }
    }, [])

    const connectWebSocket = (userId, chatUserId, roomId) => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.close();
        }

        try {
            setConnectionStatus('connecting');
            socket.current = new WebSocket(`${endpoint.connection}/${userId}/${chatUserId}/`);
            
            socket.current.addEventListener("open", (event) => {
                console.log("Socket connected successfully");
                setConnectionStatus('connected');
                reconnectAttempts.current = 0;
                setError(null);
            });

            socket.current.addEventListener("message", (event) => {
                try {
                    const receivedMessage = JSON.parse(event.data);
                    const currentUser = JSON.parse(localStorage.getItem('user'));
                    const currentUserId = currentUser?.id;
                    
                    // Handle typing indicator - only show if OTHER user is typing
                    if (receivedMessage.action === 'typing') {
                        // Check if the typing is from the other user, not from current user
                        const typingSenderId = receivedMessage.sender_id || receivedMessage.sender?.id;
                        if (typingSenderId && typingSenderId !== currentUserId) {
                            setIsTyping(true);
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }
                            typingTimeoutRef.current = setTimeout(() => {
                                setIsTyping(false);
                            }, 3000);
                        } else {
                            // If it's from current user, don't show typing indicator
                            setIsTyping(false);
                        }
                    } else if (receivedMessage.action === 'typing_stopped') {
                        // Stop typing indicator when other user stops typing
                        const typingSenderId = receivedMessage.sender_id || receivedMessage.sender?.id;
                        if (typingSenderId && typingSenderId !== currentUserId) {
                            setIsTyping(false);
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }
                        }
                    } else {
                        // Refresh messages
                        if (roomId) {
                            axios.get(`${endpoint.messages}/${roomId}/messages`, {
                                headers: {
                                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.access}`
                                }
                            }).then((messagesRes) => {
                                setChatHistory(messagesRes.data);
                                // Scroll to bottom after new message
                                setTimeout(() => {
                                    scrollToBottom();
                                }, 100);
                            }).catch(err => {
                                console.error('Error fetching messages:', err);
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            socket.current.addEventListener("error", (error) => {
                console.error("WebSocket error:", error);
                setConnectionStatus('error');
                setError('Connection error. Attempting to reconnect...');
            });

            socket.current.addEventListener("close", (event) => {
                console.log("Socket closed");
                setConnectionStatus('disconnected');
                
                // Auto-reconnect logic
                if (reconnectAttempts.current < 5) {
                    reconnectAttempts.current += 1;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket(userId, chatUserId, roomId);
                    }, delay);
                } else {
                    setError('Failed to reconnect. Please refresh the page.');
                }
            });
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            setConnectionStatus('error');
            setError('Failed to connect. Please try again.');
        }
    };

    useEffect(() => {
        const logid = localStorage.getItem("user") ? JSON.parse(localStorage?.getItem("user")) : ""
        const id = logid.id
        if (userChat.id) {
            try {
                const userToken = logid.access;
                axios.get(`${endpoint.roomId}/?member_1=${id}&member_2=${userChat.id}`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                }).then((roomRes) => {
                    if (roomRes.data.roomId) {
                        const roomId = roomRes.data.id;
                        roomIdRef.current = roomId;
                        axios.get(`${endpoint.messages}/${roomId}/messages`, {
                            headers: {
                                'Authorization': `Bearer ${userToken}`
                            }
                        }).then((messagesRes) => {
                            // Messages are ordered oldest first (ascending), so they're in correct order
                            setChatHistory(messagesRes.data);
                            // Scroll to bottom after messages load
                            setTimeout(() => {
                                scrollToBottom();
                            }, 200);
                        }).catch(err => {
                            console.error('Error fetching messages:', err);
                            setError('Failed to load messages');
                        });
                        
                        connectWebSocket(id, userChat.id, roomId);
                    }
                }).catch(err => {
                    console.error('Error getting room:', err);
                    setError('Failed to load chat room');
                });
            } catch (error) {
                console.error('Error in useEffect:', error);
                setError('An error occurred');
            }
        }
        
        return () => {
            if (socket.current) {
                socket.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (typingDebounceRef.current) {
                clearTimeout(typingDebounceRef.current);
            }
        };
    }, [userChat]);

    const oneToOneConnection = (data) => {
        if (socket.current) {
            socket.current.close();
        }
        setUserChat(data)
        setInput({
            ...input,
            receiver: data.id
        })
        setSelectedFiles([])
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    }

    const handleFiles = (files) => {
        const validFiles = files.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }))]);
    }

    const removeFile = (fileId) => {
        setSelectedFiles(prev => {
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== fileId);
        });
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return <FiImage className="w-5 h-5" />;
        if (file.type.startsWith('video/')) return <FiVideo className="w-5 h-5" />;
        if (file.type.startsWith('audio/')) return <FiMusic className="w-5 h-5" />;
        return <FiFile className="w-5 h-5" />;
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    const handleSendMessage = async () => {
        if (!input.message.trim() && selectedFiles.length === 0) return;
        
        // Clear typing indicator when sending message
        if (typingDebounceRef.current) {
            clearTimeout(typingDebounceRef.current);
        }
        setIsTyping(false);
        
        // Send typing stopped signal
        if (socket.current && socket.current.readyState === WebSocket.OPEN && input.receiver) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            socket.current.send(JSON.stringify({
                action: 'typing_stopped',
                receiver: input.receiver,
                sender_id: currentUser.id
            }));
        }
        
        const userToken = JSON.parse(localStorage.getItem('user'))?.access;
        if (!userToken) {
            alert('Please login again');
            router.push('/');
            return;
        }
        
        // Handle file uploads first
        if (selectedFiles.length > 0) {
            for (const fileData of selectedFiles) {
                const formData = new FormData();
                formData.append('file', fileData.file);
                formData.append('receiver', input.receiver);
                formData.append('message', input.message || `Sent ${fileData.file.name}`);
                if (roomIdRef.current) {
                    formData.append('room_id', roomIdRef.current);
                }
                
                try {
                    const uploadResponse = await axios.post(
                        endpoint.uploadFile,
                        formData,
                        {
                            headers: {
                                'Authorization': `Bearer ${userToken}`,
                                'Content-Type': 'multipart/form-data',
                            }
                        }
                    );
                    
                    // File uploaded successfully, refresh messages after a short delay
                    if (roomIdRef.current) {
                        setTimeout(() => {
                            axios.get(`${endpoint.messages}/${roomIdRef.current}/messages`, {
                                headers: {
                                    'Authorization': `Bearer ${userToken}`
                                }
                            }).then((res) => {
                                // Messages are ordered oldest first (ascending), newest at bottom
                                setChatHistory(res.data);
                                // Scroll to bottom after messages load to show new file
                                setTimeout(() => {
                                    scrollToBottom();
                                }, 200);
                            }).catch(err => {
                                console.error('Error fetching messages after upload:', err);
                            });
                        }, 800); // Slightly longer delay to ensure file is saved
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert(`Failed to upload ${fileData.file.name}. Please try again.`);
                }
            }
        }
        
        // Send text message if exists
        if (input.message.trim()) {
            const messageToSend = {
                ...input,
                message: input.message.trim()
            };
            
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify(messageToSend));
            }
        }
        
        setInput({
            ...input,
            message: ''
        });
        setSelectedFiles([]);
        
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleInputChange = (e) => {
        setInput({
            ...input,
            message: e.target.value
        });
        
        // Clear previous typing debounce
        if (typingDebounceRef.current) {
            clearTimeout(typingDebounceRef.current);
        }
        
        // Send typing indicator to OTHER user (not show to self) with debounce
        if (socket.current && socket.current.readyState === WebSocket.OPEN && e.target.value.trim()) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            
            // Debounce typing indicator (send after 500ms of no typing)
            typingDebounceRef.current = setTimeout(() => {
                if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                    socket.current.send(JSON.stringify({
                        action: 'typing',
                        receiver: input.receiver,
                        sender_id: currentUser.id,  // Include sender ID so backend can identify
                        sender: {
                            id: currentUser.id,
                            first_name: currentUser.first_name,
                            last_name: currentUser.last_name
                        }
                    }));
                }
            }, 500);
        } else {
            // If input is empty, stop typing indicator
            if (socket.current && socket.current.readyState === WebSocket.OPEN && input.receiver) {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                socket.current.send(JSON.stringify({
                    action: 'typing_stopped',
                    receiver: input.receiver,
                    sender_id: currentUser.id
                }));
            }
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        const userlogin = JSON.parse(localStorage.getItem('user'))
        setUserLogData(userlogin)
    }, [])

    const logoutHander = () => {
        if (socket.current) {
            socket.current.close();
        }
        localStorage.removeItem("user")
        router.push("/")
    }

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    const isMyMessage = (chat) => {
        // Check if the sender is the current user
        const currentUserId = userLogData?.id;
        if (chat.sender_id) {
            return chat.sender_id === currentUserId;
        }
        // Fallback: check by sender name
        if (chat.sender_name) {
            return chat.sender_name === `${userLogData?.first_name} ${userLogData?.last_name}`;
        }
        // Last fallback: if userName matches current user, it means we're the receiver, so it's NOT our message
        return false;
    }

    return (
        <>
            {isLoading ? (
                <div className='flex items-center justify-center h-screen bg-gray-50'>
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading your chats...</p>
                    </div>
                </div>
            ) : (
                <div className='h-screen w-full flex overflow-hidden bg-gray-50'>
                    <SideNav setUserChat={setUserChat} oneToOneConnection={oneToOneConnection} onLogout={logoutHander} />
                    
                    {Object.keys(userChat).length ? (
                        <div className='flex flex-col bg-white w-full h-full flex-1 overflow-hidden border-l border-gray-200'>
                            {/* Header */}
                            <div className='flex items-center justify-between p-4 bg-white border-b border-gray-200'>
                                <div className='flex items-center space-x-3'>
                                    <div className='relative'>
                                        <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold'>
                                            {userChat.first_name?.[0]}{userChat.last_name?.[0]}
                                        </div>
                                        <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></span>
                                    </div>
                                    <div>
                                        <h2 className='font-semibold text-gray-900'>{userChat.first_name} {userChat.last_name}</h2>
                                        <p className='text-xs text-gray-500 flex items-center'>
                                            {isTyping ? (
                                                <>
                                                    <span className='typing-indicator mr-2'>
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                    typing...
                                                </>
                                            ) : (
                                                <>
                                                    <span className='w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5'></span>
                                                    Online
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {error && (
                                    <div className='flex items-center space-x-2 px-3 py-1 bg-red-500/80 rounded-lg text-xs'>
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}
                                {connectionStatus === 'connecting' && (
                                    <div className='flex items-center space-x-2 px-3 py-1 bg-yellow-500/80 rounded-lg text-xs'>
                                        <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                                        <span>Connecting...</span>
                                    </div>
                                )}
                            </div>

                            {/* Messages Area */}
                            <div 
                                className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 scrollbar-hide relative"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 0c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-48 48c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 0c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%239C92AC' fill-opacity='0.015'/%3E%3C/svg%3E")`
                                }}
                            >
                                {isDragging && (
                                    <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-blue-400 rounded-lg m-4">
                                        <div className="text-center">
                                            <BsPaperclip className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce" />
                                            <p className="text-2xl font-bold text-blue-600">Drop files here</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    {chatHistory.map((chat, index) => {
                                        const myMessage = isMyMessage(chat);
                                        const hasFile = chat.file_url || chat.message_type === 'file' || chat.message_type === 'image';
                                        const isImage = chat.message_type === 'image' && chat.file_url;
                                        
                                        return (
                                            <div
                                                key={chat.id || index}
                                                className={`flex ${myMessage ? 'justify-end' : 'justify-start'} message-enter`}
                                            >
                                                <div className={`flex flex-col max-w-[75%] ${myMessage ? 'items-end' : 'items-start'}`}>
                                                    {!myMessage && (
                                                        <span className="text-xs text-gray-500 mb-1 px-2 font-medium">
                                                            {chat.sender_name || chat.userName}
                                                        </span>
                                                    )}
                                                    <div
                                                        className={`relative px-4 py-2.5 rounded-lg shadow-sm ${
                                                            myMessage
                                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                                : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                                                        }`}
                                                    >
                                                        {isImage ? (
                                                            <div className="mb-2">
                                                                <img 
                                                                    src={chat.file_url} 
                                                                    alt={chat.file_name || 'Image'}
                                                                    className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => window.open(chat.file_url, '_blank')}
                                                                />
                                                                {chat.message && chat.message !== `Sent ${chat.file_name}` && (
                                                                    <p className="text-sm mt-2 leading-relaxed break-words whitespace-pre-wrap">
                                                                        {chat.message}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : hasFile && chat.file_url ? (
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const userToken = JSON.parse(localStorage.getItem('user'))?.access;
                                                                        if (!userToken) {
                                                                            alert('Please login again');
                                                                            return;
                                                                        }
                                                                        
                                                                        // Try direct file URL first (for images and media files)
                                                                        if (chat.file_url && (chat.message_type === 'image' || chat.file_url.includes('media/'))) {
                                                                            // For images, open in new tab; for other files, download
                                                                            if (chat.message_type === 'image') {
                                                                                window.open(chat.file_url, '_blank');
                                                                            } else {
                                                                                // Download file
                                                                                const link = document.createElement('a');
                                                                                link.href = chat.file_url;
                                                                                link.setAttribute('download', chat.file_name || 'file');
                                                                                link.setAttribute('target', '_blank');
                                                                                document.body.appendChild(link);
                                                                                link.click();
                                                                                link.remove();
                                                                            }
                                                                        } else {
                                                                            // Fallback to download endpoint
                                                                            const response = await axios.get(
                                                                                `${endpoint.downloadFile}/${chat.id}/`,
                                                                                {
                                                                                    headers: {
                                                                                        'Authorization': `Bearer ${userToken}`
                                                                                    },
                                                                                    responseType: 'blob'
                                                                                }
                                                                            );
                                                                            
                                                                            // Create blob URL and download
                                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                                            const link = document.createElement('a');
                                                                            link.href = url;
                                                                            link.setAttribute('download', chat.file_name || 'file');
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            link.remove();
                                                                            window.URL.revokeObjectURL(url);
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error downloading file:', error);
                                                                        // Fallback to opening URL directly
                                                                        if (chat.file_url) {
                                                                            window.open(chat.file_url, '_blank');
                                                                        } else {
                                                                            alert('Failed to download file. Please try again.');
                                                                        }
                                                                    }
                                                                }}
                                                                className={`w-full flex items-center space-x-3 mb-2 p-3 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                                                                    myMessage 
                                                                        ? 'bg-white/20 hover:bg-white/30' 
                                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                <div className={`p-2 rounded-lg ${myMessage ? 'bg-white/30' : 'bg-blue-100'}`}>
                                                                    {chat.message_type === 'image' ? (
                                                                        <BsImage className={`w-6 h-6 ${myMessage ? 'text-white' : 'text-blue-600'}`} />
                                                                    ) : (
                                                                        <BsFileEarmark className={`w-6 h-6 ${myMessage ? 'text-white' : 'text-blue-600'}`} />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <p className={`text-sm font-semibold ${myMessage ? 'text-white' : 'text-gray-800'}`}>
                                                                        {chat.file_name || 'File'}
                                                                    </p>
                                                                    <p className={`text-xs ${myMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                        {chat.file_size ? formatFileSize(chat.file_size) : 'Unknown size'} • Click to download
                                                                    </p>
                                                                </div>
                                                                <div className={`p-1 rounded ${myMessage ? 'bg-white/20' : 'bg-gray-200'}`}>
                                                                    <svg className={`w-5 h-5 ${myMessage ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                </div>
                                                            </button>
                                                        ) : (
                                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                                {chat.message}
                                                            </p>
                                                        )}
                                                        <div className={`flex items-center justify-end mt-2 space-x-1 ${myMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            <span className="text-xs">{formatTime(chat.timestamp || chat.created_at)}</span>
                                                            {myMessage && (
                                                                <IoCheckmarkDone className={`w-4 h-4 ${chat.is_read ? 'text-blue-300' : ''}`} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white px-4 py-2.5 rounded-lg rounded-bl-sm shadow-sm border border-gray-200">
                                                <div className="typing-indicator">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* File Preview Area */}
                            {selectedFiles.length > 0 && (
                                <div className='px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-t border-gray-200/50'>
                                    <div className='flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2'>
                                        {selectedFiles.map((fileData) => (
                                            <div key={fileData.id} className='relative flex-shrink-0 group'>
                                                {fileData.preview ? (
                                                    <div className='relative w-20 h-20 rounded-lg overflow-hidden border-2 border-blue-400 shadow-md'>
                                                        <img 
                                                            src={fileData.preview} 
                                                            alt={fileData.file.name}
                                                            className='w-full h-full object-cover'
                                                        />
                                                        <button
                                                            onClick={() => removeFile(fileData.id)}
                                                            className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'
                                                        >
                                                            <IoClose className='w-4 h-4' />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className='relative w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-400 flex flex-col items-center justify-center shadow-md group-hover:shadow-lg transition-shadow'>
                                                        {getFileIcon(fileData.file)}
                                                        <button
                                                            onClick={() => removeFile(fileData.id)}
                                                            className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'
                                                        >
                                                            <IoClose className='w-4 h-4' />
                                                        </button>
                                                        <span className='text-xs text-gray-600 mt-1 truncate w-full px-1' title={fileData.file.name}>
                                                            {fileData.file.name.length > 8 ? fileData.file.name.substring(0, 8) + '...' : fileData.file.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                            </div>
                            )}

                            {/* Input Area */}
                            <div className='p-4 bg-white border-t border-gray-200'>
                                <div className="flex items-end space-x-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className='p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0'
                                    >
                                        <BsPaperclip className='w-5 h-5' />
                                    </button>
                                    <div className='flex-1 relative'>
                                <input
                                            ref={inputRef}
                                    type="text"
                                            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                            placeholder="Type a message..."
                                    value={input.message}
                                    onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                />
                                        <button className='absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                                            <BsEmojiSmile className='w-5 h-5 text-gray-600' />
                                        </button>
                                    </div>
                                <button
                                    onClick={handleSendMessage}
                                        disabled={!input.message.trim() && selectedFiles.length === 0}
                                        className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
                                            (input.message.trim() || selectedFiles.length > 0)
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <IoSend className='w-5 h-5' />
                                </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 px-2 flex items-center space-x-2">
                                    <span>Press Enter to send, Shift+Enter for new line</span>
                                    <span>•</span>
                                    <span>Drag & drop files or click 📎 to attach</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex-1 flex items-center justify-center bg-white'>
                            <div className="text-center p-8">
                                <div className="mb-6">
                                    <BsPersonCircle className='w-20 h-20 text-gray-300 mx-auto' />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                    Select a chat to start messaging
                                </h3>
                                <p className="text-gray-500">Choose a conversation from the sidebar to begin</p>
                            </div>
                        </div>
                    )}
                    </div>
            )}
        </>
    );
}

export default Chats
