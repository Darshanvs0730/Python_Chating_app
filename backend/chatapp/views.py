from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
import json

@require_http_methods(["GET"])
def api_root(request):
    """
    Root API endpoint that provides information about available endpoints
    Returns JSON for API clients, HTML for browsers
    """
    api_info = {
        "name": "ChatFlow API",
        "version": "1.0",
        "status": "running",
        "message": "Welcome to ChatFlow API",
        "endpoints": {
            "authentication": {
                "register": "/api/v1/register/",
                "login": "/api/v1/login/",
                "logout": "/api/v1/logout/"
            },
            "users": {
                "search": "/api/v1/get_user/",
                "chats": "/api/v1/users/{userId}/chats"
            },
            "messages": {
                "get_messages": "/api/v1/chats/{roomId}/messages",
                "get_room": "/api/v1/get_room_Id/"
            },
            "files": {
                "upload": "/api/v1/upload-file/",
                "download": "/api/v1/download-file/{message_id}/"
            },
            "admin": "/admin/"
        },
        "documentation": "API endpoints require JWT authentication (except register/login)",
        "websocket": "WebSocket connection available for real-time messaging"
    }
    
    # Check if client wants JSON (API client) or HTML (browser)
    accept_header = request.META.get('HTTP_ACCEPT', '')
    if 'application/json' in accept_header or request.GET.get('format') == 'json':
        return JsonResponse(api_info, json_dumps_params={'indent': 2})
    
    # Return HTML for browsers
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ChatFlow API</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }}
            .container {{
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 800px;
                width: 100%;
                padding: 40px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 40px;
            }}
            .logo {{
                font-size: 48px;
                font-weight: bold;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 10px;
            }}
            .status {{
                display: inline-block;
                padding: 8px 16px;
                background: #10b981;
                color: white;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-top: 10px;
            }}
            .section {{
                margin-bottom: 30px;
            }}
            .section-title {{
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e5e7eb;
            }}
            .endpoint-group {{
                margin-bottom: 20px;
            }}
            .endpoint-group h3 {{
                font-size: 16px;
                color: #6366f1;
                margin-bottom: 10px;
            }}
            .endpoint {{
                background: #f9fafb;
                padding: 12px 16px;
                margin-bottom: 8px;
                border-radius: 8px;
                border-left: 4px solid #6366f1;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #374151;
            }}
            .info {{
                background: #eff6ff;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #3b82f6;
                margin-top: 30px;
            }}
            .info p {{
                color: #1e40af;
                line-height: 1.6;
            }}
            .frontend-link {{
                text-align: center;
                margin-top: 30px;
                padding-top: 30px;
                border-top: 2px solid #e5e7eb;
            }}
            .frontend-link a {{
                display: inline-block;
                padding: 12px 24px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 600;
                transition: transform 0.2s;
            }}
            .frontend-link a:hover {{
                transform: scale(1.05);
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">💬 ChatFlow</div>
                <div class="status">✓ API Running</div>
            </div>
            
            <div class="section">
                <div class="section-title">API Information</div>
                <p style="color: #6b7280; margin-bottom: 20px;">
                    Version {api_info['version']} • {api_info['message']}
                </p>
            </div>
            
            <div class="section">
                <div class="section-title">Available Endpoints</div>
                
                <div class="endpoint-group">
                    <h3>🔐 Authentication</h3>
                    <div class="endpoint">POST {api_info['endpoints']['authentication']['register']}</div>
                    <div class="endpoint">POST {api_info['endpoints']['authentication']['login']}</div>
                    <div class="endpoint">POST {api_info['endpoints']['authentication']['logout']}</div>
                </div>
                
                <div class="endpoint-group">
                    <h3>👥 Users</h3>
                    <div class="endpoint">GET {api_info['endpoints']['users']['search']}</div>
                    <div class="endpoint">GET {api_info['endpoints']['users']['chats']}</div>
                </div>
                
                <div class="endpoint-group">
                    <h3>💬 Messages</h3>
                    <div class="endpoint">GET {api_info['endpoints']['messages']['get_messages']}</div>
                    <div class="endpoint">GET {api_info['endpoints']['messages']['get_room']}</div>
                </div>
                
                <div class="endpoint-group">
                    <h3>📎 Files</h3>
                    <div class="endpoint">POST {api_info['endpoints']['files']['upload']}</div>
                    <div class="endpoint">GET {api_info['endpoints']['files']['download']}</div>
                </div>
                
                <div class="endpoint-group">
                    <h3>⚙️ Admin</h3>
                    <div class="endpoint">GET {api_info['endpoints']['admin']}</div>
                </div>
            </div>
            
            <div class="info">
                <p><strong>📝 Note:</strong> {api_info['documentation']}</p>
                <p style="margin-top: 10px;"><strong>🔌 WebSocket:</strong> {api_info['websocket']}</p>
            </div>
            
            <div class="frontend-link">
                <a href="http://localhost:3000" target="_blank">🚀 Open ChatFlow App</a>
            </div>
        </div>
    </body>
    </html>
    """
    
    return HttpResponse(html_content)

