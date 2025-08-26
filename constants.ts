//authentication constants

export const TOKEN_KEY_NAME = "accessToken";
export const COOKIE_NAME = "spotlight_auth_token";
export const REFRESH_COOKIE_NAME = "spotlight_refresh_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const JWT_EXPIRATION_TIME = "7days"; // 7 days
export const REFRESH_TOKEN_EXPIRATION_TIME = "30days"; // 30 days
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days


// refresh token constants
export const REFRESH_BEFORE_EXPIRATION = 60 * 60 * 24 * 7; // 7 days before expiration


// google auth constants
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/callback`;
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';


// environment constants
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:3000';
export const APP_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME;
export const JWT_SECRET = process.env.JWT_SECRET;


//cookie settings
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: COOKIE_MAX_AGE
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/api/auth/refresh',
  maxAge: REFRESH_TOKEN_MAX_AGE
};
