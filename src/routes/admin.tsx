import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  GripVertical,
  X,
  Eye,
  EyeOff,
  Save,
  ImagePlus,
  Film,
  Image,
  PackagePlus,
  LayoutPanelLeft,
  LayoutDashboard,
  LogOut,
  Upload,
  ChevronLeft,
  Menu,
  Users,
  ShoppingBag,
  BarChart3,
  User,
} from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categorias } from "@/data/products";

const slideSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  subtitulo: z.string().optional(),
  descricao: z.string().optional(),
  imagem: z.string().optional(),
  link: z.string().optional(),
  texto_botao: z.string().optional(),
  cor_fundo: z.string().min(1, "Cor de fundo é obrigatória"),
  cor_texto: z.string().min(1, "Cor do texto é obrigatória"),
  ativo: z.boolean(),
  ordem: z.coerce.number().int().min(0),
});

const flyerSchema = z.object({
  titulo: z.string().optional(),
  descricao: z.string().optional(),
  imagem: z.string().min(1, "Imagem é obrigatória"),
  link: z.string().optional(),
  tipo: z.enum(["estatico", "animado"]),
  ativo: z.boolean(),
  ordem: z.coerce.number().int().min(0),
});

const produtoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  preco: z.coerce.number().positive("Preço deve ser maior que zero"),
  precoAntigo: z.coerce
    .number()
    .positive("Preço antigo deve ser maior que zero")
    .optional()
    .or(z.literal("")),
  imagem: z.string().optional(),
  parcelas: z.coerce.number().int().min(1, "Mínimo 1 parcela").max(48, "Máximo 48 parcelas"),
  freteGratis: z.boolean(),
  avaliacao: z.coerce.number().min(0, "Mínimo 0").max(5, "Máximo 5"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
});

type SlideFormData = z.infer<typeof slideSchema>;
type FlyerFormData = z.infer<typeof flyerSchema>;
type ProdutoFormData = z.infer<typeof produtoSchema>;

type Slide = {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  imagem: string;
  link: string;
  texto_botao: string;
  cor_fundo: string;
  cor_texto: string;
  ativo: boolean;
  ordem: number;
  criado_em: string;
};

type Flyer = {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  link: string;
  tipo: "estatico" | "animado";
  ativo: boolean;
  ordem: number;
  criado_em: string;
};

type Produto = {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  preco_antigo: number | null;
  imagem: string;
  parcelas: number;
  frete_gratis: boolean;
  avaliacao: number;
  vendidos: number;
  descricao: string;
  criado_por: string;
  criado_em: string;
};

type AdminSection = "dashboard" | "produtos" | "slides" | "flyers";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel Administrativo | Lunar" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Faça login como administrador para acessar o painel.
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Sem permissão</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Apenas administradores podem acessar esta área.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-brand-soft"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à loja
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const navItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "produtos", label: "Produtos", icon: ShoppingBag },
    { id: "slides", label: "Slides", icon: LayoutPanelLeft },
    { id: "flyers", label: "Flyers", icon: Image },
  ];

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-navy-light bg-navy-deep text-white shadow-lg">
        <div className="flex h-16 items-center px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3 rounded-lg p-2 hover:bg-navy lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold">
              <span className="text-xl font-bold text-navy-deep">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wider text-white">LUNAR</span>
              <span className="text-[10px] tracking-widest text-gold/80">ADMIN</span>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-navy hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Ver loja</span>
            </Link>
            <div className="hidden h-6 w-px bg-white/20 sm:block" />
            <span className="hidden text-sm text-white/60 sm:inline">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-white/70 transition-colors hover:bg-navy hover:text-gold"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-16 bottom-0 z-40 w-64 border-r border-navy-light bg-navy-deep transition-transform lg:sticky lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-gold text-navy-deep shadow-md"
                      : "text-white/70 hover:bg-navy hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-navy-light p-4">
            <div className="rounded-xl bg-navy p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
                  <User className="h-5 w-5 text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{user.email}</p>
                  <p className="text-xs text-gold/80">Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {section === "dashboard" && <DashboardSection />}
          {section === "produtos" && <ProdutosSection />}
          {section === "slides" && <SlidesSection />}
          {section === "flyers" && <FlyersSection />}
        </main>
      </div>
    </div>
  );
}

