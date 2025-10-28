"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Clipboard, Phone } from "lucide-react";

interface ProductContactProps {
  phone: string;
}

export default function ProductContact({ phone }: ProductContactProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phone);
    toast({
      title: "Número Copiado",
      description: "El número de teléfono ha sido copiado al portapapeles.",
    });
  };

  return (
    <div className="mt-6 space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Información de Contacto</h3>
        <p className="text-muted-foreground">
          Para comprar este producto, contacta directamente al vendedor.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Clipboard className="mr-2 h-4 w-4" />
                Copiar Número
            </Button>
            <Button asChild className="flex-1" variant="secondary">
                <a href={`tel:${phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar
                </a>
            </Button>
        </div>
    </div>
  );
}
