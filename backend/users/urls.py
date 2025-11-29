from django.urls import path
from .views import (
    RegisterAPI, LoginAPI, SearchUserView,
    ChatRoomView, MessagesView, GetRoom, LogoutAPI
)
from .file_views import FileUploadView, FileDownloadView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path("register/", RegisterAPI.as_view(), name="register"),
    path("login/", LoginAPI.as_view(), name='Login'),
    path("logout/", LogoutAPI.as_view(), name="logout"),
    path('get_user/', SearchUserView.as_view(), name='getuser'),
    path(
        'chats/<str:roomId>/messages',
        MessagesView.as_view(),
        name='messageList'
    ),
    path(
        'users/<int:userId>/chats',
        ChatRoomView.as_view(),
        name='chatRoomList'
    ),
    path('get_room_Id/', GetRoom.as_view(), name='get_roomID'),
    path('upload-file/', FileUploadView.as_view(), name='upload_file'),
    path('download-file/<int:message_id>/', FileDownloadView.as_view(), name='download_file'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
