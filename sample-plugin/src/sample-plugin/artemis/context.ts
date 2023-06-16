import { eventService, EVENT_REFRESH, FilterFn, ForEachFn, MBeanNode, MBeanTree, OptimisedJmxMBean, PluginNodeSelectionContext, workspace } from "@hawtio/react";
import { TreeViewDataItem } from "@patternfly/react-core";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { artemisPluginName, jmxDomain, log } from "./globals";

type CustomNode = MBeanNode & {
    mbean?: string
  }
  
/**
 * Custom React hook for using Camel MBean tree.
 */
export function useArtemisTree() {

    const [tree, setTree] = useState(MBeanTree.createEmpty(artemisPluginName))
    const [loaded, setLoaded] = useState(false)
    const { selectedNode, setSelectedNode } = useContext(PluginNodeSelectionContext)
    const navigate = useNavigate();

    const logit = () => {
        log.info("***********************************************************************")
    }


    const populateTree = async () => {
        const wkspTree: MBeanTree = await workspace.getTree();
        const rootNode = wkspTree.findDescendant(node => node.name === jmxDomain)
        if (rootNode && rootNode.children && rootNode.children.length > 0) {
            log.info("rootnode=========================" + rootNode.objectName)
      
            const contextsNode = rootNode.getChildren()[0];
            const subTree: MBeanTree = MBeanTree.createFromNodes(artemisPluginName, contextsNode.getChildren())
            setTree(subTree)

        } else {
            setTree(wkspTree)
            // No camel contexts so redirect to the JMX view and select the first tree node
            navigate('jmx')
            eventService.notify({
                type: 'warning',
                message: 'No Camel domain detected in target. Redirecting to back to jmx.',
            })
        }
    }

    useEffect(() => {
        const loadTree = async () => {
            await populateTree()
            setLoaded(true)
        }

        const listener = () => {
            setLoaded(false)
            loadTree()
        }
        eventService.onRefresh(listener)

        loadTree()

        return () => eventService.removeListener(EVENT_REFRESH, listener)
        /*
         * This effect should only be called on mount so cannot depend on selectedNode
         * But cannot have [] removed either as this seems to execute the effect repeatedly
         * So disable the lint check.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { tree, loaded, selectedNode, setSelectedNode, logit }
}


type ArtemisContext = {
    tree: MBeanTree
    selectedNode: MBeanNode | null
    setSelectedNode: (selected: MBeanNode | null) => void
}

export const ArtemisContext = createContext<ArtemisContext>({
    tree: MBeanTree.createEmpty(artemisPluginName),
    selectedNode: null,
    setSelectedNode: () => {
        /* no-op */
    },
})