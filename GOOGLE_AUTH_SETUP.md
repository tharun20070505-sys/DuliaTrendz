# Google Cloud Console Setup Guide: Google OAuth 2.0 / Google Identity Services (GIS)

This guide provides the exact, step-by-step instructions to configure Google OAuth 2.0 and Google Identity Services for **DULIA TRENDZ** (`React + Express + Node.js + MongoDB`).

---

## 1. Create or Select a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top navigation bar and select **New Project**.
3. Set the **Project Name** to: `Dulia Trendz E-Commerce` (or `Dulia Trendz`).
4. Select your Organization/Billing account if applicable, then click **Create**.
5. Once created, ensure your new project is selected in the project dropdown.

---

## 2. Configure the OAuth Consent Screen

1. In the left navigation menu, open **APIs & Services** > **OAuth consent screen** (or search for *OAuth consent screen* in the top search bar).
2. Choose **User Type**:
   - Select **External** (allows any Google account holder / customer to sign in).
   - Click **Create**.
3. **App Information**:
   - **App name**: `DULIA TRENDZ`
   - **User support email**: Select your developer or support email (e.g., `support@duliatrendz.com`).
   - **App logo** *(optional in dev, required for production verification)*: Upload the Dulia Trendz square logo (120x120px).
4. **App Domain**:
   - **Application home page**: `https://duliatrendz.com` (or `http://localhost:5173` for testing).
   - **Application privacy policy link**: `https://duliatrendz.com/privacy`
   - **Application terms of service link**: `https://duliatrendz.com/terms`
   - **Authorized domains**:
     - Add your top-level domain: `duliatrendz.com` (without `http://` or `www`).
5. **Developer Contact Information**:
   - Enter your email address for notifications regarding project changes.
   - Click **Save and Continue**.
6. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Select only the three standard user profile scopes:
     - `.../auth/userinfo.email` (`email`)
     - `.../auth/userinfo.profile` (`profile`)
     - `openid`
   - Click **Update** and then **Save and Continue**.
7. **Test Users** *(While Publishing Status is "Testing")*:
   - Add your own Google email and any team member emails who will test the login during development.
   - Click **Save and Continue**.

---

## 3. Create OAuth 2.0 Client ID Credentials

1. In the left navigation menu, navigate to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. In the **Application type** dropdown, select **Web application**.
4. **Name**: `Dulia Trendz Web Client`.
5. **Authorized JavaScript origins**:
   - Add URI 1: `http://localhost:5173`
   - Add URI 2: `http://127.0.0.1:5173`
   - Add URI 3 (Production): `https://duliatrendz.com` (and `https://www.duliatrendz.com` if using `www`).
   *(Note: Do not include trailing slashes or path segments in origins).*
6. **Authorized redirect URIs**:
   - For Google Identity Services (One Tap and Popup credential flow), **redirect URIs are not required**; Google returns the credential directly to the origin.
   - If using a full-page redirect flow as a fallback, add: `http://localhost:5173/login` and `https://duliatrendz.com/login`.
7. Click **Create**.
8. A modal will display your **Client ID** (e.g., `123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`) and **Client Secret**.

---

## 4. Environment Variables Configuration

### Backend (`backend/.env`)
Add the Client ID to the backend `.env` file:
```env
# Google OAuth 2.0 Client ID for server-side token signature and audience verification
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

### Frontend (`frontend/.env`)
Add the Client ID to the frontend `.env` file:
```env
# Public Google Client ID loaded by Google Identity Services SDK in React
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

> **Security Rule**: The `GOOGLE_CLIENT_ID` is public. Never expose the Google Client Secret or any private keys in frontend bundles, repositories, or public configs.

---

## 5. End-to-End Verification Checklist

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Button Click** | Open `http://localhost:5173/login` and click **Continue with Google**. | Google account chooser popup or prompt appears. |
| **2. Account Approval** | Choose your Google account and grant permission. | Google issues a signed ID token (`credential`) to React. |
| **3. API Request** | React sends `{ credential }` to `POST /api/auth/google`. | Server validates signature, aud, iss, and email verification. |
| **4. User Provisioning** | Server finds or creates customer in MongoDB. | User role is strictly `customer`; avatar and lastLogin are recorded. |
| **5. Session Creation** | Server sets secure `httpOnly` `token` & `refreshToken` cookies. | Returns user object without sensitive secrets. |
| **6. Redirection & Avatar** | React displays checkmark animation and redirects to previous route. | Navbar displays customer's Google avatar photo with account menu. |
