import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  Upload,
  X,
  Eye,
  EyeOff,
  Save,
  ImagePlus,
  Film,
  Image,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const flyerSchema = z.object({
  titulo: z.string().optional(),
  descricao: z.string().optional(),
  imagem: z.string().min(1, "Imagem é obrigatória"),
  link: z.string().optional(),
  tipo: z.enum(["estatico", "animado"]),
  ativo: z.boolean(),
  ordem: z.coerce.number().int().min(0),
});

type FlyerFormData = z.infer<typeof flyerSchema>;

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

export const Route = createFileRoute("/admin/flyers")({
  head: () => ({
    meta: [{ title: "Gerenciar Flyers | Admin Lunar" }],
  }),
  component: AdminFlyers,
});

function AdminFlyers() {
  const { user, isAdmin } = useAuth();
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlyer, setEditingFlyer] = useState<Flyer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
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

    if (error) {
      setErro(error.message);
    } else {
      setFlyers(data || []);
    }
    setLoading(false);
  }

  function openNewForm() {
    setEditingFlyer(null);
    setImagemPreview(null);
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
    if (isAnimated) {
      form.setValue("tipo", "animado");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagemPreview(base64);
      form.setValue("imagem", base64);
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
    form.setValue("imagem", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(data: FlyerFormData) {
    setErro("");
    setSucesso("");

    const flyerData = {
      titulo: data.titulo || "",
      descricao: data.descricao || "",
      imagem: data.imagem,
      link: data.link || "",
      tipo: data.tipo,
      ativo: data.ativo,
      ordem: data.ordem,
    };

    if (editingFlyer) {
      const { error } = await supabase
        .from("flyers")
        .update(flyerData)
        .eq("id", editingFlyer.id);

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
    form.reset();
    fetchFlyers();
  }

  async function deleteFlyer(id: string) {
    if (!confirm("Tem certeza que deseja excluir este flyer?")) return;

    const { error } = await supabase.from("flyers").delete().eq("id", id);

    if (error) {
      setErro(error.message);
    } else {
      setSucesso("Flyer excluído com sucesso!");
      fetchFlyers();
    }
  }

  async function toggleAtivo(flyer: Flyer) {
    const { error } = await supabase
      .from("flyers")
      .update({ ativo: !flyer.ativo })
      .eq("id", flyer.id);

    if (error) {
      setErro(error.message);
    } else {
      fetchFlyers();
    }
  }

  async function moveOrdem(flyer: Flyer, direction: "up" | "down") {
    const idx = flyers.findIndex((f) => f.id === flyer.id);
    if (direction === "up" && idx > 0) {
      const prev = flyers[idx - 1]!;
      await supabase
        .from("flyers")
        .update({ ordem: prev.ordem })
        .eq("id", flyer.id);
      await supabase
        .from("flyers")
        .update({ ordem: flyer.ordem })
        .eq("id", prev.id);
    } else if (direction === "down" && idx < flyers.length - 1) {
      const next = flyers[idx + 1]!;
      await supabase
        .from("flyers")
        .update({ ordem: next.ordem })
        .eq("id", flyer.id);
      await supabase
        .from("flyers")
        .update({ ordem: flyer.ordem })
        .eq("id", next.id);
    }
    fetchFlyers();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Faça login como administrador para gerenciar flyers.
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
              Apenas administradores podem gerenciar flyers.
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </Link>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Gerenciar Flyers</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre flyers estáticos e animados para a página de ofertas.
              </p>
            </div>
            <Button
              onClick={openNewForm}
              className="bg-brand text-gold hover:bg-brand-soft"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo flyer
            </Button>
          </div>

          {erro && (
            <div className="mx-6 mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="mx-6 mt-4 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
              {sucesso}
            </div>
          )}

          {showForm && (
            <div className="border-b border-border p-6">
              <h2 className="mb-4 text-lg font-medium text-foreground">
                {editingFlyer ? "Editar Flyer" : "Novo Flyer"}
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
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
                          <FormDescription>Para onde o flyer redireciona</FormDescription>
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
                          <Textarea
                            placeholder="Descrição curta do flyer..."
                            rows={2}
                            {...field}
                          />
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
                                {form.getValues("tipo") === "animado" ? (
                                  <img
                                    src={imagemPreview}
                                    alt="Preview"
                                    className="h-48 w-80 rounded-lg border border-border object-cover"
                                  />
                                ) : (
                                  <img
                                    src={imagemPreview}
                                    alt="Preview"
                                    className="h-48 w-80 rounded-lg border border-border object-cover"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={removeImage}
                                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="mt-2 flex items-center gap-2">
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
                                className={`flex h-48 w-80 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                                  isDragging
                                    ? "border-gold bg-gold/5"
                                    : "border-border hover:border-gold/50"
                                }`}
                              >
                                <ImagePlus className="h-10 w-10 text-muted-foreground" />
                                <p className="mt-2 text-sm font-medium text-muted-foreground">
                                  Arraste ou clique para enviar
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                  JPG, PNG, GIF, WebP ou SVG
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                  GIFs e WebP animados são detectados automaticamente
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
                          Imagem do flyer (recomendado: 1200x600px). GIFs e WebP animados são detectados automaticamente como animados.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
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
                          <FormDescription>
                            Estático (JPG, PNG) ou Animado (GIF, WebP)
                          </FormDescription>
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

                  <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
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
                    <Button type="submit" className="bg-brand text-gold hover:bg-brand-soft">
                      <Save className="mr-2 h-4 w-4" />
                      {editingFlyer ? "Salvar alterações" : "Criar flyer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando flyers...</div>
          ) : flyers.length === 0 ? (
            <div className="p-10 text-center">
              <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Nenhum flyer cadastrado.</p>
              <p className="text-sm text-muted-foreground/70">
                Clique em "Novo flyer" para criar o primeiro.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {flyers.map((flyer, idx) => (
                <div
                  key={flyer.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-col gap-1">
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
                    <div className="relative h-16 w-32 overflow-hidden rounded border border-border">
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
                    <div className="flex h-16 w-32 items-center justify-center rounded border border-border text-xs text-muted-foreground">
                      Sem imagem
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {flyer.titulo || "Sem título"}
                      </p>
                      {!flyer.ativo && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Inativo
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          flyer.tipo === "animado"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {flyer.tipo === "animado" ? "Animado" : "Estático"}
                      </span>
                    </div>
                    {flyer.descricao && (
                      <p className="text-sm text-muted-foreground truncate">{flyer.descricao}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70">Ordem: {flyer.ordem}</p>
                  </div>

                  <div className="flex items-center gap-2">
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
