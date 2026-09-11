import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
};

export function Slideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchSlides() {
      const { data } = await supabase
        .from("slides")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (data && data.length > 0) {
        setSlides(data);
      }
    }
    fetchSlides();
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current]!;

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="relative flex min-h-[260px] items-center md:min-h-[380px]"
        style={{ color: slide.cor_texto }}
      >
        {slide.imagem && (
          <div className="absolute inset-0">
            <img
              src={slide.imagem}
              alt={slide.titulo}
              className="h-full w-full object-cover scale-105"
            />
          </div>
        )}

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-4 py-10 md:px-8 md:py-16">
          <div className="max-w-lg">
            {slide.subtitulo && (
              <p className="mb-2 text-sm font-medium uppercase tracking-widest opacity-80">
                {slide.subtitulo}
              </p>
            )}
            <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">
              {slide.titulo}
            </h2>
            {slide.descricao && (
              <p className="mt-4 max-w-md text-sm opacity-80 md:text-base">
                {slide.descricao}
              </p>
            )}
            {slide.texto_botao && slide.link && (
              <a
                href={slide.link}
                className="mt-6 inline-flex items-center rounded-md bg-gold px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-gold-deep"
              >
                {slide.texto_botao}
              </a>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === current ? "w-6 bg-gold" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
