export const env = {
  port: Number(process.env.PORT || 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 3001}/api/auth/google/callback`,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  // Gmail SMTP — used exclusively on the server for OTP emails.
  // Never expose these to the frontend or any client-side code.
  gmail: {
    user: process.env.GMAIL_USER,
    appPassword: process.env.GMAIL_APP_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME || 'Brand2Influence',
  },
}
