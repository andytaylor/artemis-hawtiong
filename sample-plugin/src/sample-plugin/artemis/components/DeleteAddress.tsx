import { ActionGroup, Button, ExpandableSection, Form, Title, Text } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react'
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { log } from '../globals';
import { Broker } from '../ArtemisTabs';
import { DeleteAddressModal } from './DeleteAddressModal';

type DeleteAddressProps = {
  address: string
  broker: Broker
}
export const DeleteAddress: React.FunctionComponent<DeleteAddressProps> = (props: DeleteAddressProps) => {

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    log.info("rendered delete address ");
  }, [showDeleteModal])

  log.info(props.address)

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
    <><Title headingLevel="h2">Delete Address {props.address}</Title>
      <Hint />
      <Form>
        <ActionGroup>
          <Button variant="primary" onClick={() => setShowDeleteModal(true)} >Delete</Button>
        </ActionGroup>
      </Form>
      <DeleteAddressModal
        address={props.address}
        broker={{
          brokerMBeanName: props.broker.brokerMBeanName,
          jolokia: props.broker.jolokia
        }}
        show={showDeleteModal} onClick={() => setShowDeleteModal(false)} />
    </>
  )
}