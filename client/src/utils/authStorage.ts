const ACCESS_TOKEN_KEY = '__admin_sec_at';
const USER_KEY = '__admin_sec_usr';
const LOGOUT_SYNC_KEY = '__admin_logout_sync';

export const clearAllAuthStorage = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.setItem(LOGOUT_SYNC_KEY, Date.now().toString());
};

export const getAccessToken = () => {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};
