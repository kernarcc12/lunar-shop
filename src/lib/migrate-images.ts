import { supabase } from "./supabase";
import { uploadImage, type UploadFolder } from "./upload";

type MigrationResult = {
  migrated: number;
  skipped: number;
  errors: number;
};

function isBase64(value: string): boolean {
  return value.startsWith("data:");
}

async function migrateTable(
  table: string,
  folder: UploadFolder,
): Promise<MigrationResult> {
  const result: MigrationResult = { migrated: 0, skipped: 0, errors: 0 };

  const { data: rows, error: fetchError } = await supabase
    .from(table)
    .select("id, imagem");

  if (fetchError || !rows) {
    console.error(`Erro ao buscar ${table}:`, fetchError);
    return result;
  }

  for (const row of rows) {
    if (!row.imagem || !isBase64(row.imagem)) {
      result.skipped++;
      continue;
    }

    try {
      const url = await uploadImage(folder, row.imagem);
      const { error: updateError } = await supabase
        .from(table)
        .update({ imagem: url })
        .eq("id", row.id);

      if (updateError) {
        console.error(`Erro ao atualizar ${table} id=${row.id}:`, updateError);
        result.errors++;
      } else {
        result.migrated++;
      }
    } catch (err) {
      console.error(`Erro ao migrar ${table} id=${row.id}:`, err);
      result.errors++;
    }
  }

  return result;
}

export async function migrateAllImages(): Promise<{
  produtos: MigrationResult;
  slides: MigrationResult;
  flyers: MigrationResult;
}> {
  const produtos = await migrateTable("produtos", "produtos");
  const slides = await migrateTable("slides", "slides");
  const flyers = await migrateTable("flyers", "flyers");
  return { produtos, slides, flyers };
}
