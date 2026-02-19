# 🏛️ Lawyer Dashboard - Complete Guide

## ✅ What's Been Created

### **New Lawyer Dashboard**
A dedicated dashboard specifically for lawyers with:
- ✅ **Consultation Requests** - View and manage client requests
- ✅ **Location Settings** - Update practice location
- ✅ **Statistics** - Track consultations and ratings
- ❌ **No Document Upload** - Removed for lawyers (only for clients)

## 🎯 Features

### **1. Consultation Requests Management**

**What Lawyers Can See:**
- Client name and contact information
- Consultation type (Criminal Law, Family Law, etc.)
- Date and time of requested consultation
- Client message/reason for consultation
- Status (Pending, Accepted, Completed, Rejected)

**Actions Available:**
- ✅ **Accept** - Approve consultation request
- ❌ **Decline** - Reject consultation request
- 📊 **View Details** - See full client information

### **2. Dashboard Statistics**

**Four Key Metrics:**
1. **Total Consultations** - All consultation requests received
2. **Pending Requests** - Awaiting lawyer response
3. **Completed** - Successfully finished consultations
4. **Rating** - Average lawyer rating (⭐)

### **3. Location Settings**

**Editable Fields:**
- City
- State
- Full Address
- Zip Code

**How It Works:**
1. Click "Edit" button
2. Update location information
3. Click "Save Location"
4. Location updated in profile

## 📊 Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Lawyer Dashboard                               │
│  Welcome back, [Lawyer Name]!                   │
├─────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Total │  │Pending│  │Completed│  │Rating│    │
│  │  5   │  │  2    │  │   3     │  │ 4.5⭐│    │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
├─────────────────────────────────────────────────┤
│  📨 Consultation Requests                       │
│  ┌───────────────────────────────────────────┐ │
│  │ 👤 John Doe          [Pending]            │ │
│  │ Criminal Law                              │ │
│  │ 📅 Feb 9, 2026  ⏰ 10:00 AM              │ │
│  │ ✉️ john@example.com  📞 +1234567890      │ │
│  │ Message: Need consultation regarding...   │ │
│  │ [✓ Accept]  [✗ Decline]                  │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │ 👤 Jane Smith        [Pending]            │ │
│  │ Family Law                                │ │
│  │ ...                                       │ │
│  └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  📍 Location Settings              [Edit]      │
│  ┌───────────────────────────────────────────┐ │
│  │ 📍 City: New York                         │ │
│  │ 📍 State: NY                              │ │
│  │ 📍 Address: 123 Main St                   │ │
│  │ 📍 Zip Code: 10001                        │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 🎨 Visual Design

### **Color-Coded Status**
- 🟡 **Pending** - Yellow/Orange border
- 🟢 **Accepted** - Green border
- 🔵 **Completed** - Blue border
- 🔴 **Rejected** - Red border

### **Stat Cards**
Each stat card has a unique gradient:
- **Total Consultations** - Purple gradient
- **Pending Requests** - Pink gradient
- **Completed** - Blue gradient
- **Rating** - Orange/Yellow gradient

### **Consultation Cards**
- Client avatar with initials
- Color-coded status badges
- Organized information layout
- Action buttons for pending requests

## 🚀 How to Access

### **For Lawyers:**
1. Register as a lawyer
2. Login with lawyer credentials
3. Automatically redirected to `/lawyer-dashboard`

### **Direct URL:**
```
http://localhost:5173/lawyer-dashboard
```

## 📱 Responsive Design

### **Desktop (>768px)**
- Two-column layout for stats
- Full-width consultation cards
- Side-by-side action buttons

### **Mobile (<768px)**
- Single-column layout
- Stacked stat cards
- Vertical action buttons
- Optimized touch targets

## 🔐 Security

### **Protected Route**
- Only accessible to users with `role: 'lawyer'`
- Requires authentication
- Redirects non-lawyers to regular dashboard

### **Data Privacy**
- Lawyers only see their own consultations
- Client contact info protected
- Secure API calls with JWT tokens

## 🎯 User Flow

### **Lawyer Registration → Dashboard**
```
Register as Lawyer
        ↓
Fill registration form
        ↓
Submit (role: 'lawyer')
        ↓
Account created
        ↓
Redirect to /lawyer-dashboard
        ↓
See consultation requests
```

