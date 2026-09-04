import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, LogIn, Upload, X, Loader2, Trash2 } from "lucide-react";
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
  imagem: z.string().optional(),
  parcelas: z.coerce.number().int().min(1, "Mínimo 1 parcela").max(48, "Máximo 48 parcelas"),
  freteGratis: z.boolean(),
  avaliacao: z.coerce.number().min(0, "Mínimo 0").max(5, "Máximo 5"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
});

type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/editar-produto/$id")({
  head: () => ({
    meta: [{ title: "Editar Produto | Lunar Produtos" }],
  }),
  component: EditarProduto,
});

function EditarProduto() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      categoria: "",
      preco: 0,
      precoAntigo: "",
      imagem: "",
      parcelas: 1,
      freteGratis: false,
      avaliacao: 5,
      descricao: "",
    },
  });

  useEffect(() => {
    async function carregarProduto() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErro("Produto não encontrado");
        setCarregando(false);
        return;
      }

      if (data.criado_por !== user?.id) {
        setErro("Você não tem permissão para editar este produto");
        setCarregando(false);
        return;
      }

      form.reset({
        nome: data.nome,
        categoria: data.categoria,
        preco: data.preco,
        precoAntigo: data.preco_antigo || "",
        imagem: data.imagem || "",
        parcelas: data.parcelas,
        freteGratis: data.frete_gratis,
        avaliacao: data.avaliacao,
        descricao: data.descricao,
      });

      if (data.imagem) {
        setImagemPreview(data.imagem);
      }

      setCarregando(false);
    }

    if (user) {
      carregarProduto();
    }
  }, [id, user, form]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagemPreview(base64);
      form.setValue("imagem", base64);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagemPreview(null);
    form.setValue("imagem", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function excluirProduto() {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    setExcluindo(true);
    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) {
      setErro(error.message);
      setExcluindo(false);
      return;
    }

    navigate({ to: "/" });
  }

  async function onSubmit(data: FormData) {
    if (!user) return;
    setErro("");

    const { error } = await supabase
      .from("produtos")
      .update({
        nome: data.nome,
        categoria: data.categoria,
        preco: data.preco,
        preco_antigo: data.precoAntigo && data.precoAntigo > 0 ? data.precoAntigo : null,
        imagem: data.imagem || "",
        parcelas: data.parcelas,
        frete_gratis: data.freteGratis,
        avaliacao: data.avaliacao,
        descricao: data.descricao,
      })
      .eq("id", id);

    if (error) {
      setErro(error.message);
      return;
    }

    setSalvo(true);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Faça login para editar produtos.
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

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando produto...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Erro</h1>
            <p className="mt-2 text-sm text-muted-foreground">{erro}</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
            >
              Voltar à loja
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (salvo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Save className="h-8 w-8 text-success" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-foreground">
              Produto atualizado com sucesso!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              As alterações foram salvas no banco de dados.
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
                  setSalvo(false);
                  navigate({ to: "/" });
                }}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Voltar
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
            <h1 className="text-xl font-semibold text-foreground">Editar Produto</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize os dados do produto.
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                name="imagem"
                render={() => (
                  <FormItem>
                    <FormLabel>Imagem do produto</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {imagemPreview ? (
                          <div className="relative inline-block">
                            <img
                              src={imagemPreview}
                              alt="Preview"
                              className="h-40 w-40 rounded-lg border border-border object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-gold/50 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-xs text-muted-foreground">
                              Clique para enviar
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Envie uma imagem do produto (JPG, PNG, etc.)
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

              <div className="flex items-center justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={excluirProduto}
                  disabled={excluindo}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {excluindo ? "Excluindo..." : "Excluir produto"}
                </Button>
                <div className="flex items-center gap-3">
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
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
