import { ActionGroup, Button, Form, FormGroup, Radio, TextInput, Title } from '@patternfly/react-core';
import React, { useState } from 'react'
import { artemisService } from '../artemis-service';
import { eventService } from '@hawtio/react';
import { ConnectHint } from '../util/ConnectHint';

export const CreateAddress: React.FunctionComponent = () => {
  const [addressName, setAddressName] = useState('');
  const [routingType, setRoutingType] = useState('');

  const handleQueueNameChange = (name: string) => {
    setAddressName(name);
  };

  const handleQueueRoutingTypeChange = (name: string) => {
    setRoutingType(name);
  };

  const handleCreateAddress = () => {
    artemisService.createAddress(addressName, routingType)
      .then(() => {
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

  return (
    <>
    <Title headingLevel="h2">Create Address</Title>
      <ConnectHint text={['This page allows you to create a new address on the broker, if you want the address to support JMS like queues, i.e. point to point, then choose anycast. If you want your address to support JMS like topic subscriptions, publish/subscribe, then choose multicast.']}/>
      <br/>
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
        <FormGroup role="radiogroup" isInline fieldId="routing-type" label="Routing Type">
          <Radio name="basic-inline-radio" label="Anycast" id="ANYCAST" onChange={() => handleQueueRoutingTypeChange("ANYCAST")} />
          <Radio name="basic-inline-radio" label="Multicast" id="MULTICAST" onChange={() => handleQueueRoutingTypeChange("MULTICAST")} />
        </FormGroup>

        <ActionGroup>
          <Button variant="primary" onClick={() => handleCreateAddress()} isDisabled={addressName.length === 0 || routingType.length === 0}>Create Address</Button>
        </ActionGroup>
      </Form>
      </>
  )
}