# Troubleshooting Guide

## Fixed Issues

### 1. Lockfile Warning
**Problem**: Next.js detects multiple lockfiles and warns about workspace root.

**Solution**: 
- Updated `next.config.ts` to explicitly set `turbopack.root` to `process.cwd()`
- There's a `package-lock.json` at `C:\Users\Grace\package-lock.json` that may be causing confusion
- If not needed, you can remove it: `Remove-Item "C:\Users\Grace\package-lock.json"`

### 2. Dev Server Lock File
**Problem**: `.next\dev\lock` file preventing dev server from starting.

**Solution**: Lock file has been removed. If it happens again:
```powershell
Remove-Item ".next\dev\lock" -Force
```

### 3. Database Registration Issue

**Current Setup**: The app uses **Prisma with SQLite** (not Supabase directly). 

**To use Supabase instead of SQLite:**

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Update `.env` with your Supabase connection string:
```
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

3. Run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

**If registration isn't working:**

1. Check server logs - enhanced error logging has been added
2. Verify database connection:
   - Check `.env` has correct `DATABASE_URL`
   - Ensure database is accessible
   - Run `npx prisma db push` to sync schema

3. Test database connection:
```bash
npx prisma studio
```

This will open a GUI to view your database and verify if users are being created.

## Next Steps

1. Try registering a user and check the server console for detailed logs
2. If using Supabase, follow the migration steps above
3. If still having issues, check the browser console and server logs for specific error messages

