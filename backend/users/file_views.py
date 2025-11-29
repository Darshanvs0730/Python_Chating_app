from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import ChatRoom, ChatMessage, User
from django.db.models import Q
from django.http import FileResponse, Http404
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import os


class FileUploadView(APIView):
    permission_classes = [AllowAny]  # We'll handle auth manually
    
    def post(self, request):
        try:
            # Manual JWT authentication
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1]
            jwt_auth = JWTAuthentication()
            try:
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
            except Exception:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            file = request.FILES.get('file')
            receiver_id = request.data.get('receiver')
            message_text = request.data.get('message', '')
            room_id = request.data.get('room_id')
            
            if not file:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not receiver_id:
                return Response({'error': 'Receiver ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size (10MB limit)
            if file.size > 10 * 1024 * 1024:
                return Response({'error': 'File size exceeds 10MB limit'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                receiver = User.objects.get(id=receiver_id)
            except User.DoesNotExist:
                return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get or create room
            if room_id:
                try:
                    room = ChatRoom.objects.get(id=room_id)
                    # Verify user is part of this room
                    if room.member_1 != user and room.member_2 != user:
                        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
                except ChatRoom.DoesNotExist:
                    return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Find existing room or create new one
                room = ChatRoom.objects.filter(
                    Q(member_1=user, member_2=receiver) |
                    Q(member_1=receiver, member_2=user)
                ).first()
                
                if not room:
                    room = ChatRoom.objects.create(
                        member_1=user,
                        member_2=receiver
                    )
            
            # Determine message type
            if file.content_type and file.content_type.startswith('image/'):
                message_type = ChatMessage.MESSAGE_TYPE_IMAGE
            else:
                message_type = ChatMessage.MESSAGE_TYPE_FILE
            
            # Create message with file
            chat_message = ChatMessage.objects.create(
                room_ID=room,
                sender=user,
                receiver=receiver,
                message=message_text or f"Sent {file.name}",
                message_type=message_type,
                file=file,
                file_name=file.name,
                file_size=file.size,
                file_type=file.content_type or 'application/octet-stream'
            )
            
            return Response({
                'message': 'File uploaded successfully',
                'data': {
                    'id': chat_message.id,
                    'message': chat_message.message,
                    'file_name': chat_message.file_name,
                    'file_size': chat_message.file_size,
                    'file_type': chat_message.file_type,
                    'file_url': chat_message.file.url if chat_message.file else None,
                    'message_type': chat_message.message_type,
                    'timestamp': chat_message.timestamp.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileDownloadView(APIView):
    permission_classes = [AllowAny]  # We'll handle auth manually
    
    def get(self, request, message_id):
        try:
            # Manual JWT authentication
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1]
            jwt_auth = JWTAuthentication()
            try:
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
            except Exception:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            message = ChatMessage.objects.get(id=message_id)
            
            # Check if user has permission to access this file
            if message.sender != user and message.receiver != user:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            if not message.file:
                return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Mark as read if receiver is viewing
            if message.receiver == user:
                message.is_read = True
                message.save()
            
            # Return file
            if os.path.exists(message.file.path):
                return FileResponse(
                    open(message.file.path, 'rb'),
                    as_attachment=True,
                    filename=message.file_name or os.path.basename(message.file.path)
                )
            else:
                return Response({'error': 'File not found on server'}, status=status.HTTP_404_NOT_FOUND)
                
        except ChatMessage.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

