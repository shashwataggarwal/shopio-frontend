export type HasParent = { id: string; parent?: { id: string } | null }
export type TreeNode<T extends HasParent> = T & {
  children: Array<TreeNode<T>>
  expanded: boolean
}
export type RootNode<T extends HasParent> = {
  id?: string
  children: Array<TreeNode<T>>
}

export function arrayToTree<T extends HasParent>(
  nodes: T[],
  currentState?: RootNode<T>
): RootNode<T> {
  const topLevelNodes: Array<TreeNode<T>> = []
  const mappedArr: { [id: string]: TreeNode<T> } = {}
  const currentStateMap = treeToMap(currentState)

  // First map the nodes of the array to an object -> create a hash table.
  for (const node of nodes) {
    mappedArr[node.id] = { ...(node as any), children: [] }
  }

  for (const id of nodes.map((n) => n.id)) {
    if (mappedArr.hasOwnProperty(id)) {
      const mappedElem = mappedArr[id]
      mappedElem.expanded = currentStateMap.get(id)?.expanded ?? false
      const parent = mappedElem.parent
      if (!parent) {
        continue
      }
      // If the element is not at the root level, add it to its parent array of children.
      const parentIsRoot = !mappedArr[parent.id]
      if (!parentIsRoot) {
        if (mappedArr[parent.id]) {
          mappedArr[parent.id].children.push(mappedElem)
        } else {
          mappedArr[parent.id] = { children: [mappedElem] } as any
        }
      } else {
        topLevelNodes.push(mappedElem)
      }
    }
  }
  // tslint:disable-next-line:no-non-null-assertion
  const rootId = topLevelNodes.length ? topLevelNodes[0].parent!.id : undefined
  return { id: rootId, children: topLevelNodes }
}

/**
 * Converts an existing tree (as generated by the arrayToTree function) into a flat
 * Map. This is used to persist certain states (e.g. `expanded`) when re-building the
 * tree.
 */
function treeToMap<T extends HasParent>(
  tree?: RootNode<T>
): Map<string, TreeNode<T>> {
  const nodeMap = new Map<string, TreeNode<T>>()
  function visit(node: TreeNode<T>) {
    nodeMap.set(node.id, node)
    node.children.forEach(visit)
  }
  if (tree) {
    visit(tree as TreeNode<T>)
  }
  return nodeMap
}
