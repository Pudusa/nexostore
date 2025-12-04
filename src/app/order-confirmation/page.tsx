import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
             <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl">¡Gracias por tu pedido!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Hemos recibido tu pedido y lo estamos procesando. El vendedor se pondrá en contacto contigo pronto para coordinar la entrega.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/">Seguir comprando</Link>
            </Button>
             <Button variant="outline" asChild>
              <Link href="/account/orders">Ver mis pedidos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
