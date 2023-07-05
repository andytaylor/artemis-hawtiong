import { ActionGroup, Button, Checkbox, ExpandableSection, Flex, FlexItem, Form, FormGroup, NumberInput, Radio, TextInput, Title, Text } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react'
import { TrashIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { log } from '../globals';
import { artemisService } from '../artemis-service';
import { BrokerConnection } from '../brokers/brokers-service';
import { Broker } from '../ArtemisTabs';
import { eventService } from '@hawtio/react';
import { DeleteAddressModal } from './DeleteAddressModal';
  
type DeleteAddressInfo = {
    address: string
    broker: Broker
}
export const DeleteAddress: React.FunctionComponent<DeleteAddressInfo> = (info: DeleteAddressInfo) => {

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleDeleteAddress = () => {
        artemisService.deleteAddress(info.broker.jolokia, info.broker.brokerMBeanName, info.address).
        then(() => {
            eventService.notify({
                type: 'success',
                message: "Address Succcesfully Deleted",
              })
        })
        .catch((error: string) => {
          eventService.notify({
            type: 'warning',
            message: error,
          })
        })
    };

    useEffect(() => {
        log.info("rendered delete address ");
      }, [showDeleteModal])

    log.info(info.address)

    const Hint = () => (
        <ExpandableSection
          displaySize='large'
          toggleContent={
            <Text>
              <OutlinedQuestionCircleIcon /> Hint
            </Text>
          }
        >
          <Text component='p'>
          This page allows you to delete the chosen address on the broker.
          </Text>
          <Text component='p'>
          Note that this will only succeed if the address has no queues bound to it.
          </Text>
          
        </ExpandableSection>
      )
    return (
        <><Title headingLevel="h2">Delete Address {info.address}</Title>
        <Hint/>
        <Form>
            <ActionGroup>
                <Button variant="primary" onClick={() => setShowDeleteModal(true)} >Delete</Button>
            </ActionGroup>
        </Form>
        <DeleteAddressModal 
                address={info.address}
                broker={{
                    brokerMBeanName: info.broker.brokerMBeanName,
                    loaded: true,
                    jolokia: info.broker.jolokia
                }}
                show={showDeleteModal} onClick={() => setShowDeleteModal(false)}/>
        </>
    )
}