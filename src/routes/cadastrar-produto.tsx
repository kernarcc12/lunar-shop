import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, PackagePlus, LogIn } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categorias } from "@/data/products";

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  preco: z.coerce.number().positive("Preço deve ser maior que zero"),
  precoAntigo: z.coerce.number().positive("Preço antigo deve ser maior que zero").optional().or(z.literal("")),
  imagemUrl: z.string().url("Insira uma URL válida").or(z.literal("")),
  parcelas: z.coerce.number().int().min(1, "Mínimo 1 parcela").max(48, "Máximo 48 parcelas"),
  freteGratis: z.boolean(),
  avaliacao: z.coerce.number().min(0, "Mínimo 0").max(5, "Máximo 5"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
});

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/cadastrar-produto")({
  head: () => ({
    meta: [{ title: "Cadastrar Produto | Lunar Produtos" }],
  }),
  component: CadastrarProduto,
});

function CadastrarProduto() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      categoria: "",
      preco: 0,
      precoAntigo: "",
      imagemUrl: "",
      parcelas: 1,
      freteGratis: false,
      avaliacao: 5,
      descricao: "",
    },
  });

  async function onSubmit(data: FormData) {
    if (!user) return;
    setErro("");

    const { error } = await supabase.from("produtos").insert({
      nome: data.nome,
      categoria: data.categoria,
      preco: data.preco,
      preco_antigo: data.precoAntigo && data.precoAntigo > 0 ? data.precoAntigo : null,
      imagem: data.imagemUrl || "",
      parcelas: data.parcelas,
      frete_gratis: data.freteGratis,
      avaliacao: data.avaliacao,
      vendidos: 0,
      descricao: data.descricao,
      criado_por: user.id,
    });

    if (error) {
      setErro(error.message);
      return;
    }

    setEnviado(true);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Faça login para cadastrar produtos.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <PackagePlus className="h-8 w-8 text-success" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-foreground">
              Produto cadastrado com sucesso!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              O produto foi salvo no banco de dados e já está disponível na loja.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
              >
                Ver na loja
              </Link>
              <button
                onClick={() => {
                  setEnviado(false);
                  form.reset();
                }}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Cadastrar outro
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h1 className="text-xl font-semibold text-foreground">Cadastrar Produto</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados do produto para adicioná-lo à loja.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
              {erro && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {erro}
                </div>
              )}

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fone de Ouvido Bluetooth" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parcelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={48} {...field} />
                      </FormControl>
                      <FormDescription>Até 48x sem juros</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step={0.01} min={0} placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precoAntigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço antigo (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={0.01}
                          min={0}
                          placeholder="Opcional"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Deixe vazio se não houver desconto</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="avaliacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avaliação (0 a 5)</FormLabel>
                      <FormControl>
                        <Input type="number" step={0.1} min={0} max={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="freteGratis"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Frete grátis</FormLabel>
                        <FormDescription>Produto com entrega gratuita</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imagemUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da imagem</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Link da imagem do produto. Se vazio, será exibida sem imagem.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o produto: características, benefícios, diferenciais..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Cancelar
                </Link>
                <Button
                  type="submit"
                  className="bg-brand text-gold hover:bg-brand-soft"
                >
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Cadastrar produto
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
