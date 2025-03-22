interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
}

export function parseBoltXml(xml: string): FileNode[] {
  const nodes = parseFlatNodes(xml[0]);
  return buildTree(nodes);
}

function parseFlatNodes(xml: string): FileNode[] {
  const regex = /<bolt\s+name="(.*?)"\s+type="(.*?)"\s+path="(.*?)">(.*?)<\/bolt>/gs;
  const result: FileNode[] = [];

  let match;
  while ((match = regex.exec(xml)) !== null) {
    const [, name, type, path, content] = match;
    const isFile = type === "file";

    result.push({
      name,
      type: isFile ? "file" : "folder",
      path,
      content: isFile ? content.trim() : undefined,
      children: [],
    });
  }

  return result;
}

function buildTree(nodes: FileNode[]): FileNode[] {
  const nodeMap = new Map<string, FileNode>();
  const rootNodes: FileNode[] = [];

  for (const node of nodes) {
    nodeMap.set(node.path, node);
  }

  for (const node of nodes) {
    const parentPath = node.path.substring(0, node.path.lastIndexOf("/"));
    if (nodeMap.has(parentPath)) {
      nodeMap.get(parentPath)!.children!.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  return rootNodes.slice(1);
}
