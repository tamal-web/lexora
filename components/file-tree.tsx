import * as React from "react"
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

interface TreeNodeProps {
  node: {
    name: string
    isFolder?: boolean
    children?: any[]
  }
}

function FileTreeNode({ node }: TreeNodeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  if (!node.isFolder) {
    return (
      <div className="flex cursor-pointer items-center gap-2 rounded-sm py-1 pr-2 pl-6 text-sm transition-colors select-none hover:bg-accent hover:text-accent-foreground">
        <File className="h-4 w-4 text-muted-foreground" />
        <span>{node.name}</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Folder Row */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium transition-colors select-none hover:bg-accent hover:text-accent-foreground"
      >
        <div className="rounded-sm p-0.5 text-muted-foreground/70 hover:bg-muted">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </div>

        {isOpen ? (
          <FolderOpen className="text-amber-500-- h-4 w-4 fill-amber-500/20 fill-purple-400/20 text-purple-400" />
        ) : (
          <Folder className="text-amber-500-- fill-amber-500/20-- h-4 w-4 fill-purple-400/20 text-purple-400" />
        )}

        <span>{node.name}</span>
      </div>

      {/* Recursive Children Renders */}
      {isOpen && node.children && (
        <div className="relative mt-0.5 ml-[14px] flex flex-col gap-0.5 border-l border-border/60 pl-4">
          {node.children.map((childNode, index) => (
            <FileTreeNode key={index} node={childNode} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({ data }: { data: TreeNodeProps["node"][] }) {
  return (
    <div className="w-72">
      <div className="flex flex-col gap-0.5">
        {data.map((node, index) => (
          <FileTreeNode key={index} node={node} />
        ))}
      </div>
    </div>
  )
}
