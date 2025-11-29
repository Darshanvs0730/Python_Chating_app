// Use environment variables for production, fallback to localhost for development
const baseurl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const connectUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000';

export const endpoint = {
    baseurl: baseurl,
    login: `${baseurl}/api/v1/login/`,
    signup: `${baseurl}/api/v1/register/`,
    logout: `${baseurl}/api/v1/logout/`,
    getUser: `${baseurl}/api/v1/get_user`,
    connection: `${connectUrl}/ws/chat`,  // Matches routing: ws/chat/{id1}/{id2}/
    roomId: `${baseurl}/api/v1/get_room_Id`,
    messages: `${baseurl}/api/v1/chats`,
    chats: `${baseurl}/api/v1/users`,
    uploadFile: `${baseurl}/api/v1/upload-file/`,
    downloadFile: `${baseurl}/api/v1/download-file`
}