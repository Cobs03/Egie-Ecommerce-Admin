# 📖 Admin User Manual: Login & Authentication Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Admin Access Overview](#admin-access-overview)
3. [Signing Into Admin Panel](#signing-into-admin-panel)
4. [Password Recovery](#password-recovery)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)
7. [FAQs](#faqs)

---

## Introduction

Welcome to the Egie-Ecommerce Admin Panel Authentication Guide! This manual provides comprehensive instructions for administrators, managers, and employees to access and secure the admin dashboard.

### Who Can Access the Admin Panel?

The admin panel is restricted to authorized personnel only:
- 🔑 **Admin** - Full system access
- 👔 **Manager** - Management-level access
- 👤 **Employee** - Staff-level access
- ❌ **Customers** - Cannot access admin panel

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Stable internet connection
- Valid admin credentials
- Desktop/laptop computer (recommended)
- Screen resolution: 1280x720 or higher

---

## Admin Access Overview

### Access Levels

#### **Administrator (Admin)**
- ✅ Full system access
- ✅ User management
- ✅ Website settings
- ✅ Product management
- ✅ Order processing
- ✅ Financial reports
- ✅ Security settings
- ✅ All features unlocked

#### **Manager**
- ✅ User management (limited)
- ✅ Product management
- ✅ Order processing
- ✅ Inventory management
- ✅ Customer service tools
- ✅ Reports and analytics
- ⚠️ Limited system settings access

#### **Employee**
- ✅ Order processing
- ✅ Customer service
- ✅ Basic product updates
- ✅ Inventory checks
- ❌ No user management
- ❌ No financial access
- ❌ No system settings

### URL Access

**Admin Panel URL:**
```
https://yourdomain.com/admin
or
https://admin.yourdomain.com
```

**Local Development:**
```
http://localhost:5173/admin (or your port)
```

---

## Signing Into Admin Panel

### Step-by-Step Login Process

#### Step 1: Access the Admin Login Page

**Navigate to Admin Panel:**
1. Open your web browser
2. Type the admin panel URL in the address bar
3. Press Enter to load the login page

**Login Page Layout:**
- **Left Side**: Login form (black background)
  - Company logo
  - Welcome message
  - Email and password fields
  - Login button
- **Right Side**: Background image (desktop only)
  - Computer chip/technology themed image

#### Step 2: Enter Your Credentials

**Email Address:**
1. Click on the **"Email"** field
2. Type your admin email address
   - Format: `admin@egie.com` or your assigned email
   - Must be a registered admin account
   - Case-insensitive
3. Ensure no spaces before/after email

**Example Email Formats:**
- `admin@company.com`
- `manager@company.com`
- `employee.name@company.com`

**Password:**
1. Click on the **"Password"** field
2. Type your password carefully
   - Passwords are case-sensitive
   - Minimum 6 characters
   - Special characters allowed
3. Use the **eye icon** (👁️) to show/hide password
   - Click once to reveal password
   - Click again to hide password
   - Helps verify you're typing correctly

**Password Security Tips:**
- ⚠️ Never share your password
- 🔐 Use strong, unique passwords
- 👀 Check that no one is watching when you type
- 🔒 Use the show/hide feature carefully

#### Step 3: Review Login Form

**Before Clicking Login:**
- ✅ Email is correct and complete
- ✅ Password is entered correctly
- ✅ No typos or extra spaces
- ✅ Caps Lock is OFF (if not intended)

#### Step 4: Submit Login

**Click the "LOG IN" Button:**
- Green button at the bottom of the form
- Button text changes to "SIGNING IN..." while processing
- Button becomes disabled during login process
- Wait for authentication to complete

**DO NOT:**
- ❌ Click the button multiple times
- ❌ Refresh the page during login
- ❌ Close the browser window
- ❌ Navigate away from the page

#### Step 5: Authentication Process

**System Verification:**
The system performs several security checks:

1. **Credential Verification**
   - Email and password validation
   - Database authentication check
   
2. **Role Verification**
   - Checks if account has admin privileges
   - Verifies role: Admin, Manager, or Employee
   - Checks `is_admin` flag in profile
   
3. **Authorization Check**
   - Confirms access to admin panel
   - Validates account status
   - Ensures account is active

**Processing Time:**
- ⏱️ Typically 2-5 seconds
- May take longer on slow connections
- Be patient and wait for response

#### Step 6: Successful Login

**If Login is Successful:**
- ✅ Redirects to **Dashboard** automatically
- ✅ Your name/profile appears in navigation
- ✅ Admin menu becomes accessible
- ✅ Session is established

**Dashboard Overview:**
- Analytics and statistics
- Recent orders
- Quick action buttons
- Navigation sidebar
- System notifications

**Your Profile Information:**
- Displayed in top-right corner
- Shows your name or email
- Access to profile settings
- Logout option available

---

## Password Recovery

### Forgot Your Password?

If you cannot remember your password, follow these steps:

#### Step 1: Access Password Reset

**From Login Page:**
1. Look for **"Forgot Password?"** link
2. Located next to the password field
3. Click the link (appears in green)
4. Redirects to password reset page

#### Step 2: Enter Your Email

**Password Reset Form:**
1. **Email Address** field appears
2. Enter your admin email address
   - Use the same email as your admin account
   - Must be registered in the system
3. Click **"Send Reset Email"** button

**Form Layout:**
- Similar to login page (black background)
- Company logo at top
- Back arrow to return to login
- Email field
- Submit button

#### Step 3: Check Your Email

**Email Instructions:**
1. Open your email inbox
   - Check primary inbox
   - Check spam/junk folder (if not found)
2. Look for email from Egie-Ecommerce
   - Subject: "Password Reset Request" or similar
   - Sender: noreply@supabase.io or system email
3. Email should arrive within 1-5 minutes

**If Email Doesn't Arrive:**
- Wait 5-10 minutes
- Check spam/junk folder
- Verify email address spelling
- Contact system administrator
- Request manual password reset

#### Step 4: Click Reset Link

**In the Email:**
1. Open the password reset email
2. Find the **"Reset Password"** link or button
3. Click the link
   - Opens in your browser
   - Takes you to password reset page
4. ⚠️ Link expires after certain time (usually 1 hour)
5. ⚠️ Link can only be used once

**Link Expiration:**
- If expired, request new reset email
- Start process over from Step 1

#### Step 5: Create New Password

**Reset Password Form:**

**New Password Field:**
1. Enter your new password
   - Minimum 6 characters
   - Use combination of:
     - Uppercase letters (A-Z)
     - Lowercase letters (a-z)
     - Numbers (0-9)
     - Special characters (@#$%^&*)
2. Use eye icon to show/hide password

**Confirm Password Field:**
1. Re-enter the exact same password
2. Must match "New Password" exactly
3. System verifies passwords match
4. Use eye icon to verify typing

**Password Requirements:**
- ✅ At least 6 characters
- ✅ Passwords must match
- ✅ No spaces at beginning or end
- ⚠️ More secure = uppercase + lowercase + numbers + symbols

**Example Strong Passwords:**
- `Admin@123!Secure`
- `MyP@ssw0rd2024`
- `EgieAdmin#456`

#### Step 6: Confirm Password Reset

**Submit New Password:**
1. Click **"Reset Password"** button
2. System validates password
3. Success message appears
4. Automatic redirect to login page

**After Reset:**
- ✅ Old password no longer works
- ✅ New password is now active
- ✅ You can sign in immediately
- 📧 Confirmation email sent

#### Step 7: Sign In with New Password

**Return to Login:**
1. Use your email address
2. Use your NEW password
3. Click "LOG IN"
4. Access granted to admin panel

**⚠️ Important Notes:**
- Write down your new password securely
- Store in password manager (recommended)
- Don't share with anyone
- Change password regularly (every 3-6 months)

---

## Security Best Practices

### Password Security

#### Creating Strong Passwords

**DO's:**
- ✅ Use at least 12 characters (longer is better)
- ✅ Mix uppercase and lowercase letters
- ✅ Include numbers and special characters
- ✅ Make it memorable but not obvious
- ✅ Use unique password for admin panel
- ✅ Consider using passphrase (e.g., "ILove2EatPizza@EGIE!")

**DON'Ts:**
- ❌ Don't use personal information (name, birthdate)
- ❌ Don't use common words or phrases
- ❌ Don't use "password", "admin", "123456"
- ❌ Don't reuse passwords from other sites
- ❌ Don't share password with colleagues
- ❌ Don't write password on sticky notes

#### Password Management

**Best Practices:**
- 🔐 Use a password manager (LastPass, 1Password, Bitwarden)
- 🔄 Change password every 3-6 months
- 📝 Document password changes (encrypted only)
- 👥 Never share credentials between users
- 🚫 Don't save password in browser on shared computers

### Session Security

#### During Your Session

**Always Remember:**
1. **Lock Your Screen** when stepping away
   - Windows: Win + L
   - Mac: Ctrl + Cmd + Q
   
2. **Sign Out** when finished
   - Click your profile icon
   - Select "Logout" or "Sign Out"
   - Especially on shared computers

3. **Stay Alert** for suspicious activity
   - Unexpected logouts
   - Changes you didn't make
   - Unfamiliar account activity

#### Network Security

**Secure Connection:**
- ✅ Use secure, private WiFi networks
- ✅ Verify HTTPS in browser (padlock icon)
- ✅ Use VPN when on public networks
- ❌ Avoid public WiFi for admin access
- ❌ Don't use unsecured networks

**Browser Security:**
- Keep browser updated
- Use incognito/private mode on shared computers
- Clear cache and cookies after session
- Enable browser security features

### Account Security

#### Monitoring Your Account

**Regular Checks:**
- Review admin logs regularly
- Check for unauthorized login attempts
- Monitor recent activity
- Report suspicious behavior immediately

#### Multi-Factor Authentication (MFA)

**If Available:**
- Enable 2FA/MFA for extra security
- Use authenticator app
- Keep backup codes safe
- Never share MFA codes

#### Reporting Security Issues

**If You Suspect Compromise:**
1. Change password immediately
2. Contact system administrator
3. Document any suspicious activity
4. Review recent actions in admin logs
5. Check for unauthorized changes

---

## Troubleshooting

### Common Login Issues

#### ❌ "Invalid Email or Password"

**Possible Causes:**
1. Email address misspelled or incorrect
2. Password typed incorrectly
3. Account doesn't exist
4. Password was recently changed

**Solutions:**
1. **Verify Email Address:**
   - Check for typos
   - Ensure complete email address
   - Try lowercase letters
   - Remove any spaces

2. **Verify Password:**
   - Check Caps Lock is OFF
   - Use eye icon to see what you're typing
   - Try typing slowly and carefully
   - Check for correct special characters

3. **Use Password Reset:**
   - Click "Forgot Password?"
   - Follow reset instructions
   - Create new password

4. **Contact Administrator:**
   - If you're certain credentials are correct
   - Account may be locked or disabled
   - May need manual password reset

#### ❌ "⛔ Access Denied: Not Authorized for Admin Panel"

**Error Message:**
```
Access Denied: This account is not authorized to access the admin panel. 
Only Admin, Manager, and Employee accounts are allowed. 
If you're a customer, please visit the main website.
```

**What This Means:**
- Your account is a customer account
- You don't have admin privileges
- Account role is not admin/manager/employee

**Solutions:**
1. **Wrong Account:**
   - You may be using customer email
   - Use your admin email instead
   - Verify which email has admin access

2. **Contact Administrator:**
   - Request admin access be granted
   - Admin must update your role
   - Role options: Admin, Manager, Employee

3. **Wrong Website:**
   - This is the admin panel
   - Customers use main website
   - Navigate to customer site instead

#### ❌ "Error Loading User Profile"

**Possible Causes:**
- Database connection issue
- Profile data missing
- Account setup incomplete

**Solutions:**
1. Try logging in again
2. Clear browser cache and cookies
3. Contact system administrator
4. May need profile creation in database

#### ❌ "Too Many Login Attempts"

**Account Temporarily Locked:**
- Security measure against brute force attacks
- Triggered by multiple failed login attempts

**Solutions:**
1. Wait 10-15 minutes before retrying
2. Use password reset feature
3. Contact administrator if urgent
4. Verify you're using correct credentials

#### ❌ Page Not Loading or Blank Screen

**Display Issues:**

**Solutions:**
1. **Refresh the Page:**
   - Press F5 or Ctrl+R (Cmd+R on Mac)
   - Or click browser refresh button

2. **Clear Browser Cache:**
   - Ctrl+Shift+Delete (Windows)
   - Cmd+Shift+Delete (Mac)
   - Clear browsing data

3. **Try Different Browser:**
   - Chrome
   - Firefox
   - Edge
   - Safari

4. **Check Internet Connection:**
   - Verify WiFi/ethernet connected
   - Test other websites
   - Reset router if needed

5. **Disable Extensions:**
   - Ad blockers may interfere
   - Try incognito/private mode
   - Disable browser extensions

#### ❌ "Cannot Connect to Server"

**Network/Server Issues:**

**Solutions:**
1. Check internet connection
2. Verify admin panel URL is correct
3. Server may be under maintenance
4. Contact system administrator
5. Check status page if available

#### ❌ Stuck on "SIGNING IN..." Button

**Login Freezes:**

**Solutions:**
1. Wait 30-60 seconds (may be slow connection)
2. Check browser console for errors (F12)
3. Refresh page and try again
4. Clear browser cache
5. Try different browser
6. Contact support if persistent

---

## FAQs

### General Questions

**Q: What is the admin panel URL?**
- A: Your system administrator will provide the specific URL
- Typically: `https://yourdomain.com/admin` or `https://admin.yourdomain.com`
- For local development: `http://localhost:5173/admin`

**Q: Can I access admin panel from mobile?**
- A: Yes, but desktop/laptop is strongly recommended
- Mobile experience may be limited
- Some features require larger screen
- Full functionality on tablets in landscape mode

**Q: How long does my session last?**
- A: Sessions typically last 24 hours
- May be shorter for security
- Timeout after extended inactivity
- You'll need to sign in again after timeout

**Q: Can multiple admins be logged in simultaneously?**
- A: Yes, multiple admin users can be logged in at once
- Each has their own session
- Activities are tracked per user
- Collaborative work is supported

### Account & Access

**Q: How do I get admin access?**
- A: Contact your system administrator
- They must create your account
- They assign your role (Admin/Manager/Employee)
- They provide initial credentials

**Q: Can I change my role from Employee to Admin?**
- A: No, only system administrators can change roles
- Contact your administrator to request role change
- Role changes are logged for security

**Q: What if I forget which email is my admin account?**
- A: Contact system administrator
- They can verify your registered email
- Check with HR or IT department
- Review initial welcome email

**Q: Can I use the same password as the customer site?**
- A: Not recommended for security reasons
- Use unique password for admin panel
- Prevents cross-site security issues
- Follow password best practices

### Security & Privacy

**Q: Is my password visible to administrators?**
- A: No, passwords are encrypted
- Even administrators cannot see passwords
- Only you know your password
- Passwords never stored in plain text

**Q: What happens if I forget to log out?**
- A: Session will timeout after inactivity period
- Automatic logout after specified time
- Lock your computer when stepping away
- Always log out on shared computers

**Q: Can I change my password without using "Forgot Password"?**
- A: Yes, through your admin profile settings
- Navigate to Profile/Account Settings
- Look for "Change Password" option
- Requires current password for verification

**Q: Is two-factor authentication (2FA) available?**
- A: Check with your system administrator
- May be available depending on system setup
- Highly recommended for enhanced security
- Contact admin to enable if supported

### Technical Issues

**Q: Why does the page look broken or unstyled?**
- A: CSS/styling files may not be loading
- Clear browser cache
- Check internet connection
- Disable ad blockers temporarily
- Contact support if persistent

**Q: Can I use Internet Explorer?**
- A: No, Internet Explorer is not supported
- Use modern browsers: Chrome, Firefox, Edge, Safari
- Update your browser to latest version
- Edge (Chromium) is recommended for Windows users

**Q: What if I see a security warning?**
- A: May indicate SSL certificate issue
- Contact administrator immediately
- Do not proceed if certificate invalid
- Ensure you're on correct URL

**Q: The system is very slow. What should I do?**
- A: Check your internet speed
- Close unnecessary browser tabs
- Clear browser cache
- Restart browser
- Try during off-peak hours
- Contact administrator about server performance

---

## Quick Reference Guide

### Login Checklist

#### ✅ Before You Start
- [ ] You have admin/manager/employee account
- [ ] You know your email address
- [ ] You know your password
- [ ] You're on secure network
- [ ] Browser is up to date

#### ✅ Login Steps
1. [ ] Navigate to admin login page
2. [ ] Enter email address
3. [ ] Enter password
4. [ ] Click "LOG IN"
5. [ ] Wait for authentication
6. [ ] Access dashboard

#### ✅ After Login
- [ ] Verify you're logged in
- [ ] Check dashboard loads correctly
- [ ] Your profile shows in navigation
- [ ] Begin admin tasks

### Emergency Contacts

**For Login Issues:**
- System Administrator: [contact information]
- IT Support: [contact information]
- Help Desk: [contact information]

**For Security Concerns:**
- Security Team: [contact information]
- Emergency Line: [contact information]

---

## Support Resources

### Getting Help

**Documentation:**
- Admin panel user guide
- Video tutorials (if available)
- Knowledge base articles
- FAQ section

**Contact Support:**
- Email: admin-support@yourdomain.com
- Phone: [phone number]
- Help Desk: [ticket system URL]
- Live Chat: [if available]

### Additional Training

**For New Admins:**
- Request onboarding session
- Review admin documentation
- Shadow experienced admin
- Practice in test environment

**Continuous Learning:**
- Attend training sessions
- Review update announcements
- Join admin community
- Share best practices

---

## Important Reminders

### Security Policies

**⚠️ Critical Security Rules:**
1. **Never share** your login credentials
2. **Always sign out** when finished
3. **Report suspicious** activity immediately
4. **Use strong passwords** and change regularly
5. **Lock your screen** when away from desk
6. **Access only** on secure networks
7. **Keep credentials** confidential

### Account Responsibilities

**As an Admin User, You Are Responsible For:**
- Maintaining confidentiality of your credentials
- Following security policies and procedures
- Reporting security incidents promptly
- Using admin access appropriately
- Protecting customer and business data
- Complying with data privacy regulations

### Data Protection

**Remember:**
- Admin panel contains sensitive data
- Customer information must be protected
- Business data is confidential
- Access is logged and monitored
- Misuse may result in account termination
- Follow all company policies

---

## Summary

### Key Takeaways

1. **Access Control:**
   - Only Admin, Manager, and Employee roles allowed
   - Customer accounts cannot access admin panel
   - Role-based permissions enforced

2. **Login Process:**
   - Simple email and password authentication
   - Role verification on every login
   - Automatic redirect to dashboard on success

3. **Password Recovery:**
   - Self-service password reset available
   - Email verification required
   - Links expire for security

4. **Security First:**
   - Strong passwords mandatory
   - Regular password changes recommended
   - Always log out when done
   - Report security concerns immediately

5. **Get Help:**
   - Contact administrator for account issues
   - Use password reset for forgotten passwords
   - Report technical problems promptly
   - Follow security best practices

---

**Version:** 1.0  
**Last Updated:** January 8, 2026  
**System:** Egie-Ecommerce Admin Panel

**Thank you for helping us maintain a secure and efficient admin system!** 🔐✨
