"use client"
import { endpoint } from '@/endpoints';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai';
import { BsPersonCircle } from 'react-icons/bs';
import { BsStarFill } from 'react-icons/bs';
import { IoLogOutOutline } from 'react-icons/io5';
import Logo from '@/app/componant/Logo';

const SideNav = ({ oneToOneConnection, onLogout }) => {
    const [userData, setUserData] = useState([])
    const [previousChatUsers, setPreviousChatUser] = useState([])
    const [searchField, setSearchField] = useState("");
    const [filteredUserData, setFilteredUserData] = useState([]);
    const [loguser, setLogUser] = useState()
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        getPreviousChatUsers()
    }, [])

    const getPreviousChatUsers = async () => {
        const logid = localStorage.getItem("user") ? JSON.parse(localStorage?.getItem("user")) : ""
        setLogUser(logid)
        const id = logid.id

        if (logid.id) {
            try {
            const response = await axios(`${endpoint.chats}/${id}/chats`)
            setPreviousChatUser(response.data)
            } catch (error) {
                console.error("Error fetching chats:", error)
            }
        }
    }

    const handelSearch = async (e) => {
        const searchValue = e.target.value;
        setSearchField(searchValue)
        
        if (searchValue.trim()) {
        try {
            const res = await axios.get(`${endpoint.getUser}/?name=${searchValue}`)
            if (res.status == 200) {
                setUserData(res.data);
                setFilteredUserData(res.data);
            }
        } catch (error) {
                console.error("Search error:", error)
                setFilteredUserData([])
            }
        } else {
            setFilteredUserData([])
        }
    }

    const handleUserClick = (user) => {
        setSelectedUser(user.id)
        oneToOneConnection(user)
    }

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
    }

    const getGradientClass = (index) => {
        const gradients = [
            'from-blue-400 to-indigo-500',
            'from-purple-400 to-pink-500',
            'from-green-400 to-teal-500',
            'from-orange-400 to-red-500',
            'from-yellow-400 to-orange-500',
            'from-pink-400 to-rose-500',
            'from-cyan-400 to-blue-500',
            'from-violet-400 to-purple-500',
        ];
        return gradients[index % gradients.length];
    }

    return (
        <div className='w-80 bg-white h-full flex flex-col border-r border-gray-200'>
            {/* Logo Header */}
            <div className='p-4 bg-white border-b border-gray-200'>
                <Logo size="default" showText={true} className="justify-center" />
            </div>
            
            {/* User Profile Header */}
            <div className='p-4 bg-gray-50 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3 flex-1 min-w-0'>
                        <div className='relative'>
                            <div className='w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold'>
                                {loguser ? getInitials(loguser.first_name, loguser.last_name) : <BsPersonCircle className='w-6 h-6' />}
                            </div>
                            <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></span>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <h2 className='font-semibold text-sm text-gray-900 truncate'>
                                {loguser?.first_name} {loguser?.last_name}
                            </h2>
                            <p className='text-xs text-gray-500 truncate flex items-center'>
                                <span className='w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5'></span>
                                Active now
                            </p>
                        </div>
                    </div>
                    {onLogout && (
                        <button 
                            onClick={onLogout}
                            className='p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors flex-shrink-0'
                            title="Logout"
                        >
                            <IoLogOutOutline className='w-5 h-5' />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className='p-4 border-b border-gray-200 bg-white'>
                <div className='relative'>
                    <input
                        className='w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm'
                        placeholder='Search users...'
                        value={searchField}
                        onChange={handelSearch}
                    />
                    <AiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                </div>
            </div>

            {/* Chats List */}
            <div className='flex-1 overflow-y-auto scrollbar-hide bg-white'>
                {filteredUserData.length > 0 && (
                    <>
                        <div className='px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10'>
                            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                Search Results
                            </p>
                        </div>
                        {filteredUserData.map((data, index) => (
                            <div
                                key={`search-${data.id || index}`}
                                className={`flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 ${
                                    selectedUser === data.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                }`}
                                onClick={() => handleUserClick(data)}
                            >
                                <div className='relative flex-shrink-0'>
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGradientClass(index)} flex items-center justify-center text-white font-semibold text-sm`}>
                                        {getInitials(data.first_name, data.last_name)}
                                    </div>
                                    <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></span>
                                </div>
                                <div className='ml-3 flex-1 min-w-0'>
                                    <p className='text-sm font-medium text-gray-900 truncate'>
                                        {data.first_name} {data.last_name}
                                    </p>
                                    <p className='text-xs text-gray-500 truncate mt-0.5'>{data.email}</p>
                                </div>
                            </div>
                        ))}
                        {/* Only show previous chats that are NOT in search results */}
                        {(() => {
                            const searchResultIds = new Set(filteredUserData.map(u => u.id));
                            const uniquePreviousChats = previousChatUsers.filter(chat => !searchResultIds.has(chat.id));
                            
                            if (uniquePreviousChats.length > 0) {
                                return (
                                    <>
                                        <div className='px-4 py-2 bg-gray-50 border-t border-b border-gray-200'>
                                            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                                Previous Chats
                                            </p>
                                        </div>
                                        {uniquePreviousChats.map((data, index) => (
                                            <div
                                                key={`prev-chat-${data.id || index}`}
                                                className={`flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 ${
                                                    selectedUser === data.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                                }`}
                                                onClick={() => handleUserClick(data)}
                                            >
                                                <div className='relative flex-shrink-0'>
                                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGradientClass(index + filteredUserData.length)} flex items-center justify-center text-white font-semibold text-sm`}>
                                                        {getInitials(data.first_name, data.last_name)}
                                                    </div>
                                                    <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></span>
                                                </div>
                                                <div className='ml-3 flex-1 min-w-0'>
                                                    <div className='flex items-center justify-between'>
                                                        <p className='text-sm font-medium text-gray-900 truncate'>
                                                            {data.first_name} {data.last_name}
                                                        </p>
                                                        <span className='text-xs text-gray-400 ml-2 flex-shrink-0'>12:30</span>
                                                    </div>
                                                    <p className='text-xs text-gray-500 truncate mt-0.5'>Tap to start conversation</p>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                );
                            }
                            return null;
                        })()}
                    </>
                )}

                {filteredUserData.length === 0 && previousChatUsers.length > 0 && (
                    <div className='px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10'>
                        <p className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                            Recent Chats
                        </p>
                    </div>
                )}

                {previousChatUsers.map((data, index) => {
                    // Skip if this user is already in search results
                    const isInSearchResults = filteredUserData.some(user => user.id === data.id);
                    if (isInSearchResults) return null;
                    
                    return (
                    <div
                        key={`chat-${data.id || index}`}
                        className={`flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 ${
                            selectedUser === data.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                        onClick={() => handleUserClick(data)}
                    >
                        <div className='relative flex-shrink-0'>
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGradientClass(index + 2)} flex items-center justify-center text-white font-semibold text-sm`}>
                                {getInitials(data.first_name, data.last_name)}
                            </div>
                            <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></span>
                        </div>
                        <div className='ml-3 flex-1 min-w-0'>
                            <div className='flex items-center justify-between'>
                                <p className='text-sm font-medium text-gray-900 truncate'>
                                    {data.first_name} {data.last_name}
                                </p>
                                <span className='text-xs text-gray-400 ml-2 flex-shrink-0'>12:30</span>
                            </div>
                            <p className='text-xs text-gray-500 truncate mt-0.5'>Tap to start conversation</p>
                        </div>
                    </div>
                    );
                })}

                {filteredUserData.length === 0 && previousChatUsers.length === 0 && (
                    <div className='flex flex-col items-center justify-center h-64 text-center px-4'>
                        <div className='mb-4'>
                            <BsPersonCircle className='w-16 h-16 text-gray-300 mx-auto' />
                        </div>
                        <p className='text-gray-600 font-medium text-base mb-1'>No conversations yet</p>
                        <p className='text-gray-400 text-sm'>Search for users to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SideNav
