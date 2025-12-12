import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAuthenticatedApi } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todos los pedidos no entregados
    const authApi = await getAuthenticatedApi();
    const response = await authApi.get('/orders/transactions');

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching pending orders:', error);

    // Si es un error de token expirado o autenticación, devolver 401
    if (error.message?.includes('expirado') || error.message?.includes('expired') || error.response?.status === 401) {
      return NextResponse.json({ error: 'Sesión expirado' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}