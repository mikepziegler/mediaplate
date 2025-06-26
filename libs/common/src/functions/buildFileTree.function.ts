import { FileNode } from '../dtos/filenode.dto';
import { FileNodeType } from '../enums/filenodetype.enum';

export function buildFileTree(paths: string[]): FileNode[] {
  const root: Record<string, FileNode> = {};

  for (const path of paths) {
    const parts = path.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const isFile = isLast && !path.endsWith('/');

      if (!currentLevel[part]) {
        currentLevel[part] = new FileNode({
          name: part,
          type: isFile ? FileNodeType.File : FileNodeType.Folder,
          ...(isFile ? {} : { children: {} as any })
        });
      }

      if (!isFile) {
        currentLevel = currentLevel[part].children as any;
      }
    });
  }

  function objectToArray(obj: Record<string, FileNode>): FileNode[] {
    return Object.values(obj).map(node => {
      const transformed = new FileNode({
        name: node.name,
        type: node.type,
        children: node.children ? objectToArray(node.children as any) : undefined
      });
      return transformed;
    });
  }

  return objectToArray(root);
}
