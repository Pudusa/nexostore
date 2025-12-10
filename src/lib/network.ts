import os from 'os';

export function getLocalIPAddress(): string {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName of Object.keys(interfaces)) {
    const iface = interfaces[interfaceName];
    
    // Saltar interfaces deshabilitadas o loopback
    if (!iface || interfaceName.includes('Loopback') || interfaceName.includes('lo')) {
      continue;
    }
    
    for (const alias of iface) {
      // Solo considerar IPs IPv4 que no son internas
      if (!alias.internal && alias.family === 'IPv4') {
        return alias.address;
      }
    }
  }
  
  // Si no se encuentra ninguna IP externa, retornar localhost
  return '127.0.0.1';
}

// Puerto de backend
export const BACKEND_PORT = 3001;

// Puerto de frontend
export const FRONTEND_PORT = 3000;

// URL base del backend basada en IP detectada
export const BACKEND_BASE_URL = `http://${getLocalIPAddress()}:${BACKEND_PORT}`;

// URL base del frontend basada en IP detectada
export const FRONTEND_BASE_URL = `http://${getLocalIPAddress()}:${FRONTEND_PORT}`;