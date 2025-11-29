from django.contrib import admin
from django.contrib import messages
from django.db.models import Q
from django.db import transaction, connection
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import User, ChatMessage, ChatRoom

# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'gender')
    search_fields = ('email', 'first_name', 'last_name')
    readonly_fields = ('date_joined', 'last_login')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related()
    
    def delete_view(self, request, object_id, extra_context=None):
        """Override delete view to handle foreign key constraints"""
        obj = self.get_object(request, object_id)
        if obj is None:
            return super().delete_view(request, object_id, extra_context)
        
        if request.method == 'POST':
            try:
                # Enable foreign keys for SQLite
                if 'sqlite' in connection.vendor:
                    with connection.cursor() as cursor:
                        cursor.execute("PRAGMA foreign_keys = ON")
                
                with transaction.atomic():
                    # Get all chat rooms where user is a member
                    chat_rooms = ChatRoom.objects.filter(Q(member_1=obj) | Q(member_2=obj))
                    room_count = chat_rooms.count()
                    
                    # Delete all messages in those rooms first
                    room_ids = list(chat_rooms.values_list('id', flat=True))
                    if room_ids:
                        messages_count = ChatMessage.objects.filter(room_ID_id__in=room_ids).delete()[0]
                    else:
                        messages_count = 0
                    
                    # Delete the chat rooms
                    chat_rooms.delete()
                    
                    # Delete the user
                    obj.delete()
                    
                    messages.success(request, f'User deleted successfully. {room_count} chat room(s) and {messages_count} message(s) were also deleted.')
                    
                    # Redirect to user list
                    return HttpResponseRedirect(reverse('admin:users_user_changelist'))
            except Exception as e:
                messages.error(request, f'Error deleting user: {str(e)}')
                # Fall through to show error
        
        # Show confirmation page
        return super().delete_view(request, object_id, extra_context)
    
    def delete_model(self, request, obj):
        """Handle user deletion with related objects"""
        try:
            # Enable foreign keys for SQLite
            if 'sqlite' in connection.vendor:
                with connection.cursor() as cursor:
                    cursor.execute("PRAGMA foreign_keys = ON")
            
            with transaction.atomic():
                # Get all chat rooms where user is a member
                chat_rooms = ChatRoom.objects.filter(Q(member_1=obj) | Q(member_2=obj))
                room_count = chat_rooms.count()
                
                # Delete all messages in those rooms first
                room_ids = list(chat_rooms.values_list('id', flat=True))
                if room_ids:
                    messages_count = ChatMessage.objects.filter(room_ID_id__in=room_ids).delete()[0]
                else:
                    messages_count = 0
                
                # Delete the chat rooms
                chat_rooms.delete()
                
                # Delete the user
                obj.delete()
                
                messages.success(request, f'User deleted successfully. {room_count} chat room(s) and {messages_count} message(s) were also deleted.')
        except Exception as e:
            messages.error(request, f'Error deleting user: {str(e)}')
            raise
    
    def delete_queryset(self, request, queryset):
        """Handle bulk deletion"""
        deleted_count = 0
        for obj in queryset:
            try:
                self.delete_model(request, obj)
                deleted_count += 1
            except:
                pass
        messages.success(request, f'{deleted_count} user(s) deleted successfully.')


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('roomId', 'member_1', 'member_2', 'type', 'timestamp')
    list_filter = ('type', 'timestamp')
    search_fields = ('roomId', 'member_1__email', 'member_2__email')
    readonly_fields = ('roomId', 'timestamp')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'message_type', 'timestamp', 'is_read')
    list_filter = ('message_type', 'is_read', 'timestamp')
    search_fields = ('message', 'sender__email', 'receiver__email')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
