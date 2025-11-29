from rest_framework import serializers
from .models import User, ChatRoom, ChatMessage


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'gender',
            'mobile_no', 'first_name', 'last_name'
        )

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)

        return user


class GetUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')


class ChatMessageSerializer(serializers.ModelSerializer):
    userName = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    sender_name = serializers.SerializerMethodField()
    sender_id = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        exclude = ['id']

    def get_userName(self, obj):
        if obj.receiver:
            return obj.receiver.first_name + ' ' + obj.receiver.last_name
        return 'Unknown'
    
    def get_sender_id(self, obj):
        if obj.sender:
            return obj.sender.id
        return None
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                # Build absolute URI for file
                file_url = obj.file.url
                # Ensure it starts with /media/
                if not file_url.startswith('/'):
                    file_url = '/' + file_url
                return request.build_absolute_uri(file_url)
            # Fallback to relative URL
            file_url = obj.file.url
            if not file_url.startswith('/'):
                file_url = '/' + file_url
            return file_url
        return None
    
    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.first_name + ' ' + obj.sender.last_name
        return 'Unknown'


class ChatRoomList(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = (
            'type', 'timestamp',
            'first_name', 'last_name', 'id'
        )

    def get_first_name(self, obj):
        user_id = self.context.get('user_id')
        if obj.member_1_id == user_id:
            return UserSerializer(obj.member_2).data['first_name']
        else:
            return UserSerializer(obj.member_1).data['first_name']

    def get_last_name(self, obj):
        user_id = self.context.get('user_id')
        if obj.member_1_id == user_id:
            return UserSerializer(obj.member_2).data['last_name']
        else:
            return UserSerializer(obj.member_1).data['last_name']

    def get_id(self, obj):
        user_id = self.context.get('user_id')
        if obj.member_1_id == user_id:
            return UserSerializer(obj.member_2).data['id']
        else:
            return UserSerializer(obj.member_1).data['id']
