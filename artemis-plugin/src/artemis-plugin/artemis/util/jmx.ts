import { MBeanNode } from "@hawtio/react";
import { jmxDomain } from "../globals";

const ADDRESS_COMPONENT_PART = ",component=addresses,address=\"";
const ADDRESS_SUBCOMPONENT_PART = "\",subcomponent=queues,routing-type=\"";
const ADDRESS_TYPE_PART = "\".queue=\"";
const STRING_DELIMETER = "\"";
const QUEUE_COMPONENT = "component=queues";
const ADDRESS_COMPONENT = "component=addresses";
const DOMAIN = "domain";

/**
 * Create the queue object name which would look like
 * "127.0.0.1",component=addresses,address="q1",subcomponent=queues,routing-type="anycast",queue="q1"
 */
export function createQueueObjectName(brokerMBean: string, address: string, routingType: string, queue: string): string {
    return brokerMBean + ADDRESS_COMPONENT_PART + address + ADDRESS_SUBCOMPONENT_PART + routingType.toLowerCase() + ADDRESS_TYPE_PART + queue + STRING_DELIMETER;
}

export function isQueue(node: MBeanNode): boolean {
    return node != null && node.objectName != null && node.objectName?.includes(QUEUE_COMPONENT) as boolean;
}

export function isAddress(node: MBeanNode): boolean {
    return node != null && node.objectName != null && node.objectName?.includes(ADDRESS_COMPONENT) && !node.objectName?.includes(QUEUE_COMPONENT);
}

export function hasDomain(node: MBeanNode): boolean {
    return node && jmxDomain === node.getProperty(DOMAIN);
}