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

type SlideFormData = z.infer<typeof slideSchema>;

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

export const Route = createFileRoute("/admin/slides")({
  head: () => ({
    meta: [{ title: "Gerenciar Slides | Admin Lunar" }],
  }),
  component: AdminSlides,
});

function AdminSlides() {
  const { user, isAdmin } = useAuth();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
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

    if (error) {
      setErro(error.message);
    } else {
      setSlides(data || []);
    }
    setLoading(false);
  }

  function openNewForm() {
    setEditingSlide(null);
    setImagemPreview(null);
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

  async function onSubmit(data: SlideFormData) {
    setErro("");
    setSucesso("");

    const slideData = {
      titulo: data.titulo,
      subtitulo: data.subtitulo || "",
      descricao: data.descricao || "",
      imagem: data.imagem || "",
      link: data.link || "",
      texto_botao: data.texto_botao || "",
      cor_fundo: data.cor_fundo,
      cor_texto: data.cor_texto,
      ativo: data.ativo,
      ordem: data.ordem,
    };

    if (editingSlide) {
      const { error } = await supabase
        .from("slides")
        .update(slideData)
        .eq("id", editingSlide.id);

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
    form.reset();
    fetchSlides();
  }

  async function deleteSlide(id: string) {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;

    const { error } = await supabase.from("slides").delete().eq("id", id);

    if (error) {
      setErro(error.message);
    } else {
      setSucesso("Slide excluído com sucesso!");
      fetchSlides();
    }
  }

  async function toggleAtivo(slide: Slide) {
    const { error } = await supabase
      .from("slides")
      .update({ ativo: !slide.ativo })
      .eq("id", slide.id);

    if (error) {
      setErro(error.message);
    } else {
      fetchSlides();
    }
  }

  async function moveOrdem(slide: Slide, direction: "up" | "down") {
    const idx = slides.findIndex((s) => s.id === slide.id);
    if (direction === "up" && idx > 0) {
      const prev = slides[idx - 1]!;
      await supabase
        .from("slides")
        .update({ ordem: prev.ordem })
        .eq("id", slide.id);
      await supabase
        .from("slides")
        .update({ ordem: slide.ordem })
        .eq("id", prev.id);
    } else if (direction === "down" && idx < slides.length - 1) {
      const next = slides[idx + 1]!;
      await supabase
        .from("slides")
        .update({ ordem: next.ordem })
        .eq("id", slide.id);
      await supabase
        .from("slides")
        .update({ ordem: slide.ordem })
        .eq("id", next.id);
    }
    fetchSlides();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="rounded-lg border border-border bg-card p-10">
            <h1 className="text-xl font-semibold text-foreground">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Faça login como administrador para gerenciar slides.
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
              Apenas administradores podem gerenciar slides.
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
              <h1 className="text-xl font-semibold text-foreground">Gerenciar Slides</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure os slides do slideshow da página inicial.
              </p>
            </div>
            <Button
              onClick={openNewForm}
              className="bg-brand text-gold hover:bg-brand-soft"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo slide
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
                {editingSlide ? "Editar Slide" : "Novo Slide"}
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
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
                          <Textarea
                            placeholder="Descrição curta do slide..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link</FormLabel>
                          <FormControl>
                            <Input placeholder="/carrinho ou https://..." {...field} />
                          </FormControl>
                          <FormDescription>Para onde o slide redireciona</FormDescription>
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
                        <FormDescription>
                          Imagem de fundo do slide (recomendado: 1200x400px)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 sm:grid-cols-3">
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

                  <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
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
                    <Button type="submit" className="bg-brand text-gold hover:bg-brand-soft">
                      <Save className="mr-2 h-4 w-4" />
                      {editingSlide ? "Salvar alterações" : "Criar slide"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando slides...</div>
          ) : slides.length === 0 ? (
            <div className="p-10 text-center">
              <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Nenhum slide cadastrado.</p>
              <p className="text-sm text-muted-foreground/70">
                Clique em "Novo slide" para criar o primeiro.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-col gap-1">
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
                      className="h-16 w-32 rounded border border-border object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-16 w-32 items-center justify-center rounded border border-border text-xs text-muted-foreground"
                      style={{ backgroundColor: slide.cor_fundo, color: slide.cor_texto }}
                    >
                      Sem imagem
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{slide.titulo}</p>
                      {!slide.ativo && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Inativo
                        </span>
                      )}
                    </div>
                    {slide.subtitulo && (
                      <p className="text-sm text-muted-foreground truncate">{slide.subtitulo}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70">Ordem: {slide.ordem}</p>
                  </div>

                  <div className="flex items-center gap-2">
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
