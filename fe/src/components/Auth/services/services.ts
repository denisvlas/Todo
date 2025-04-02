import { AUTH_ENDPOINTS } from "../utils/constants";
import { AuthResponse, GenerateOptionsResponse } from "../../../models";
import axios, { AxiosError } from "axios";


export interface ApiError {
  type: 'validation' | 'auth' | 'server' | 'network' | 'unknown';
  message: string;
  statusCode?: number;
  originalError?: any;
}


const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (!axiosError.response) {
      return { 
        type: 'network', 
        message: 'Conexiunea la server nu a fost posibilă. Verificați conexiunea și încercați din nou.',
        originalError: error
      };
    }
    
    const status = axiosError.response.status;
    
    // Handle different status codes
    if (status === 400) {
      return { 
        type: 'validation', 
        message: (axiosError.response.data as any)?.error || 'Datele introduse sunt invalide',
        statusCode: status,
        originalError: error
      };
    } else if (status === 401 || status === 403) {
      return { 
        type: 'auth', 
        message: 'Autentificare eșuată. Verificați numele de utilizator și parola.',
        statusCode: status,
        originalError: error
      };
    } else if (status >= 500) {
      return { 
        type: 'server', 
        message: 'Eroare de server. Încercați mai târziu.',
        statusCode: status,
        originalError: error
      };
    } else {
      return { 
        type: 'unknown', 
        message: (axiosError.response.data as any)?.message || `Eroare: ${status}`,
        statusCode: status,
        originalError: error
      };
    }
  }
  
  return { 
    type: 'unknown', 
    message: error instanceof Error ? error.message : 'A apărut o eroare necunoscută',
    originalError: error
  };
};


// Authentication API
export const authApi = {
  // Check available authentication methods
  checkAuthMethods: async (username: string,project_id:string) => {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.AUTH_METHODS, {
        username,
        project_id
      });
      return response.data;
    } catch (error) {
      console.error("Error checking auth methods:", error);
      throw handleApiError(error);
    }
  },

  // Login with password
  loginWithPassword: async (
    project_id: string,
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN_PASSWORD, {
        project_id,
        username,
        password,
      });
      return response.data;
    } catch (error) {
      // console.error("Login error:", error);
      throw handleApiError(error);
    }
  },

  // Register with password
  registerWithPassword: async (
    project_id: string,
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER_PASSWORD, {
        project_id,
        username,
        password,
      });
      console.log("Registration response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw handleApiError(error);
    }
  },

  // Get WebAuthn registration options
  getRegistrationOptions: async (username: string,project_id:string): Promise<any> => {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER_OPTIONS, {
        username,
        project_id
      });
      return response.data;
    } catch (error) {
      console.error("Error getting registration options:", error);
      throw handleApiError(error);
    }
  },

  // Verify WebAuthn registration
  verifyRegistration: async (params: {
    username: string;
    response: any;
    userId: string;
    project_id?: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER_VERIFY, params);
      return response.data;
    } catch (error) {
      console.error("Verification error:", error);
      throw handleApiError(error);
    }
  },

  // Get WebAuthn authentication options
  getAuthenticationOptions: async (
    username: string,
    projectId: string

  ): Promise<GenerateOptionsResponse> => {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.GENERATE_OPTIONS, {
        username,
        project_id: projectId,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting authentication options:", error);
      throw handleApiError(error);
    }
  },

  // Verify WebAuthn authentication
  verifyAuthentication: async (params: {
    username: string;
    response: any;
    project_id: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await axios.post(AUTH_ENDPOINTS.AUTH_VERIFY, params);
      return response.data;
    } catch (error) {
      console.error("Authentication verification error:", error);
      throw handleApiError(error);
    }
  },
};
