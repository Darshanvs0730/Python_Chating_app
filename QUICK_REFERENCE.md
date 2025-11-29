# Quick Reference Guide

## 🚀 Running the Project

### Backend:
```bash
cd backend
export SECRET_KEY='your-secret-key'
export ENVIRNOMENT=1
python3.10 manage.py runserver
# OR for WebSocket support:
python3.10 -m daphne -b 0.0.0.0 -p 8000 chatapp.asgi:application
```

### Frontend:
```bash
cd Frontend
npm install
npm run dev
```

## 📁 Key Files

### Backend:
- `users/models.py` - Database models
- `users/views.py` - API endpoints
- `users/file_views.py` - File upload/download
- `users/consumers.py` - WebSocket handlers
- `users/urls.py` - URL routing
- `chatapp/settings.py` - Django settings

### Frontend:
- `app/chatpage/page.js` - Main chat page
- `app/componant/nav.js` - Sidebar component
- `app/page.js` - Login page
- `app/signup/page.js` - Signup page
- `endpoints.js` - API endpoints configuration

## 🔑 API Endpoints

### Authentication:
- `POST /api/v1/register/` - Register user
- `POST /api/v1/login/` - Login
- `POST /api/v1/logout/` - Logout

### Chat:
- `GET /api/v1/get_user/?name=...` - Search users
- `GET /api/v1/get_room_Id/?member_1=...&member_2=...` - Get/create room
- `GET /api/v1/chats/{roomId}/messages` - Get messages
- `GET /api/v1/users/{userId}/chats` - Get user chats

### Files:
- `POST /api/v1/upload-file/` - Upload file
- `GET /api/v1/download-file/{message_id}/` - Download file

### WebSocket:
- `ws://localhost:8000/api/v1/ws/chat/{member_1}/{member_2}/`

## 🐛 Common Issues & Fixes

### Issue: Files not uploading
**Fix**: Check authentication token, verify media directory exists

### Issue: WebSocket not connecting
**Fix**: Check if daphne is running (not runserver), verify WebSocket URL

### Issue: Duplicate chats
**Fix**: Already fixed in latest version

### Issue: Images not showing
**Fix**: Check file_url in message response, verify media serving

## 🔒 Security Checklist

Before deployment:
- [ ] Change SECRET_KEY
- [ ] Set DEBUG = False
- [ ] Configure ALLOWED_HOSTS
- [ ] Set CORS origins
- [ ] Add rate limiting
- [ ] Configure HTTPS
- [ ] Add input validation
- [ ] Set up file type whitelist

## 📊 Database Migrations

```bash
# Create migrations
python3.10 manage.py makemigrations

# Apply migrations
python3.10 manage.py migrate

# Create superuser
python3.10 manage.py createsuperuser
```

## 🎯 Feature Status

✅ Working:
- File upload/download
- Image preview
- Typing indicators
- WebSocket reconnection
- Read receipts
- Duplicate chat fix

🔄 In Progress:
- Message search
- Message pagination
- Online/offline status

📋 Planned:
- Group chats
- Voice messages
- Dark mode
- Notifications

## 💡 Quick Tips

1. **File Size Limit**: Currently 10MB, change in `file_views.py`
2. **Message Length**: 500 chars max, change in `models.py`
3. **Reconnection**: Auto-reconnects up to 5 times
4. **Typing Timeout**: 3 seconds after last keystroke
5. **Media Files**: Stored in `backend/media/chat_files/`

## 📞 Need Help?

Check these files:
- `PRODUCTION_ANALYSIS.md` - Detailed analysis
- `DEPLOYMENT_GUIDE.md` - Deployment steps
- `SUMMARY.md` - Complete summary

