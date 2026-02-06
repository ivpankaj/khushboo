# 🔧 How to Fix "Missing Permissions" Error

This error happens because your **Cloud Firestore Security Rules** are set to private by default, blocking the app from saving or reading data.

## 🚀 Steps to Fix (Takes 1 min)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click on your project **"cookmymedia"**.
3. In the left sidebar, click **Build** -> **Firestore Database**.
4. Click on the **Rules** tab at the top.
5. **Delete** the existing code and **Paste** this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read and write to any document
    // WARNING: For a production app, you would want stricter rules.
    // But for a personal Valentine's proposal, this is perfect!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**.

---

### ✅ Once you click Publish:
- Refresh your app (`http://localhost:3000`).
- The error will disappear.
- Data will start appearing in your `/result` dashboard immediately!
