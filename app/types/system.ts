export type FileSystemNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: { [key: string]: FileSystemNode };
  permissions?: string;
  created?: Date;
  modified?: Date;
};
