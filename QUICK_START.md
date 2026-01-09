# ⚡ Quick Start Guide (5 Minutes)

## 1️⃣ Set Environment Variable (1 minute)

Create or edit `.env.local` in project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 2️⃣ Start Development Server (1 minute)

```bash
npm run dev
```

Server running at: http://localhost:3000

## 3️⃣ Access Admin Pages (1 minute)

Navigate to:
- **Roles:** http://localhost:3000/admin/roles
- **Users:** http://localhost:3000/admin/users
- **Permissions:** http://localhost:3000/admin/permissions

## 4️⃣ Create First Role (1 minute)

1. Go to `/admin/roles`
2. Click "Create Role"
3. Enter name: "Editor"
4. Click "Create Role"

## 5️⃣ Assign Permissions (1 minute)

1. Click "Permissions" next to role
2. Check boxes for permissions
3. Click "Save Permissions"

## ✅ Done!

You now have a working role management system.

---

## Common Tasks

### Create User
```
Go to /admin/users → Click "Create User" → Fill form → Submit
```

### Change Password
```
Go to /admin/users → Click "Password" on user → Change password
```

### View Permissions
```
Go to /admin/permissions → See all modules and roles
```

---

## API Integration

All 24 backend API endpoints are already integrated. Just make sure:

1. ✅ Backend API is running on `NEXT_PUBLIC_API_URL`
2. ✅ Database tables are created
3. ✅ Endpoints match backend implementation

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API not connecting | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| Page not loading | Check browser console for errors |
| Form not submitting | Verify API is running and database exists |
| Permission error | Check role has permissions assigned |

---

## Next Steps

1. **Read:** PERMISSION_SYSTEM.md (understand architecture)
2. **Review:** QUICK_REFERENCE.md (API functions)
3. **Integrate:** Add permission checks to your pages
4. **Deploy:** Follow DEPLOYMENT_GUIDE.md

---

## Documentation

- **Full Guide:** COMPLETE_SUMMARY.md
- **Setup Help:** FRONTEND_SETUP.md
- **API Reference:** PERMISSION_SYSTEM.md
- **Quick Tips:** QUICK_REFERENCE.md
- **Production:** DEPLOYMENT_GUIDE.md

---

**Status:** ✅ Ready to use!

**Time to get started:** 5 minutes
**Time to integrate:** 1-2 hours
**Time to production:** Depends on testing

Enjoy! 🚀
