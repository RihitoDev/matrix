export interface SaveFileHandle {
  createWritable: () => Promise<Pick<FileSystemWritableFileStream, "write" | "close" | "abort">>;
}

export type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: { description: string; accept: Record<string, string[]> }[];
    excludeAcceptAllOption: boolean;
  }) => Promise<SaveFileHandle>;
};
