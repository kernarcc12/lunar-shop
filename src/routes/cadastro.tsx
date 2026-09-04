import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useAuth } from "@/lib/auth";
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
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [{ title: "Cadastro | Lunar Produtos" }],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormData) {
    setErro("");
    const result = await signUp(data.email, data.password);
    if (result.error) {
      setErro(result.error);
      return;
    }
    setSucesso(true);
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Conta criada!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifique seu email para confirmar o cadastro. Depois, faça login.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
            >
              Ir para o login
            </Link>
          </div>
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
            <h1 className="text-xl font-semibold text-foreground">Criar conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre-se para começar a vender.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
              {erro && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {erro}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
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
                      <Input type="password" placeholder="Repita a senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-brand text-gold hover:bg-brand-soft"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Criar conta
              </Button>
            </form>
          </Form>

          <div className="border-t border-border px-6 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="font-medium text-gold-deep hover:text-gold"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
