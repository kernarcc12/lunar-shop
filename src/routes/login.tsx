import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn } from "lucide-react";
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
});

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login | Lunar Produtos" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [erro, setErro] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    setErro("");
    const result = await signIn(data.email, data.password);
    if (result.error) {
      setErro(result.error);
      return;
    }
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4 text-center">
            <h1 className="text-xl font-semibold text-foreground">Entrar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse sua conta para cadastrar produtos.
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
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            </form>
          </Form>

          <div className="border-t border-border px-6 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link
                to="/cadastro"
                className="font-medium text-gold-deep hover:text-gold"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
