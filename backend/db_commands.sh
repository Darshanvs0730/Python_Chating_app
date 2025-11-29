#!/bin/bash
# Database Management Commands for ChatFlow
# Usage: ./db_commands.sh [command]

case "$1" in
    "migrate")
        echo "Running migrations..."
        python3.10 manage.py migrate
        ;;
    "makemigrations")
        echo "Creating migrations..."
        python3.10 manage.py makemigrations
        ;;
    "superuser")
        echo "Creating superuser..."
        python3.10 manage.py createsuperuser
        ;;
    "shell")
        echo "Opening Django shell..."
        python3.10 manage.py shell
        ;;
    "backup")
        echo "Backing up database..."
        cp db.sqlite3 "db_backup_$(date +%Y%m%d_%H%M%S).sqlite3"
        echo "Backup created!"
        ;;
    "reset")
        echo "⚠️  WARNING: This will delete all data!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            rm db.sqlite3
            python3.10 manage.py migrate
            echo "Database reset. Run 'superuser' to create admin account."
        else
            echo "Cancelled."
        fi
        ;;
    "admin")
        echo "Starting server for admin access..."
        echo "Admin panel: http://localhost:8000/admin/"
        python3.10 manage.py runserver
        ;;
    *)
        echo "ChatFlow Database Commands"
        echo "Usage: ./db_commands.sh [command]"
        echo ""
        echo "Commands:"
        echo "  migrate       - Run database migrations"
        echo "  makemigrations - Create new migrations"
        echo "  superuser     - Create admin superuser"
        echo "  shell         - Open Django Python shell"
        echo "  backup        - Backup SQLite database"
        echo "  reset         - Reset database (⚠️ deletes all data)"
        echo "  admin         - Start server and open admin panel"
        ;;
esac

