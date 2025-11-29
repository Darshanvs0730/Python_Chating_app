# Your Admin Credentials

Based on what you entered, here are your admin credentials:

## ✅ Login Information

**URL:** `http://localhost:8000/admin/`

**Username:** `admin`

**Email:** `admin@gmail.com`

**Password:** `Darshanvs@123`

---

## 🎯 Try Logging In Now

1. Make sure your server is running:
   ```bash
   cd /Users/darshan/Desktop/Python_Chating_app/backend
   export SECRET_KEY='django-insecure-dev-key-change-in-production-12345'
   export ENVIRNOMENT=1
   python3.10 manage.py runserver
   ```

2. Open browser: `http://localhost:8000/admin/`

3. Enter:
   - **Username or Email:** `admin` (or `admin@gmail.com`)
   - **Password:** `Darshanvs@123`

4. Click "Log in"

---

## 🆘 If Login Doesn't Work

The admin user might not have been created successfully. Try this:

**Option 1: Create Admin User Again (Interactive)**
```bash
cd /Users/darshan/Desktop/Python_Chating_app/backend
export SECRET_KEY='django-insecure-dev-key-change-in-production-12345'
export ENVIRNOMENT=1
python3.10 create_admin_interactive.py
```

Then enter:
- Username: `admin`
- Email: `admin@gmail.com`
- Password: `Darshanvs@123`
- Password (again): `Darshanvs@123`

**Option 2: Use Django Command**
```bash
cd /Users/darshan/Desktop/Python_Chating_app/backend
export SECRET_KEY='django-insecure-dev-key-change-in-production-12345'
export ENVIRNOMENT=1
python3.10 manage.py createsuperuser
```

---

## ✅ After Successful Login

You'll see the Django admin dashboard where you can:
- View all Users
- View Chat Rooms
- View Chat Messages
- Manage your database

---

**Note:** If you see "Please enter a correct username and password", the admin user wasn't created. Use one of the options above to create it.

