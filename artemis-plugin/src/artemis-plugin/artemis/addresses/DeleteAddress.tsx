import { ActionGroup, Button, Form, Title } from '@patternfly/react-core';
import React, { useState } from 'react'
import { DeleteAddressModal } from './DeleteAddressModal';
import { ConnectHint } from '../util/ConnectHint';

type DeleteAddressProps = {
  address: string
}
export const DeleteAddress: React.FunctionComponent<DeleteAddressProps> = (props: DeleteAddressProps) => {

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Title headingLevel="h2">Delete Address {props.address}</Title>
      <ConnectHint text={["This page allows you to delete the chosen address on the broker.", "Note that this will only succeed if the address has no queues bound to it."]}/>
      <Form>
        <ActionGroup>
          <Button variant="primary" onClick={() => setShowDeleteModal(true)} >Delete</Button>
        </ActionGroup>
      </Form>
      <DeleteAddressModal
        address={props.address} show={showDeleteModal} onClick={() => setShowDeleteModal(false)} />
    </>
  )
}