### **Managing Consultations**
```
View pending request
        ↓
Read client details
        ↓
Click "Accept" or "Decline"
        ↓
API updates status
        ↓
Dashboard refreshes
        ↓
Client notified
```

### **Updating Location**
```
Click "Edit" button
        ↓
Update location fields
        ↓
Click "Save Location"
        ↓
API updates profile
        ↓
Location saved
        ↓
Visible in search results
```

## 📊 API Endpoints Used

### **Get Lawyer Profile**
```
GET /api/auth/me
Response: {
  lawyerProfile: {
    location: { city, state, address, zipCode },
    rating: { average, count },
    ...
  }
}
```

### **Get Consultations**
```
GET /api/appointments
Response: {
  data: [
    {
      client: { name, email, phone },
      date, time, status, type, message
    }
  ]
}
```

### **Update Consultation Status**
```
PATCH /api/appointments/:id
Body: { status: 'accepted' | 'rejected' }
```

### **Update Location**
```
PUT /api/lawyers/profile
Body: {
  location: { city, state, address, zipCode }
}
```

## 🧪 Testing

### **Test 1: Access Dashboard**
1. Register as lawyer
2. Should redirect to `/lawyer-dashboard`
3. See lawyer-specific dashboard

### **Test 2: View Consultations**
1. Dashboard shows consultation requests
2. See client information
3. Status badges displayed correctly

### **Test 3: Accept Consultation**
1. Click "Accept" on pending request
2. Status changes to "Accepted"
3. Success toast notification

### **Test 4: Update Location**
1. Click "Edit" in Location Settings
2. Update fields
3. Click "Save Location"
4. Location updated successfully

## 🎨 Differences from User Dashboard

| Feature | User Dashboard | Lawyer Dashboard |
|---------|---------------|------------------|
| Document Upload | ✅ Yes | ❌ No |
| Consultation Requests | ❌ No | ✅ Yes |
| Location Settings | ❌ No | ✅ Yes |
| Appointments | ✅ View own | ✅ Manage incoming |
| Statistics | Basic | Detailed |
| Profile Management | Basic | Advanced |

## 📝 Mock Data

If database is not connected, dashboard shows mock consultations:

```javascript
[
  {
    client: { name: 'John Doe', email: 'john@example.com' },
    date: 'Tomorrow',
    time: '10:00 AM',
    status: 'pending',
    type: 'Criminal Law',
    message: 'Need consultation regarding traffic violation'
  },
  {
    client: { name: 'Jane Smith', email: 'jane@example.com' },
    date: 'Day after tomorrow',
    time: '2:00 PM',
    status: 'pending',
    type: 'Family Law',
    message: 'Divorce consultation needed'
  }
]
```

## ✨ Features Summary

### **What Lawyers Get:**
- ✅ Dedicated dashboard
- ✅ Consultation request management
- ✅ Accept/decline requests
- ✅ View client contact info
- ✅ Update practice location
- ✅ Track statistics and ratings
- ✅ Professional interface
- ❌ No document upload (client feature only)

### **What Clients Get:**
- ✅ Regular dashboard
- ✅ Document upload
- ✅ View appointments
- ✅ Search lawyers
- ✅ Book consultations

## 🚀 Quick Start

### **For Lawyers:**
1. Open: http://localhost:5173/register
2. Fill form with role: "Lawyer"
3. Submit
4. Redirected to lawyer dashboard
5. See consultation requests
6. Update location settings

### **For Testing:**
```bash
# Register as lawyer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Attorney Smith",
    "email": "lawyer@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "lawyer"
  }'
```

## 📞 Support

### **Common Issues:**

**Issue: Dashboard not loading**
- Check if logged in as lawyer
- Verify role is 'lawyer'
- Check browser console for errors

**Issue: Consultations not showing**
- Database might not be connected
- Mock data will be displayed
- Check server logs

**Issue: Location not saving**
- Verify API endpoint exists
- Check authentication token
- See server error logs

## 🎉 Summary

**Lawyer Dashboard is Ready!**

- ✅ Separate from user dashboard
- ✅ Consultation request management
- ✅ Location settings
- ✅ No document upload
- ✅ Professional design
- ✅ Fully functional

**Access it now:** http://localhost:5173/lawyer-dashboard

(Must be logged in as a lawyer)
