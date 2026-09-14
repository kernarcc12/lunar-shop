import { supabase } from "./supabase";

const BUCKET = "images";

const RESIZE_MAP: Record<UploadFolder, { width: number; height: number } | null> = {
  flyers: { width: 1080, height: 2005 },
  slides: { width: 1920, height: 720 },
  produtos: { width: 1024, height: 1024 },
};

function isBase64(value: string): boolean {
  return value.startsWith("data:");
}

function getExtensionFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+)/);
  if (match) {
    const ext = match[1].toLowerCase();
    return ext === "jpeg" ? "jpg" : ext;
  }
  return "png";
}

function getContentType(dataUrl: string): string {
  const match = dataUrl.match(/^data:(image\/\w+);/);
  return match ? match[1] : "image/png";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function resizeImage(
  dataUrl: string,
  targetW: number,
  targetH: number,
): Promise<Blob> {
  const img = await loadImage(dataUrl);

  const srcRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = targetW / targetH;

  let sx: number, sy: number, sw: number, sh: number;

  if (srcRatio > targetRatio) {
    sh = img.naturalHeight;
    sw = sh * targetRatio;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/webp", 0.9);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const byteString = atob(parts[1]!);
  const mimeString = getContentType(dataUrl);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export type UploadFolder = "produtos" | "slides" | "flyers";

export async function uploadImage(
  folder: UploadFolder,
  imageData: string,
): Promise<string> {
  if (!isBase64(imageData)) {
    return imageData;
  }

  const resize = RESIZE_MAP[folder];
  const blob = resize
    ? await resizeImage(imageData, resize.width, resize.height)
    : dataUrlToBlob(imageData);

  const ext = resize ? "webp" : getExtensionFromDataUrl(imageData);
  const filename = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, { contentType: "image/webp" });

  if (error) {
    throw new Error(`Erro ao enviar imagem: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
