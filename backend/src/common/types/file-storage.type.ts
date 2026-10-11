export abstract class FileStorage {
  abstract save(ownerId: string, content: Buffer): Promise<void>;
  abstract read(ownerId: string): Promise<Buffer | null>;
  abstract remove(ownerId: string): Promise<void>;
}
