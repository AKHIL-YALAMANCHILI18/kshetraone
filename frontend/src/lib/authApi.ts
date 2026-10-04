const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const TOKEN_STORAGE_KEY = 'kshetraone_auth_token';

export interface BackendUser {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
}

export interface BackendProfile {
  id: string;
  user_id: string;
  name: string;
  phone_number?: string | null;
  state: string;
  district: string;
  taluk?: string | null;
  village: string;
  pincode?: string | null;
  farm_type: string;
  land_area_acres: number;
  cattle_count: number;
  language: string;
  onboarded: boolean;
  ecosystem_data?: string | null;
}

export interface AuthApiResponse {
  success: boolean;
  access_token?: string;
  token_type?: string;
  user?: BackendUser;
  profile?: BackendProfile;
  error?: string;
}

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage quota errors
  }
};

export const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore
  }
};

/**
 * Registers a new farmer using the native FastAPI backend and Argon2 hashing.
 */
export const backendRegister = async (
  fullName: string,
  email: string,
  pass: string
): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: pass,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data.detail || 'Registration failed. Please check your information and try again.',
      };
    }

    if (data.access_token) {
      setStoredToken(data.access_token);
    }

    return {
      success: true,
      access_token: data.access_token,
      token_type: data.token_type,
      user: data.user,
      profile: data.profile,
    };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return {
      success: false,
      error: e?.message || 'Could not reach KshetraOne server. Please verify backend is running on port 8000.',
    };
  }
};

/**
 * Logs in an existing farmer using the native FastAPI backend and Argon2 password verification.
 */
export const backendLogin = async (
  email: string,
  pass: string
): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: pass,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: data.detail || 'Invalid email or password. Please verify your credentials.',
      };
    }

    if (data.access_token) {
      setStoredToken(data.access_token);
    }

    return {
      success: true,
      access_token: data.access_token,
      token_type: data.token_type,
      user: data.user,
      profile: data.profile,
    };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return {
      success: false,
      error: e?.message || 'Could not reach KshetraOne server. Please verify backend is running on port 8000.',
    };
  }
};

/**
 * Retrieves the currently authenticated farmer's profile using the stored JWT token.
 */
export const backendGetMe = async (
  tokenOverride?: string
): Promise<{ success: boolean; user?: BackendUser; profile?: BackendProfile; error?: string }> => {
  const token = tokenOverride || getStoredToken();
  if (!token) {
    return { success: false, error: 'No active session token' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      removeStoredToken();
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.detail || 'Session expired. Please log in again.' };
    }

    const data = await res.json();
    return {
      success: true,
      user: data.user,
      profile: data.profile,
    };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return { success: false, error: e?.message || 'Network error verifying session' };
  }
};

/**
 * Logs out the farmer and removes the stored JWT token.
 */
export const backendLogout = async (): Promise<void> => {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  removeStoredToken();
};

/**
 * Synchronizes the farmer's profile and ecosystem data to the SQLite database.
 */
export const backendUpdateProfile = async (
  profileData: Partial<BackendProfile>
): Promise<boolean> => {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/farmer/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Safe password reset notification endpoint.
 */
export const backendForgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      message: data.message || 'Outbound email delivery is disabled under the ₹0 budget. Please use your registered credentials.',
    };
  } catch {
    return {
      success: true,
      message: 'Outbound email delivery is disabled under the ₹0 budget. Please use your registered credentials.',
    };
  }
};