function DashboardSection() {
  const [stats, setStats] = useState({ produtos: 0, slides: 0, flyers: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [p, s, f] = await Promise.all([
        supabase.from("produtos").select("id", { count: "exact", head: true }),
        supabase.from("slides").select("id", { count: "exact", head: true }),
        supabase.from("flyers").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        produtos: p.count || 0,
        slides: s.count || 0,
        flyers: f.count || 0,
      });
    }
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Produtos",
      value: stats.produtos,
      icon: ShoppingBag,
      color: "bg-navy text-gold",
      bgLight: "bg-navy/10",
    },
    {
      label: "Slides",
      value: stats.slides,
      icon: LayoutPanelLeft,
      color: "bg-gold text-navy-deep",
      bgLight: "bg-gold/10",
    },
    {
      label: "Flyers",
      value: stats.flyers,
      icon: Image,
      color: "bg-navy-deep text-gold",
      bgLight: "bg-navy-deep/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-navy-deep">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">Visao geral da loja</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-navy/5 transition-transform group-hover:scale-150" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                    <p className="mt-2 text-4xl font-bold text-navy-deep">{c.value}</p>
                  </div>
                  <div className={`rounded-2xl p-4 ${c.color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-lg font-semibold text-navy-deep">Acoes Rapidas</h3>
          <div className="mt-4 space-y-3">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("admin-navigate", { detail: "produtos" }));
              }}
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-gold hover:bg-gold/5"
            >
              <div className="rounded-xl bg-navy/10 p-3">
                <ShoppingBag className="h-5 w-5 text-navy" />
              </div>
              <div>
                <p className="font-medium text-navy-deep">Gerenciar Produtos</p>
                <p className="text-xs text-muted-foreground">
                  Adicionar, editar ou remover produtos
                </p>
              </div>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("admin-navigate", { detail: "slides" }));
              }}
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-gold hover:bg-gold/5"
            >
              <div className="rounded-xl bg-gold/10 p-3">
                <LayoutPanelLeft className="h-5 w-5 text-gold-deep" />
              </div>
              <div>
                <p className="font-medium text-navy-deep">Gerenciar Slides</p>
                <p className="text-xs text-muted-foreground">Configurar o slideshow da home</p>
              </div>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("admin-navigate", { detail: "flyers" }));
              }}
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-gold hover:bg-gold/5"
            >
              <div className="rounded-xl bg-navy-deep/10 p-3">
                <Image className="h-5 w-5 text-navy-deep" />
              </div>
              <div>
                <p className="font-medium text-navy-deep">Gerenciar Flyers</p>
                <p className="text-xs text-muted-foreground">
                  Criar e gerenciar flyers promocionais
                </p>
              </div>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="text-lg font-semibold text-navy-deep">Resumo</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Total de itens</span>
              <span className="font-semibold text-navy-deep">
                {stats.produtos + stats.slides + stats.flyers}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Produtos ativos</span>
              <span className="font-semibold text-navy-deep">{stats.produtos}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">Slides configurados</span>
              <span className="font-semibold text-navy-deep">{stats.slides}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Flyers publicados</span>
              <span className="font-semibold text-navy-deep">{stats.flyers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProdutosSection() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
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
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      setErro(error.message);
    } else {
      setProdutos(data || []);
    }
    setLoading(false);
  }

  function openNewForm() {
    setEditingProduto(null);
    setImagemPreview(null);
    setImagemFile(null);
    form.reset({
      nome: "",
      categoria: "",
      preco: 0,
      precoAntigo: "",
      imagem: "",
      parcelas: 1,
      freteGratis: false,
      avaliacao: 5,
      descricao: "",
    });
    setShowForm(true);
    setErro("");
    setSucesso("");
  }

  function openEditForm(produto: Produto) {
    setEditingProduto(produto);
    setImagemPreview(produto.imagem || null);
    setImagemFile(null);
    form.reset({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      precoAntigo: produto.preco_antigo || "",
      imagem: produto.imagem || "",
      parcelas: produto.parcelas,
      freteGratis: produto.frete_gratis,
      avaliacao: produto.avaliacao,
      descricao: produto.descricao,
    });
    setShowForm(true);
    setErro("");
    setSucesso("");
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido");
      return;
    }
    setImagemFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagemPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagemPreview(null);
    setImagemFile(null);
    form.setValue("imagem", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: ProdutoFormData) {
    setErro("");
    setSucesso("");

    let imagemUrl = "";
    if (imagemFile) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imagemFile);
        });
        imagemUrl = await uploadImage("produtos", dataUrl);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao enviar imagem");
        return;
      }
    } else if (imagemPreview) {
      imagemUrl = imagemPreview;
    }

    const produtoData = {
      nome: data.nome,
      categoria: data.categoria,
      preco: data.preco,
      preco_antigo: data.precoAntigo && data.precoAntigo > 0 ? data.precoAntigo : null,
      imagem: imagemUrl,
      parcelas: data.parcelas,
      frete_gratis: data.freteGratis,
      avaliacao: data.avaliacao,
      descricao: data.descricao,
    };

    if (editingProduto) {
      const { error } = await supabase
        .from("produtos")
        .update(produtoData)
        .eq("id", editingProduto.id);
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Produto atualizado com sucesso!");
    } else {
      const { error } = await supabase
        .from("produtos")
        .insert({ ...produtoData, vendidos: 0, criado_por: user?.id });
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Produto criado com sucesso!");
    }

    setShowForm(false);
    setEditingProduto(null);
    setImagemPreview(null);
    setImagemFile(null);
    form.reset();
    fetchProdutos();
  }

  async function deleteProduto(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) {
      setErro(error.message);
    } else {
      setSucesso("Produto excluído com sucesso!");
      fetchProdutos();
    }
  }

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Produtos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie os produtos da loja.</p>
        </div>
        <Button onClick={openNewForm} className="bg-navy text-gold hover:bg-navy-deep">
          <Plus className="mr-2 h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {erro && (
        <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="mb-4 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
          {sucesso}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium text-foreground">
            {editingProduto ? "Editar Produto" : "Novo Produto"}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
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
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step={0.01} min={0} {...field} />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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
                        <FormDescription>Entrega gratuita</FormDescription>
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
                            <p className="mt-2 text-xs text-muted-foreground">Clique para enviar</p>
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
                      <Textarea placeholder="Descreva o produto..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduto(null);
                    setImagemPreview(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-navy text-gold hover:bg-navy-deep">
                  <Save className="mr-2 h-4 w-4" />
                  {editingProduto ? "Salvar" : "Criar produto"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          Carregando produtos...
        </div>
      ) : produtos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produto</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Preço</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {produtos.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imagem ? (
                          <img
                            src={p.imagem}
                            alt={p.nome}
                            className="h-10 w-10 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-xs text-muted-foreground">
                            <PackagePlus className="h-4 w-4" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{p.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.categoria}</td>
                    <td className="px-4 py-3 text-foreground">{brl(p.preco)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(p)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteProduto(p.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SlidesSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SlideFormData>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      titulo: "",
      subtitulo: "",
      descricao: "",
      imagem: "",
      link: "",
      texto_botao: "",
      cor_fundo: "#0B1120",
      cor_texto: "#ffffff",
      ativo: true,
      ordem: 0,
    },
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    setLoading(true);
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) setErro(error.message);
    else setSlides(data || []);
    setLoading(false);
  }

  function openNewForm() {
    setEditingSlide(null);
    setImagemPreview(null);
    setImagemFile(null);
    form.reset({
      titulo: "",
      subtitulo: "",
      descricao: "",
      imagem: "",
      link: "",
      texto_botao: "",
      cor_fundo: "#0B1120",
      cor_texto: "#ffffff",
      ativo: true,
      ordem: slides.length,
    });
    setShowForm(true);
    setErro("");
    setSucesso("");
  }

  function openEditForm(slide: Slide) {
    setEditingSlide(slide);
    setImagemPreview(slide.imagem || null);
    setImagemFile(null);
    form.reset({
      titulo: slide.titulo,
      subtitulo: slide.subtitulo || "",
      descricao: slide.descricao || "",
      imagem: slide.imagem || "",
      link: slide.link || "",
      texto_botao: slide.texto_botao || "",
      cor_fundo: slide.cor_fundo,
      cor_texto: slide.cor_texto,
      ativo: slide.ativo,
      ordem: slide.ordem,
    });
    setShowForm(true);
    setErro("");
    setSucesso("");
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem válido");
      return;
    }
    setImagemFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagemPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagemPreview(null);
    setImagemFile(null);
    form.setValue("imagem", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: SlideFormData) {
    setErro("");
    setSucesso("");

    let imagemUrl = "";
    if (imagemFile) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imagemFile);
        });
        imagemUrl = await uploadImage("slides", dataUrl);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao enviar imagem");
        return;
      }
    } else if (imagemPreview) {
      imagemUrl = imagemPreview;
    }

    const slideData = {
      titulo: data.titulo,
      subtitulo: data.subtitulo || "",
      descricao: data.descricao || "",
      imagem: imagemUrl,
      link: data.link || "",
      texto_botao: data.texto_botao || "",
      cor_fundo: data.cor_fundo,
      cor_texto: data.cor_texto,
      ativo: data.ativo,
      ordem: data.ordem,
    };
    if (editingSlide) {
      const { error } = await supabase.from("slides").update(slideData).eq("id", editingSlide.id);
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Slide atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("slides").insert(slideData);
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Slide criado com sucesso!");
    }
    setShowForm(false);
    setEditingSlide(null);
    setImagemPreview(null);
    setImagemFile(null);
    form.reset();
    fetchSlides();
  }

  async function deleteSlide(id: string) {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;
    const { error } = await supabase.from("slides").delete().eq("id", id);
    if (error) setErro(error.message);
    else {
      setSucesso("Slide excluído com sucesso!");
      fetchSlides();
    }
  }

  async function toggleAtivo(slide: Slide) {
    const { error } = await supabase
      .from("slides")
      .update({ ativo: !slide.ativo })
      .eq("id", slide.id);
    if (error) setErro(error.message);
    else fetchSlides();
  }

  async function moveOrdem(slide: Slide, direction: "up" | "down") {
    const idx = slides.findIndex((s) => s.id === slide.id);
    if (direction === "up" && idx > 0) {
      const prev = slides[idx - 1]!;
      await supabase.from("slides").update({ ordem: prev.ordem }).eq("id", slide.id);
      await supabase.from("slides").update({ ordem: slide.ordem }).eq("id", prev.id);
    } else if (direction === "down" && idx < slides.length - 1) {
      const next = slides[idx + 1]!;
      await supabase.from("slides").update({ ordem: next.ordem }).eq("id", slide.id);
      await supabase.from("slides").update({ ordem: slide.ordem }).eq("id", next.id);
    }
    fetchSlides();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Slides</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure os slides do slideshow da página inicial.
          </p>
        </div>
        <Button onClick={openNewForm} className="bg-navy text-gold hover:bg-navy-deep">
          <Plus className="mr-2 h-4 w-4" />
          Novo slide
        </Button>
      </div>

      {erro && (
        <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="mb-4 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
          {sucesso}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium text-foreground">
            {editingSlide ? "Editar Slide" : "Novo Slide"}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ofertas de Verão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtítulo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Até 50% OFF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição curta..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input placeholder="/carrinho ou https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="texto_botao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto do botão</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ver ofertas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imagem"
                render={() => (
                  <FormItem>
                    <FormLabel>Imagem do slide</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {imagemPreview ? (
                          <div className="relative inline-block">
                            <img
                              src={imagemPreview}
                              alt="Preview"
                              className="h-40 w-80 rounded-lg border border-border object-cover"
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
                            className="flex h-40 w-80 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-gold/50 transition-colors"
                          >
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-xs text-muted-foreground">
                              Clique para enviar uma imagem
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
                    <FormDescription>Recomendado: 1200x400px</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cor_fundo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de fundo</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.value}
                            onChange={field.onChange}
                            className="h-10 w-10 cursor-pointer rounded border border-border"
                          />
                          <Input {...field} className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cor_texto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor do texto</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.value}
                            onChange={field.onChange}
                            className="h-10 w-10 cursor-pointer rounded border border-border"
                          />
                          <Input {...field} className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ordem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordem</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>Slide visível no slideshow</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSlide(null);
                    setImagemPreview(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-navy text-gold hover:bg-navy-deep">
                  <Save className="mr-2 h-4 w-4" />
                  {editingSlide ? "Salvar" : "Criar slide"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          Carregando slides...
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <LayoutPanelLeft className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Nenhum slide cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/30 sm:px-6"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveOrdem(slide, "up")}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => moveOrdem(slide, "down")}
                    disabled={idx === slides.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>

                {slide.imagem ? (
                  <img
                    src={slide.imagem}
                    alt={slide.titulo}
                    className="h-14 w-28 shrink-0 rounded border border-border object-cover"
                  />
                ) : (
                  <div
                    className="flex h-14 w-28 shrink-0 items-center justify-center rounded border border-border text-xs text-muted-foreground"
                    style={{ backgroundColor: slide.cor_fundo, color: slide.cor_texto }}
                  >
                    Sem imagem
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">{slide.titulo}</p>
                    {!slide.ativo && (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Inativo
                      </span>
                    )}
                  </div>
                  {slide.subtitulo && (
                    <p className="truncate text-sm text-muted-foreground">{slide.subtitulo}</p>
                  )}
                  <p className="text-xs text-muted-foreground/70">Ordem: {slide.ordem}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleAtivo(slide)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title={slide.ativo ? "Desativar" : "Ativar"}
                  >
                    {slide.ativo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(slide)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlyersSection() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlyer, setEditingFlyer] = useState<Flyer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FlyerFormData>({
    resolver: zodResolver(flyerSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      imagem: "",
      link: "",
      tipo: "estatico",
      ativo: true,
      ordem: 0,
    },
  });

  useEffect(() => {
    fetchFlyers();
  }, []);

  async function fetchFlyers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("flyers")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) setErro(error.message);
    else setFlyers(data || []);
    setLoading(false);
  }

  function openNewForm() {
    setEditingFlyer(null);
    setImagemPreview(null);
    setImagemFile(null);
    form.reset({
      titulo: "",
      descricao: "",
      imagem: "",
      link: "",
      tipo: "estatico",
      ativo: true,
      ordem: flyers.length,
    });
    setShowForm(true);
    setErro("");
    setSucesso("");
  }

  function openEditForm(flyer: Flyer) {
    setEditingFlyer(flyer);
    setImagemPreview(flyer.imagem || null);
    setImagemFile(null);
    form.reset({
      titulo: flyer.titulo || "",
      descricao: flyer.descricao || "",
      imagem: flyer.imagem || "",
      link: flyer.link || "",
      tipo: flyer.tipo,
      ativo: flyer.ativo,
      ordem: flyer.ordem,
    });
    setShowForm(true);
    setErro("");
    setSucesso("");
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setErro("Selecione um arquivo de imagem válido (JPG, PNG, GIF, WebP, SVG)");
      return;
    }
    const isAnimated = file.type === "image/gif" || file.type === "image/webp";
    if (isAnimated) form.setValue("tipo", "animado");
    setImagemFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagemPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      const event = new Event("change", { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  }

  function removeImage() {
    setImagemPreview(null);
    setImagemFile(null);
    form.setValue("imagem", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: FlyerFormData) {
    setErro("");
    setSucesso("");

    let imagemUrl = "";
    if (imagemFile) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imagemFile);
        });
        imagemUrl = await uploadImage("flyers", dataUrl);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao enviar imagem");
        return;
      }
    } else if (imagemPreview) {
      imagemUrl = imagemPreview;
    }

    const flyerData = {
      titulo: data.titulo || "",
      descricao: data.descricao || "",
      imagem: imagemUrl,
      link: data.link || "",
      tipo: data.tipo,
      ativo: data.ativo,
      ordem: data.ordem,
    };
    if (editingFlyer) {
      const { error } = await supabase.from("flyers").update(flyerData).eq("id", editingFlyer.id);
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Flyer atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("flyers").insert(flyerData);
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Flyer criado com sucesso!");
    }
    setShowForm(false);
    setEditingFlyer(null);
    setImagemPreview(null);
    setImagemFile(null);
    form.reset();
    fetchFlyers();
  }

  async function deleteFlyer(id: string) {
    if (!confirm("Tem certeza que deseja excluir este flyer?")) return;
    const { error } = await supabase.from("flyers").delete().eq("id", id);
    if (error) setErro(error.message);
    else {
      setSucesso("Flyer excluído com sucesso!");
      fetchFlyers();
    }
  }

  async function toggleAtivo(flyer: Flyer) {
    const { error } = await supabase
      .from("flyers")
      .update({ ativo: !flyer.ativo })
      .eq("id", flyer.id);
    if (error) setErro(error.message);
    else fetchFlyers();
  }

  async function moveOrdem(flyer: Flyer, direction: "up" | "down") {
    const idx = flyers.findIndex((f) => f.id === flyer.id);
    if (direction === "up" && idx > 0) {
      const prev = flyers[idx - 1]!;
      await supabase.from("flyers").update({ ordem: prev.ordem }).eq("id", flyer.id);
      await supabase.from("flyers").update({ ordem: flyer.ordem }).eq("id", prev.id);
    } else if (direction === "down" && idx < flyers.length - 1) {
      const next = flyers[idx + 1]!;
      await supabase.from("flyers").update({ ordem: next.ordem }).eq("id", flyer.id);
      await supabase.from("flyers").update({ ordem: flyer.ordem }).eq("id", next.id);
    }
    fetchFlyers();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Flyers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre flyers estáticos e animados para a página de ofertas.
          </p>
        </div>
        <Button onClick={openNewForm} className="bg-navy text-gold hover:bg-navy-deep">
          <Plus className="mr-2 h-4 w-4" />
          Novo flyer
        </Button>
      </div>

      {erro && (
        <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="mb-4 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
          {sucesso}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-medium text-foreground">
            {editingFlyer ? "Editar Flyer" : "Novo Flyer"}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ofertas de Verão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="/carrinho ou https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição curta..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imagem"
                render={() => (
                  <FormItem>
                    <FormLabel>Imagem do flyer *</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {imagemPreview ? (
                          <div className="relative inline-block">
                            <img
                              src={imagemPreview}
                              alt="Preview"
                              className="w-full max-w-[220px] aspect-[9/16] rounded-lg border border-border object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="mt-2">
                              {form.getValues("tipo") === "animado" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                  <Film className="h-3 w-3" /> Animado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  <Image className="h-3 w-3" /> Estático
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex w-full max-w-[220px] aspect-[9/16] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                              isDragging
                                ? "border-gold bg-gold/5"
                                : "border-border hover:border-gold/50"
                            }`}
                          >
                            <ImagePlus className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm font-medium text-muted-foreground">
                              Arraste ou clique para enviar
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              JPG, PNG, GIF, WebP ou SVG
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Recomendado: 1080x1920px (formato vertical). GIFs e WebP animados são
                      detectados automaticamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="estatico">
                              <span className="flex items-center gap-2">
                                <Image className="h-4 w-4" /> Estático
                              </span>
                            </SelectItem>
                            <SelectItem value="animado">
                              <span className="flex items-center gap-2">
                                <Film className="h-4 w-4" /> Animado
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ordem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordem</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>Flyer visível na galeria</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFlyer(null);
                    setImagemPreview(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-navy text-gold hover:bg-navy-deep">
                  <Save className="mr-2 h-4 w-4" />
                  {editingFlyer ? "Salvar" : "Criar flyer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          Carregando flyers...
        </div>
      ) : flyers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Nenhum flyer cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {flyers.map((flyer, idx) => (
              <div
                key={flyer.id}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/30 sm:px-6"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveOrdem(flyer, "up")}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => moveOrdem(flyer, "down")}
                    disabled={idx === flyers.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>

                {flyer.imagem ? (
                  <div className="relative h-14 w-28 shrink-0 overflow-hidden rounded border border-border">
                    <img
                      src={flyer.imagem}
                      alt={flyer.titulo || "Flyer"}
                      className="h-full w-full object-cover"
                    />
                    {flyer.tipo === "animado" && (
                      <div className="absolute top-0.5 right-0.5 rounded bg-purple-500 p-0.5">
                        <Film className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-14 w-28 shrink-0 items-center justify-center rounded border border-border text-xs text-muted-foreground">
                    Sem imagem
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {flyer.titulo || "Sem título"}
                    </p>
                    {!flyer.ativo && (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Inativo
                      </span>
                    )}
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        flyer.tipo === "animado"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {flyer.tipo === "animado" ? "Animado" : "Estático"}
                    </span>
                  </div>
                  {flyer.descricao && (
                    <p className="truncate text-sm text-muted-foreground">{flyer.descricao}</p>
                  )}
                  <p className="text-xs text-muted-foreground/70">Ordem: {flyer.ordem}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleAtivo(flyer)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title={flyer.ativo ? "Desativar" : "Ativar"}
                  >
                    {flyer.ativo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(flyer)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteFlyer(flyer.id)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
