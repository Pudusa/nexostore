"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Iniciando Sesión..." : "Iniciar Sesión"}
    </Button>
  );
}

export default function LoginForm() {
  const initialState = { message: "", success: false };
  const [state, dispatch] = useFormState(login, initialState);
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");

  return (
    <Card className="w-full max-w-sm">
      <form action={dispatch}>
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {successMessage && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>¡Cuenta Creada!</AlertTitle>
              <AlertDescription>
                Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.
              </AlertDescription>
            </Alert>
          )}
          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {state.success ? "Éxito" : "Error de autenticación"}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" name="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
