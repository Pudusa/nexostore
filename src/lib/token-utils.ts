import { Session } from "next-auth";

// Function to refresh JWT token if it's expired or about to expire
export const refreshAuthToken = async (session: Session | null): Promise<Session | null> => {
  if (!session?.user?.apiToken || !session?.user?.refreshToken) {
    return session; // No tokens to refresh
  }

  try {
    // Decode the access token to check expiration
    const base64Url = session.user.apiToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000; // Convertir a segundos

    // If token expires in less than 5 minutes, refresh it
    if (payload.exp < currentTime + 300) { // 300 segundos = 5 minutos
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: session.user.refreshToken }),
      });

      if (response.ok) {
        const refreshedTokens = await response.json();
        
        // Update the session with new tokens
        if (typeof window !== 'undefined') {
          // For client-side updates, we need to use next-auth's session update mechanism
          // This is just a placeholder - the actual update would happen through next-auth's session provider
        }
        
        return {
          ...session,
          user: {
            ...session.user,
            apiToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token,
          }
        };
      } else {
        console.error('Token refresh failed');
        // Return null to indicate session is no longer valid
        return null;
      }
    }
  } catch (error) {
    console.error('Error checking token expiration:', error);
  }

  return session; // Return original session if no refresh needed
};

// Function to check if access token is expired
export const isAccessTokenExpired = (token: string): boolean => {
  try {
    // Dividir el token para obtener el payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000; // Convertir a segundos

    // Si expira en menos de 5 minutos, considerarlo como expirado para prevenir problemas
    return payload.exp < currentTime + 300; // 300 segundos = 5 minutos
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return true; // Si no podemos decodificarlo, asumir que está expirado o inválido
  }
};