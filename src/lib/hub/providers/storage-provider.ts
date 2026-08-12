export type StorageObjectMetadata = {
  organizationId: string;
  key: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  sha256: string | null;
  uploadedBy: string | null;
  uploadedAt: string;
};

export type UploadStorageObjectInput = {
  organizationId: string;
  key: string;
  fileName: string;
  contentType: string;
  bytes: Uint8Array<ArrayBufferLike> | File;
  uploadedBy: string;
};

export type UploadedStorageObject = {
  key: string;
  sizeBytes: number | null;
  sha256: string | null;
};

export interface StorageProvider {
  upload(input: UploadStorageObjectInput): Promise<UploadedStorageObject>;
  getAuthorizedUrl(input: {
    organizationId: string;
    key: string;
    expiresInSeconds: number;
  }): Promise<string>;
  exists(input: { organizationId: string; key: string }): Promise<boolean>;
  readMetadata(input: {
    organizationId: string;
    key: string;
  }): Promise<StorageObjectMetadata | null>;
  delete(input: {
    organizationId: string;
    key: string;
    reason: string;
  }): Promise<void>;
}
