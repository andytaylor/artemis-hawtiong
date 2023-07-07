import { ActionGroup, Button, Checkbox, ExpandableSection, Flex, FlexItem, Form, FormGroup, NumberInput, Radio, TextInput, Title, Text } from '@patternfly/react-core';
import React, { useState } from 'react'
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { artemisService } from '../artemis-service';
import { Broker } from '../ArtemisTabs';
import { eventService } from '@hawtio/react';
  
export const CreateAddress: React.FunctionComponent<Broker> = (broker: Broker) => {
    const [addressName, setAddressName] = useState('');
    const [routingType, setRoutingType] = useState('');

    const handleQueueNameChange = (name: string) => {
        setAddressName(name);
    };

    const handleQueueRoutingTypeChange = (name: string) => {
        setRoutingType(name);
    };

    const handleCreateAddress = () => {

        artemisService.createAddress(broker.jolokia, broker.brokerMBeanName, addressName, routingType).
        then(() => {
            eventService.notify({
                type: 'success',
                message: "Address Succcesfully Created",
              })
        })
        .catch((error: string) => {
          eventService.notify({
            type: 'warning',
            message: error,
          })
        })
    };

    const ConnectHint = () => (
        <ExpandableSection
          displaySize='large'
          toggleContent={
            <Text>
              <OutlinedQuestionCircleIcon /> Hint
            </Text>
          }
        >
          <Text component='p'>
            This page allows you to create a new address on the broker, if you want the address to support JMS like queues, i.e. point to point, then choose anycast. If you want your address to support JMS like topic subscriptions, publish/subscribe, then choose multicast.
          </Text>
        </ExpandableSection>
      )

    return (
        <><Title headingLevel="h2">Create Address</Title>
        <ConnectHint/>
        <Form>
            <FormGroup label="Address Name">
                <TextInput
                    isRequired
                    type="text"
                    id="address-name"
                    name="address-name"
                    value={addressName}
                    onChange={handleQueueNameChange} />
            </FormGroup>
            <FormGroup role="radiogroup" isInline fieldId="routing-typr" label="Routing Type">
                <Radio name="basic-inline-radio" label="Anycast" id="ANYCAST" onChange={() => handleQueueRoutingTypeChange("ANYCAST")} />
                <Radio name="basic-inline-radio" label="Multicast" id="MULTICAST" onChange={() => handleQueueRoutingTypeChange("MULTICAST")} />
            </FormGroup>
         
            <ActionGroup>
                <Button variant="primary" onClick={() => handleCreateAddress()} isDisabled={addressName.length === 0 || routingType.length === 0}>Create Address</Button>
            </ActionGroup>
        </Form></>
    )
}