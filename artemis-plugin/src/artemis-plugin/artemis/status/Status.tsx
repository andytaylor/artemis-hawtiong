import { ChartDonutUtilization } from "@patternfly/react-charts"
import { Card, CardBody, CardTitle, Flex, FlexItem } from "@patternfly/react-core"
import { TableComposable, Tr, Tbody, Td } from '@patternfly/react-table';
import { Chart, eventService, jolokiaService } from '@hawtio/react';
import { useEffect, useState } from "react";
import { artemisService, BrokerInfo } from "../artemis-service";


export const Status: React.FunctionComponent = () => {

    const [brokerInfo, setBrokerInfo] = useState<BrokerInfo>()
    useEffect(() => {
        const getBrokerInfo = async () => {
            artemisService.createBrokerInfo(jolokiaService)
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
        if (!brokerInfo) {
            getBrokerInfo();
        }

    }, [brokerInfo])

    return (
        <>
            <Flex>
                <Flex>
                    <FlexItem>
                        <Card>
                            <CardTitle>Address Memory Used</CardTitle>
                            <CardBody>
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
                    </FlexItem>
                </Flex>
                <Flex>
                    <FlexItem>
                        <Card isFullHeight={true}>
                            <CardTitle>Broker Info</CardTitle>
                            <CardBody>
                                <TableComposable variant="compact" aria-label="Column Management Table">
                                    <Tbody>
                                        <Tr key='version'>
                                            <Td key='version-key'>version</Td>
                                            <Td key='version-val'>{brokerInfo?.version}</Td>
                                        </Tr>
                                        <Tr key='uptime'>
                                            <Td key='uptime-key'>uptime</Td>
                                            <Td key='uptime-val'>{brokerInfo?.uptime}</Td>
                                        </Tr>
                                        <Tr key='started'>
                                            <Td key='started-key'>started</Td>
                                            <Td key='started-val'>{brokerInfo?.started}</Td>
                                        </Tr>
                                    </Tbody>
                                </TableComposable>
                            </CardBody>
                        </Card>
                    </FlexItem>
                    <FlexItem>
                        <Card>
                            <CardTitle>Cluster Info</CardTitle>
                            <CardBody>
                                <TableComposable variant="compact" aria-label="Column Management Table">
                                    <Tbody>
                                        <Tr key='version'>
                                            <Td key='version-key'>lives</Td>
                                            <Td key='version-val'>{brokerInfo?.networkTopology.getLiveCount()}</Td>
                                        </Tr>
                                        <Tr key='uptime'>
                                            <Td key='uptime-key'>backups</Td>
                                            <Td key='uptime-val'>{brokerInfo?.networkTopology.getBackupCount()}</Td>
                                        </Tr>
                                        <Tr key='hapolicy'>
                                            <Td key='hapolicy-key'>HA Policy</Td>
                                            <Td key='hapolicy-val'>{brokerInfo?.haPolicy}</Td>
                                        </Tr>
                                    </Tbody>
                                </TableComposable>
                            </CardBody>
                        </Card>
                    </FlexItem>
                </Flex>
            </Flex>
            <Chart />
        </>
    )
}