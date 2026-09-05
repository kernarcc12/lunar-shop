import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, CheckCircle } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { supabase } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [{ title: "Redefinir Senha | Lunar Produtos" }],
  }),
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");

    if (accessToken) {
      setTokenValid(true);
    }
    setLoading(false);
  }, []);

  async function onSubmit(data: FormData) {
    setErro("");
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    if (error) {
      setErro(error.message);
      return;
    }
    setSucesso(true);
    setTimeout(() => navigate({ to: "/login" }), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4 text-center">
            <h1 className="text-xl font-semibold text-foreground">Redefinir Senha</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Digite sua nova senha abaixo.
            </p>
          </div>

          {!tokenValid ? (
            <div className="p-6 text-center">
              <p className="text-sm text-destructive">
                Link de recuperação inválido ou expirado. Solicite um novo link.
              </p>
              <Button
                variant="link"
                className="mt-4 text-gold-deep"
                onClick={() => navigate({ to: "/login" })}
              >
                Voltar ao login
              </Button>
            </div>
          ) : sucesso ? (
            <div className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-sm text-foreground">
                Senha redefinida com sucesso! Redirecionando para o login...
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
                {erro && (
                  <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {erro}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-brand text-gold hover:bg-brand-soft"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Redefinir senha
                </Button>
              </form>
            </Form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
