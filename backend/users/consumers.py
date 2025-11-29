# import json
# from channels.db import database_sync_to_async
# from channels.generic.websocket import AsyncWebsocketConsumer
# from .models import User, ChatMessage, ChatRoom
# from django.db.models import Q
# import uuid


# class ChatConsumer(AsyncWebsocketConsumer):

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.room_name = None

#     def getUser(self, userId):
#         return User.objects.get(id=userId)

#     def saveMessage(self, message, sender_id, receiver_id, roomId):

#         userObj_1 = User.objects.get(id=sender_id)
#         userObj_2 = User.objects.get(id=receiver_id)
#         chatObj = ChatRoom.objects.get(roomId=roomId)
#         chatMessageObj = ChatMessage.objects.create(
#             sender=userObj_1, receiver=userObj_2, message=message,
#             room_ID=chatObj
#         )

#         sender_data = {
#             'id': userObj_1.id,
#             'first_name': userObj_1.first_name,
#             'last_name': userObj_1.last_name
#         }

#         return {
#             'action': 'message',
#             'sender': sender_data,
#             'receiver': userObj_2.id,
#             'roomId': roomId,
#             'message': message,
#             'userName': userObj_2.first_name + " " + userObj_2.last_name,
#             'timestamp': str(chatMessageObj.timestamp)
#         }

#     async def connect(self):

#         self.member_1 = self.scope['url_route']['kwargs']['member_id_1']
#         self.member_2 = self.scope['url_route']['kwargs']['member_id_2']
#         room = await database_sync_to_async(
#             list
#             )(
#                 ChatRoom.objects
#                 .filter(
#                     Q(member_1=self.member_1, member_2=self.member_2) |
#                     Q(member_1=self.member_2, member_2=self.member_1)
#                 )
#             )
#         if room:
#             self.room_name = room[0].roomId
#         else:
#             self.room_name = str(uuid.uuid4())

#         await self.channel_layer.group_add(
#             self.room_name, self.channel_name
#         )

#         await self.accept()

#     async def disconnect(self, close_code):

#         response = "User Disconnected"
#         print(response, 'response')

#         await self.send(response)

#     async def receive(self, text_data):
#         print(text_data, 'text_data')
#         text_data_json = json.loads(text_data)
#         action = text_data_json['action']
#         chat_message = {}

#         if action == 'message':
#             message = text_data_json['message']
#             receiver_id = text_data_json['receiver']

#             member_1 = await database_sync_to_async(
#                 User.objects.get)(id=self.member_1)
#             member_2 = await database_sync_to_async(
#                 User.objects.get)(id=self.member_2)
#             print(member_2, "AKLSJASKJCASKJCN")
#             print(receiver_id, "dbvjhdbvdvh")
#             if receiver_id == member_1.id:
#                 print(receiver_id, "dbvjhdbvdvh")
#                 sender_id = member_2.id
#             elif receiver_id == member_2.id:
#                 print(receiver_id, "ekjcbdchjbdcbdhcb")
#                 sender_id = member_1.id
#             else:
#                 print("dsxbsvbdcbvdsvbd")
#                 return self.disconnect()

#             chat_message = await database_sync_to_async(self.saveMessage)(
#                 message, sender_id, receiver_id, self.room_name
#             )
#         elif action == 'typing':
#             chat_message = text_data_json

#         await self.channel_layer.group_send(
#             self.room_name,
#             {
#                 'type': 'chat_message',
#                 'message': chat_message
#             }
#         )

#     async def chat_message(self, event):
#         message = event['message']
#         await self.send(text_data=json.dumps(message))


import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import User, ChatMessage, ChatRoom
import uuid
from django.db.models import Q


