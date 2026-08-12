import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HUB_DOCUMENTS_BUCKET } from "../../hub.ts";
import type { Database } from "../../supabase.ts";
import type {
  StorageObjectMetadata,
  StorageProvider,
  UploadStorageObjectInput,
} from "./storage-provider.ts";

function assertOrganizationKey(organizationId: string, key: string) {
  if (!key.startsWith(`${organizationId}/`) || key.includes("..")) {
    throw new Error("Filnyckeln ligger utanför det aktiva företagets lagringsyta.");
  }
}

async function bytesForHash(input: UploadStorageObjectInput["bytes"]) {
  if (input instanceof File) {
    return new Uint8Array(await input.arrayBuffer());
  }

  return new Uint8Array(input);
}

export async function calculateSha256(
  input: UploadStorageObjectInput["bytes"],
) {
  const bytes = await bytesForHash(input);
  return createHash("sha256").update(bytes).digest("hex");
}

export class SupabaseStorageProvider implements StorageProvider {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async upload(input: UploadStorageObjectInput) {
    assertOrganizationKey(input.organizationId, input.key);
    const bytes = await bytesForHash(input.bytes);
    const sha256 = await calculateSha256(bytes);
    const { error } = await this.supabase.storage
      .from(HUB_DOCUMENTS_BUCKET)
      .upload(input.key, bytes, {
        contentType: input.contentType,
        upsert: false,
      });

    if (error) throw error;

    return {
      key: input.key,
      sizeBytes: bytes.byteLength,
      sha256,
    };
  }

  async getAuthorizedUrl(input: {
    organizationId: string;
    key: string;
    expiresInSeconds: number;
  }) {
    assertOrganizationKey(input.organizationId, input.key);
    const { data, error } = await this.supabase.storage
      .from(HUB_DOCUMENTS_BUCKET)
      .createSignedUrl(input.key, input.expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw error ?? new Error("Kunde inte skapa en säker dokumentlänk.");
    }

    return data.signedUrl;
  }

  async exists(input: { organizationId: string; key: string }) {
    assertOrganizationKey(input.organizationId, input.key);
    const separator = input.key.lastIndexOf("/");
    const directory = input.key.slice(0, separator);
    const fileName = input.key.slice(separator + 1);
    const { data, error } = await this.supabase.storage
      .from(HUB_DOCUMENTS_BUCKET)
      .list(directory, { limit: 2, search: fileName });

    if (error) throw error;
    return (data ?? []).some((item) => item.name === fileName);
  }

  async readMetadata(input: {
    organizationId: string;
    key: string;
  }): Promise<StorageObjectMetadata | null> {
    assertOrganizationKey(input.organizationId, input.key);
    const { data, error } = await this.supabase
      .from("documents")
      .select(
        "organization_id, file_path, file_name, mime_type, size_bytes, sha256, uploaded_by, created_at",
      )
      .eq("organization_id", input.organizationId)
      .eq("file_path", input.key)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      organizationId: data.organization_id,
      key: data.file_path,
      fileName: data.file_name,
      mimeType: data.mime_type,
      sizeBytes: data.size_bytes,
      sha256: data.sha256 ?? null,
      uploadedBy: data.uploaded_by,
      uploadedAt: data.created_at,
    };
  }

  async delete(input: {
    organizationId: string;
    key: string;
    reason: string;
  }) {
    assertOrganizationKey(input.organizationId, input.key);

    if (input.reason.trim().length < 8) {
      throw new Error("En tydlig anledning krävs för att ta bort ett dokument.");
    }

    const { data: document, error: documentError } = await this.supabase
      .from("documents")
      .select("retention_locked")
      .eq("organization_id", input.organizationId)
      .eq("file_path", input.key)
      .maybeSingle();

    if (documentError) throw documentError;
    if (document?.retention_locked) {
      throw new Error("Originaldokumentet är låst och får inte tas bort.");
    }

    const { error } = await this.supabase.storage
      .from(HUB_DOCUMENTS_BUCKET)
      .remove([input.key]);

    if (error) throw error;
  }
}
