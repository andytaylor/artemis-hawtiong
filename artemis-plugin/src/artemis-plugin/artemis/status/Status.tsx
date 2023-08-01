import { ChartDonutUtilization } from "@patternfly/react-charts"
import { Card, CardBody, CardTitle, Divider, ExpandableSection, Text, Grid, GridItem, Title, CardHeader} from "@patternfly/react-core"
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

    }, [brokerInfo, acceptors])

    return (
        <>
            <Grid hasGutter>
                <GridItem span={2} rowSpan={3}>
                    <Card isFullHeight={true} >
                        <CardHeader />
                        <CardTitle><Title headingLevel={"h1"}>Broker Info</Title></CardTitle>
                        <CardBody>
                            <Divider />
                            <Title headingLevel={"h2"}>version</Title>
                            <Text>{brokerInfo?.version}</Text>
                            <Title headingLevel={"h2"}>uptime</Title>
                            <Text>{brokerInfo?.uptime}</Text>
                            <Title headingLevel={"h2"}>started</Title>
                            <Text>{brokerInfo?.started}</Text>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem span={2} rowSpan={3}>
                    <Card isFullHeight={true}>
                        <CardTitle>Cluster Info</CardTitle>
                        <CardBody>
                            <Divider />
                            <Title headingLevel={"h2"}>lives</Title>
                            <Text>{brokerInfo?.networkTopology.getLiveCount()}</Text>
                            <Title headingLevel={"h2"}>backups</Title>
                            <Text>{brokerInfo?.networkTopology.getBackupCount()}</Text>
                            <Title headingLevel={"h2"}>HA Policy</Title>
                            <Text>{brokerInfo?.haPolicy}</Text>
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
                                        <TableComposable variant="compact" aria-label="Column Management Table">
                                            <Tbody>
                                                <Tr key='name'>
                                                    <Td key='name-key'>name</Td>
                                                    <Td key='name-val'>{acceptor.Name}</Td>
                                                </Tr>
                                                <Tr key='factoryclassname'>
                                                    <Td key='factoryclassname-key'>factory</Td>
                                                    <Td key='factoryclassname-val'>{acceptor.FactoryClassName}</Td>
                                                </Tr>
                                                <Tr key='started'>
                                                    <Td key='started-key'>started</Td>
                                                    <Td key='started-val'>{String(acceptor.Started)}</Td>
                                                </Tr>
                                            </Tbody>
                                        </TableComposable>
                                        <Divider />
                                        <Title headingLevel={"h5"}>Parameters</Title>
                                        <TableComposable variant="compact" aria-label="Column Management Table">
                                            <Tbody>
                                                {
                                                    Object.keys(acceptor.Parameters).map((key, index) => {
                                                        return (
                                                            <Tr>
                                                                <Td>{key}</Td>
                                                                <Td>{acceptor.Parameters[key]}</Td>
                                                            </Tr>
                                                        )
                                                    })
                                                }
                                            </Tbody>
                                        </TableComposable>
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