class ChatConsumer(AsyncWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None

    def getUser(self, userId):
        return User.objects.get(id=userId)

    def saveMessage(self, message, sender_id, receiver_id, roomId):

        userObj_1 = User.objects.get(id=sender_id)
        print(sender_id, 'sender_id')
        userObj_2 = User.objects.get(id=receiver_id)
        print(roomId, 'line 140')
        roomIdObj = ChatRoom.objects.get(roomId=roomId)
        print(roomIdObj, 'ASDFG')
        chatMessageObj = ChatMessage.objects.create(
            sender=userObj_1, receiver=userObj_2, message=message,
            room_ID=roomIdObj  # No specific room for direct messages
        )

        sender_data = {
            'id': userObj_1.id,
            'first_name': userObj_1.first_name,
            'last_name': userObj_1.last_name
        }
        print('roomId', roomId)
        return {
            'action': 'message',
            'sender': sender_data,
            'sender_id': sender_id,  # Include sender_id for frontend to identify message owner
            'receiver': receiver_id,
            'receiver_id': receiver_id,
            'roomId': roomId,
            'message': message,
            'userName': userObj_2.first_name + " " + userObj_2.last_name,
            'sender_name': userObj_1.first_name + " " + userObj_1.last_name,  # Include sender name
            'timestamp': str(chatMessageObj.timestamp)
        }

    async def connect(self):

        self.member_1 = self.scope['url_route']['kwargs']['member_id_1']
        self.member_2 = self.scope['url_route']['kwargs']['member_id_2']
        room = await database_sync_to_async(
            list
            )(
                ChatRoom.objects
                .filter(
                    Q(member_1=self.member_1, member_2=self.member_2) |
                    Q(member_1=self.member_2, member_2=self.member_1)
                )
            )
        if room:
            self.room_name = room[0].roomId
        else:
            self.room_name = str(uuid.uuid4())

        await self.channel_layer.group_add(
            self.room_name, self.channel_name
        )  # Generate a unique room name for the conversation

        await self.channel_layer.group_add(
            self.room_name, self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):

        response = "User Disconnected"
        print(response, 'response')

        await self.send(response)

    async def receive(self, text_data):
        print(text_data, 'text_data')
        text_data_json = json.loads(text_data)
        action = text_data_json['action']
        chat_message = {}

        if action == 'message':
            message = text_data_json['message']
            receiver_id = text_data_json['receiver']

            # Determine sender based on receiver
            # If receiver is member_2, sender is member_1, and vice versa
            if str(receiver_id) == str(self.member_2):
                sender_id = self.member_1
            else:
                sender_id = self.member_2

            chat_message = await database_sync_to_async(self.saveMessage)(
                message, sender_id, receiver_id, self.room_name
            )

        elif action == 'typing':
            # Include sender information in typing message
            sender_id = text_data_json.get('sender_id')
            if not sender_id:
                # Determine sender from WebSocket connection
                if str(text_data_json.get('receiver')) == str(self.member_2):
                    sender_id = self.member_1
                else:
                    sender_id = self.member_2
            
            # Get sender user object
            sender_user = await database_sync_to_async(User.objects.get)(id=sender_id)
            
            chat_message = {
                'action': 'typing',
                'sender_id': sender_id,
                'sender': {
                    'id': sender_user.id,
                    'first_name': sender_user.first_name,
                    'last_name': sender_user.last_name
                },
                'receiver': text_data_json.get('receiver')
            }
        elif action == 'typing_stopped':
            # Handle typing stopped
            sender_id = text_data_json.get('sender_id')
            if not sender_id:
                if str(text_data_json.get('receiver')) == str(self.member_2):
                    sender_id = self.member_1
                else:
                    sender_id = self.member_2
            
            sender_user = await database_sync_to_async(User.objects.get)(id=sender_id)
            
            chat_message = {
                'action': 'typing_stopped',
                'sender_id': sender_id,
                'sender': {
                    'id': sender_user.id,
                    'first_name': sender_user.first_name,
                    'last_name': sender_user.last_name
                },
                'receiver': text_data_json.get('receiver')
            }

        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'chat_message',
                'message': chat_message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
