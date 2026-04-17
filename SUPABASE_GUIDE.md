# TranscendPartner Supabase Configuration Guide

I have recorded the project credentials and setup commands you provided. Below is the summary of your project integration.

## 🔗 Project Credentials
- **Project URL:** `https://kuijamybarbiwywjbnxf.supabase.co`
- **Anon Key:** `sb_publishable_tCofZq_Qo8S4sR5rqpYcBw_ll46EfNO`
- **DB Connection:** `postgresql://postgres:[YOUR-PASSWORD]@db.kuijamybarbiwywjbnxf.supabase.co:5432/postgres`

## 🛠️ Setup Commands
Run these in your local terminal if you want to link your local environment:
1. `supabase login`
2. `supabase init`
3. `supabase link --project-ref kuijamybarbiwywjbnxf`

---

## ❓ Common Issues & Solutions

### 1. "Why can I register multiple times?"
By default, Supabase allows users to sign up without immediate email confirmation if configured that way in the dashboard.
**Solution:** 
- Go to [Supabase Dashboard](https://app.supabase.com)
- -> **Authentication**
- -> **Providers** -> **Email**
- -> Enable **"Confirm email"**.
- This will prevent users from logging in until they verify their email.

### 2. "Why does email verification do nothing?"
If you enable "Confirm email", Supabase sends a link. 
- Ensure your **Site URL** is set correctly in **Authentication** -> **URL Configuration**. 
- It should point to your Vercel URL (e.g., `https://your-app.vercel.app`).

### 3. "Database not syncing / Squares empty"
The "Hard Link" requires your **Database Password**.
**Solution:**
- Replace `[YOUR-PASSWORD]` in your Vercel Environment Variables (`DATABASE_URL`) with your actual password.
- Without the correct password, the Node.js backend cannot connect to fetch or save posts.

---

*I have integrated these values into the code defaults. The app is ready for deployment.*
