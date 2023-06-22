import { EVENT_REFRESH, eventService, workspace, MBeanNode } from '@hawtio/react'
import { TreeViewDataItem } from '@patternfly/react-core'
import { MemoryIcon, MicrochipIcon, MonitoringIcon, RunningIcon } from '@patternfly/react-icons'
import React, { createContext, useEffect, useState } from 'react'
import { log, pluginName } from './globals'

type CustomNode = TreeViewDataItem & {
  mbean?: string
}

/**
 * Custom React hook for using the plugin-specific custom MBean tree.
 */
export function useCustomTree() {
  const [tree, setTree] = useState<CustomNode[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null)

  useEffect(() => {
    const loadTree = async () => {
      const tree = await populateTree()
      setTree(tree)
      setLoaded(true)
    }
    loadTree()

    const listener = () => {
      setLoaded(false)
      loadTree()
    }
    eventService.onRefresh(listener)

    return () => eventService.removeListener(EVENT_REFRESH, listener)
  }, [])

  return { tree, loaded, selectedNode, setSelectedNode }
}

async function populateTree(): Promise<CustomNode[]> {
  const domain = "org.apache.activemq.artemis"
  const tree = await workspace.getTree()
  const target = tree.findDescendant(node => node.name === domain)
  if (!target) {
    return []
  }

  const root: CustomNode = {
    name: target.name,
    id: pluginName,
    mbean: domain,
    icon: React.createElement(MonitoringIcon),
    defaultExpanded: true,
    children: [],
  }
  log.info("name ="+target.name)
  var broker: MBeanNode = target.getChildren()[0]
  const brokerNode : CustomNode = {
    name:broker.name,
    id: broker.id,
    mbean: broker.objectName,
    icon: React.createElement(MonitoringIcon),
    children: [],
  }
  root.children?.push(brokerNode);
  broker.children?.forEach(child => {
    const node: CustomNode = {
      name: child.name,
      id: child.name.replace(/\s/, '-'),
      mbean: child.objectName,
    }
    log.info(child.name);
    switch (child.name) {
      case 'acceptors':
        node.icon = React.createElement(MemoryIcon)
        root.children?.push(node)
        break
      case 'addresses':
        node.icon = React.createElement(MicrochipIcon)
        root.children?.push(node)
        break
      case 'Threading':
        node.icon = React.createElement(RunningIcon)
        root.children?.push(node)
        break
      default:
    }
  })

  return [root]
}

type CustomTreeContext = {
  tree: CustomNode[]
  selectedNode: CustomNode | null
  setSelectedNode: (selected: CustomNode | null) => void
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CustomTreeContext = createContext<CustomTreeContext>({
  tree: [],
  selectedNode: null,
  setSelectedNode: () => {
    // no-op
  },
})
