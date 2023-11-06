import { ChartDonutUtilization } from "@patternfly/react-charts"
import { Card, CardBody, CardTitle, Divider, ExpandableSection, Text, Grid, GridItem, Title, CardHeader, TextList, TextContent, TextListItem, TextListItemVariants, TextListVariants, Truncate, TextVariants, CardActions, Checkbox, Dropdown, KebabToggle, DropdownItem, DropdownSeparator, Button, Modal, ModalVariant, Flex, FlexItem } from "@patternfly/react-core"
import { TableComposable, Tr, Tbody, Td } from '@patternfly/react-table';
import { Attributes, eventService, Operations } from '@hawtio/react';
import { useContext, useEffect, useState } from "react";
import { Acceptors, artemisService, BrokerInfo, ClusterConnections } from "../artemis-service";
import { log } from "../globals";
import { ArtemisContext } from "../context";


export const Status: React.FunctionComponent = () => {

    const [brokerInfo, setBrokerInfo] = useState<BrokerInfo>()
    const [acceptors, setAcceptors] = useState<Acceptors>();
    const [clusterConnections, setClusterConncetions] = useState<ClusterConnections>()
    const { tree, selectedNode, setSelectedNode, findAndSelectNode } = useContext(ArtemisContext)

    const [showAttributesDialog, setShowAttributesDialog] = useState(false);
    const [showOperationsDialog, setShowOperationsDialog] = useState(false);
    useEffect(() => {
        const getBrokerInfo = async () => {
            artemisService.createBrokerInfo()
                .then((brokerInfo) => {
                    setBrokerInfo(brokerInfo)
                })
                .catch((error: string) => {
                    eventService.notify({
                        type: 'warning',
                        message: error,
                    })
                });
        }

        const getAcceptors = async () => {
            artemisService.createAcceptors()
                .then((acceptors) => {
                    setAcceptors(acceptors)
                })
                .catch((error: string) => {
                    eventService.notify({
                        type: 'warning',
                        message: error,
                    })
                });
        }
        if (!brokerInfo) {
            getBrokerInfo();
        }

        if (!acceptors) {
            getAcceptors();
        }

        if (!clusterConnections) {
            artemisService.createClusterConnections()
                .then((clusterConnections) => {
                    setClusterConncetions(clusterConnections)
                })
                .catch((error: string) => {
                    eventService.notify({
                        type: 'warning',
                        message: error,
                    })
                });
        }

        const timer = setInterval(getBrokerInfo, 5000)
        return () => clearInterval(timer)

    }, [brokerInfo, acceptors, clusterConnections])

    const [isBrokerInfoOpen, setIsBrokerInfoOpen] = useState<boolean>(false);

    const onBrokerInfoSelect = () => {
        setIsBrokerInfoOpen(!isBrokerInfoOpen);
    };

    const openAttrubutes = async () => {
        const brokerObjectName = await artemisService.getBrokerObjectName();
        findAndSelectNode(brokerObjectName, "");
        setShowAttributesDialog(true);
    }

    const openOperations = async () => {
        const brokerObjectName = await artemisService.getBrokerObjectName();
        findAndSelectNode(brokerObjectName, "");
        setShowOperationsDialog(true);
    }


    const brokerInfoDropdownItems = [
        <DropdownItem key="attributes" component="button" onClick={() => openAttrubutes()}>
            Attributes
        </DropdownItem>,
        <DropdownItem key="operations" component="button" onClick={() => openOperations()}>
            Operations
        </DropdownItem>,
    ];

    const getEndOfRow = (index: number) => {
        return ""
    }

    return (
        <>
            <Grid hasGutter>
                <GridItem span={2} rowSpan={3}>
                    <Card isFullHeight={true} >
                        <CardHeader>
                            <CardActions>
                                <Dropdown
                                    onSelect={onBrokerInfoSelect}
                                    toggle={<KebabToggle onToggle={setIsBrokerInfoOpen} />}
                                    isOpen={isBrokerInfoOpen}
                                    isPlain
                                    dropdownItems={brokerInfoDropdownItems}
                                    position={'right'}
                                />
                            </CardActions>
                        </CardHeader>
                        <CardTitle>Broker Info</CardTitle>
                        <CardBody>
                            <Divider />
                            <TextContent>
                                <TextList isPlain>
                                    <TextListItem component={TextListItemVariants.dt}>version</TextListItem>
                                    <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.version}</TextListItem>
                                    <TextListItem component={TextListItemVariants.dt}>uptime</TextListItem>
                                    <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.uptime}</TextListItem>
                                    <TextListItem component={TextListItemVariants.dt}>started</TextListItem>
                                    <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.started}</TextListItem>
                                    <TextListItem component={TextListItemVariants.dt}>HA Policy</TextListItem>
                                    <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.haPolicy}</TextListItem>
                                </TextList>
                            </TextContent>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem span={3} rowSpan={3}>
                    <Card isFullHeight={true}>
                        <CardTitle>Address Memory Used</CardTitle>
                        <CardBody>
                            <Divider />
                            <ChartDonutUtilization
                                ariaDesc="Address Memory Used"
                                ariaTitle="Address Memory Used"
                                constrainToVisibleArea
                                data={{ x: 'Used:', y: brokerInfo?.addressMemoryUsed }}
                                labels={["Used: " + brokerInfo?.addressMemoryUsed.toFixed(2) + "%"]}
                                name="chart2"
                                padding={{
                                    bottom: 20,
                                    left: 20,
                                    right: 20,
                                    top: 20
                                }}
                                subTitle="MiB Used"
                                title={"" + brokerInfo?.addressMemoryUsage.toFixed(2)}
                                width={350} />
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
            <ExpandableSection toggleTextExpanded="Acceptors" toggleTextCollapsed="Acceptors">
                <Grid hasGutter span={4}>
                    {
                        acceptors?.acceptors.map((acceptor, index) => (
                            <GridItem >
                                <Card isFullHeight={true}>

                                    <CardTitle>{acceptor.Name}</CardTitle>
                                    <CardBody>

                                        <TextContent>
                                            <TextList component={TextListVariants.dl}>
                                                <TextListItem component={TextListItemVariants.dt}>name</TextListItem>
                                                <TextListItem component={TextListItemVariants.dd}>{acceptor.Name}</TextListItem>
                                                <TextListItem component={TextListItemVariants.dt}>factory</TextListItem>
                                                <TextListItem component={TextListItemVariants.dd}><Truncate id="factory-trunc" content={acceptor.FactoryClassName} /></TextListItem>
                                                <TextListItem component={TextListItemVariants.dt}>started</TextListItem>
                                                <TextListItem component={TextListItemVariants.dd}>{String(acceptor.Started)}</TextListItem>
                                            </TextList>
                                            <Divider />
                                            <Text component={TextVariants.h2}>Parameters</Text>
                                            <TextList component={TextListVariants.dl}>
                                                {
                                                    Object.keys(acceptor.Parameters).map((key, index) => {
                                                        return (
                                                            <>
                                                                <TextListItem component={TextListItemVariants.dt}>{key}</TextListItem>
                                                                <TextListItem component={TextListItemVariants.dd}>{acceptor.Parameters[key]}</TextListItem>
                                                            </>
                                                        )
                                                    })
                                                }
                                            </TextList>
                                        </TextContent>

                                    </CardBody>
                                </Card>
                            </GridItem>
                        ))
                    }
                </Grid>
            </ExpandableSection>
            <ExpandableSection toggleText='Broker Network'>
                <Grid>
                    {
                        clusterConnections?.clusterConnections.map(clusterConnection => (
                            <>
                                <GridItem span={9}>
                                    <Card>
                                        <CardTitle>{'Cluster(' + clusterConnection.Name + ')'}</CardTitle>
                                        <CardBody>
                                            <Flex spaceItems={{ default: 'spaceItemsXl' }}>
                                                <FlexItem>
                                                    <TextContent>
                                                        <TextList component={TextListVariants.dl}>
                                                            <TextListItem component={TextListItemVariants.dt}>lives</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.networkTopology.getLiveCount()}</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dt}>backups</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.networkTopology.getBackupCount()}</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dt}>node id</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{clusterConnection.NodeID}</TextListItem>

                                                        </TextList>
                                                    </TextContent>
                                                </FlexItem>
                                                <Divider
                                                    orientation={{
                                                        default: 'vertical'
                                                    }}
                                                    inset={{
                                                        default: 'insetMd',
                                                        md: 'insetNone',
                                                        lg: 'insetSm',
                                                        xl: 'insetXs'
                                                    }}
                                                />
                                                <FlexItem>
                                                    <TextContent>
                                                        <TextList component={TextListVariants.dl}>
                                                            <TextListItem component={TextListItemVariants.dt}>load balancing</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{clusterConnection.MessageLoadBalancingType}</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dt}>duplicate detection</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{String(clusterConnection.DuplicateDetection)}</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dt}>address</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{clusterConnection.Address}</TextListItem>
                                                        </TextList>
                                                    </TextContent>
                                                </FlexItem>
                                                <Divider
                                                    orientation={{
                                                        default: 'vertical'
                                                    }}
                                                    inset={{
                                                        default: 'insetMd',
                                                        md: 'insetNone',
                                                        lg: 'insetSm',
                                                        xl: 'insetXs'
                                                    }}
                                                />
                                                <FlexItem>
                                                    <TextContent>
                                                        <TextList component={TextListVariants.dl}>
                                                            <TextListItem component={TextListItemVariants.dt}>max hops</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{clusterConnection.MaxHops}</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dt}>factory</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{clusterConnection.NodeID}</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dt}>address</TextListItem>
                                                            <TextListItem component={TextListItemVariants.dd}>{clusterConnection.Address}</TextListItem>
                                                        </TextList>
                                                    </TextContent>
                                                </FlexItem>
                                            </Flex>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            </>
                        ))
                    }
                </Grid>
                <Title headingLevel={"h4"}>Network</Title>
                <Grid hasGutter>
                    {
                        brokerInfo?.networkTopology.brokers.map(broker => (
                            <GridItem span={4}>
                                <Card>
                                    <CardTitle>{broker.nodeID}</CardTitle>
                                <Flex>
                                    <FlexItem>
                                        <Card>
                                            <CardTitle>primary</CardTitle>
                                            <CardBody>{broker.live}</CardBody>
                                        </Card>
                                    </FlexItem>
                                    <FlexItem>
                                        <Card>
                                            <CardTitle>backup</CardTitle>
                                            <CardBody>{broker.backup}</CardBody>
                                        </Card>
                                        </FlexItem>
                                </Flex>
                                </Card>
                            </GridItem>
                        ))
                    }
                </Grid>
            </ExpandableSection>

            <Modal
                aria-label='attributes-modal'
                variant={ModalVariant.medium}
                isOpen={showAttributesDialog}
                actions={[
                    <Button key="close" variant="primary" onClick={() => setShowAttributesDialog(false)}>
                        Close
                    </Button>
                ]}>
                <Attributes />
            </Modal>
            <Modal
                aria-label='operations-modal'
                variant={ModalVariant.medium}
                isOpen={showOperationsDialog}
                actions={[
                    <Button key="close" variant="primary" onClick={() => setShowOperationsDialog(false)}>
                        Close
                    </Button>
                ]}>
                <Operations />
            </Modal>
        </>
    )
}

