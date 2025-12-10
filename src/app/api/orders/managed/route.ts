import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAuthenticatedApi } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario sea un manager
    if (session.user.role !== 'manager') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Obtener los pedidos de productos gestionados por el usuario
    const authApi = await getAuthenticatedApi();
    const response = await authApi.get(`/orders/managed/${session.user.id}`);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching managed orders:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}