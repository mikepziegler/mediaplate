import { FileNode } from '../dtos/filenode.dto';
import { validate, ValidationError } from 'class-validator';


export async function validateTree(nodes: FileNode[]) {
  for (const node of nodes) {
    const errors: ValidationError[] = await validate(node, { whitelist: true });
    if (errors.length > 0) {
      console.error('Validation failed:', errors);
    }
    if (node.children) {
      await validateTree(node.children);
    }
  }
}
