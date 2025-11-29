from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from .serializers import (
    UserSerializer, GetUserSerializer,
    ChatMessageSerializer, ChatRoomList
)
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, ChatRoom, ChatMessage
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import status
from django.db.models import Q
from django.contrib.auth import logout
from rest_framework.permissions import IsAuthenticated

# Create your views here.


class RegisterAPI(APIView):

    def post(self, request):

        # Extract data from the request
        data = request.data

        data['username'] = data['email']
        # Initialize a UserSerializer with the request data
        serializer = UserSerializer(data=data)

# Validate the request data and save the new user if validation is successful
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return a success message in the response
        return Response({"message": "User register successfully."}, status=200)


class LoginAPI(APIView):
    def post(self, request):
        data = request.data
        username = data.get('username', '')
        password = data.get('password', '')

        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            return Response(
                {'error': "Invalid username"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        check_pwd = check_password(password, user.password)

        if check_pwd:
            refresh = RefreshToken.for_user(user)
            data = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response(
                {"message": "Login successfully.", "data": data},
                status=200
            )

        else:
            return Response(
                {'message': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args):
        logout(request)
        response = Response(status=200)
        response.success_message = "Logout successfully."
        return response


class SearchUserView(APIView):
    def get(self, request):
        name = request.query_params.get('name')
        # user_id = request.query_params.get('id')
        queryset = User.objects.all()

        if name:
            queryset = queryset.filter(Q(
                first_name__icontains=name) | Q(last_name__icontains=name))

        # elif user_id:
        #     queryset = queryset.filter(id=user_id)

        else:
            return Response([])

        serializer = GetUserSerializer(queryset, many=True)
        return Response(serializer.data)


class ChatRoomView(APIView):
    def get(self, request, userId):
        print(userId)
        room = ChatRoom.objects.filter(
            member_1=userId) | ChatRoom.objects.filter(member_2=userId)

        serializer = ChatRoomList(room, many=True, context={'user_id': userId})
        return Response(serializer.data)


class MessagesView(ListAPIView):
    serializer_class = ChatMessageSerializer
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        roomId = self.kwargs['roomId']
        return ChatMessage.objects.filter(
            room_ID=roomId).order_by('timestamp')  # Ascending order - oldest first, newest last
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class GetRoom(APIView):
    def get(self, request):
        member_1 = User.objects.get(id=request.query_params.get('member_1'))
        member_2 = User.objects.get(id=request.query_params.get('member_2'))

        chat_room = ChatRoom.objects.filter(
            Q(member_1=member_1, member_2=member_2) |
            Q(member_1=member_2, member_2=member_1)
        )

        if not chat_room.exists():
            chat_room = ChatRoom.objects.create(
                member_1=member_1, member_2=member_2
            )
        else:
            chat_room = chat_room.first()

        return Response({'roomId': chat_room.roomId, "id": chat_room.id})
