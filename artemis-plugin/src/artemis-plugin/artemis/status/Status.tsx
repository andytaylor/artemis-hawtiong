import { ChartDonutUtilization } from "@patternfly/react-charts"
import { Card, CardBody, CardTitle, Divider, ExpandableSection, Text, Grid, GridItem, Title, CardHeader, TextList, TextContent, TextListItem, TextListItemVariants, TextListVariants, Truncate, TextVariants} from "@patternfly/react-core"
import { TableComposable, Tr, Tbody, Td } from '@patternfly/react-table';
import { eventService } from '@hawtio/react';
import { useEffect, useState } from "react";
import { Acceptors, artemisService, BrokerInfo } from "../artemis-service";


export const Status: React.FunctionComponent = () => {

    const [brokerInfo, setBrokerInfo] = useState<BrokerInfo>()
    const [acceptors, setAcceptors] = useState<Acceptors>();
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

        const timer = setInterval(getBrokerInfo, 5000)
        return () => clearInterval(timer)

    }, [brokerInfo, acceptors])

    return (
        <>
            <Grid hasGutter>
                <GridItem span={2} rowSpan={3}>
                    <Card isFullHeight={true} >
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
                                </TextList>
                            </TextContent>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem span={2} rowSpan={3}>
                    <Card isFullHeight={true}>
                        <CardTitle>Cluster Info</CardTitle>
                        <CardBody>
                            <Divider />
                            <TextContent>
                                <TextList isPlain>
                                    <TextListItem component={TextListItemVariants.dt}>lives</TextListItem>
                                    <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.networkTopology.getLiveCount()}</TextListItem>
                                    <TextListItem component={TextListItemVariants.dt}>backups</TextListItem>
                                    <TextListItem component={TextListItemVariants.dd}>{brokerInfo?.networkTopology.getBackupCount()}</TextListItem>
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
                <Grid hasGutter>
                    {
                        acceptors?.acceptors.map(acceptor => (
                            <GridItem span={4}>
                                <Card isFullHeight={true}>

                                    <CardTitle>{acceptor.Name}</CardTitle>
                                    <CardBody>
                                        
                                    <TextContent>
                                        <TextList component={TextListVariants.dl}>
                                            <TextListItem component={TextListItemVariants.dt}>name</TextListItem>
                                            <TextListItem component={TextListItemVariants.dd}>{acceptor.Name}</TextListItem>
                                            <TextListItem component={TextListItemVariants.dt}>factory</TextListItem>
                                            <TextListItem component={TextListItemVariants.dd}><Truncate content={acceptor.FactoryClassName}/></TextListItem>
                                            <TextListItem component={TextListItemVariants.dt}>started</TextListItem>
                                            <TextListItem component={TextListItemVariants.dd}>{acceptor.Started}</TextListItem>
                                        </TextList>
                                        <Divider />
                                        <Text component={TextVariants.h2}>Parameters</Text>
                                        <TextList component={TextListVariants.dl}>
                                                {
                                                    Object.keys(acceptor.Parameters).map((key, index) => {
                                                        return (
                                                                <>
                                                                <TextListItem component={TextListItemVariants.dt}>{key}</TextListItem>
                                                                <TextListItem component={TextListItemVariants.dd}>{acceptor.Parameters[key]}</TextListItem></>
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
        </>
    )
}