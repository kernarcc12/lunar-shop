import { supabase } from "./supabase";

const BUCKET = "images";

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

  const ext = getExtensionFromDataUrl(imageData);
  const filename = `${folder}/${crypto.randomUUID()}.${ext}`;
  const blob = dataUrlToBlob(imageData);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, blob, { contentType: blob.type });

  if (error) {
    throw new Error(`Erro ao enviar imagem: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
