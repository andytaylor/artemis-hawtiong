import { ActionGroup, Text, Button, Form, Icon, Modal, ModalVariant, TextContent, Title } from '@patternfly/react-core';
import React, { useState } from 'react'
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { ConnectHint } from '../util/ConnectHint';
import { eventService, workspace } from '@hawtio/react';
import { artemisService } from '../artemis-service';

type DeleteAddressProps = {
  address: string
}
export const DeleteAddress: React.FunctionComponent<DeleteAddressProps> = (props: DeleteAddressProps) => {

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAddress = () => {
    artemisService.deleteAddress(props.address)
      .then(() => {
        setShowDeleteModal(false);

        workspace.refreshTree();        eventService.notify({
          type: 'success',
          message: "Address Successfully Deleted",
        })
      })
      .catch((error: string) => {
        setShowDeleteModal(false);
        eventService.notify({
          type: 'warning',
          message: error,
        })
      })
  };

  return (
    <>
      <Title headingLevel="h2">Delete Address {props.address}</Title>
      <ConnectHint text={["This page allows you to delete the chosen address on the broker.", "Note that this will only succeed if the address has no queues bound to it."]}/>
      <Form>
        <ActionGroup>
          <Button variant="primary" onClick={() => setShowDeleteModal(true)} >Delete</Button>
        </ActionGroup>
      </Form><Modal
      aria-label='delete-address-modal'
      variant={ModalVariant.medium}
      isOpen={showDeleteModal}
      actions={[
        <Button key="cancel" variant="secondary" onClick={() => handleDeleteAddress()}>
          Cancel
        </Button>,
        <Button key="delete" variant="primary" onClick={handleDeleteAddress}>
          Confirm
        </Button>
      ]}>
      <TextContent>
        <Text component="h2">
          Confirm Delete Address
        </Text>
        <Text component="p">
          <Icon isInline status='warning'>
            <ExclamationCircleIcon />
          </Icon>
          You are about to delete address {props.address}
        </Text>
        <Text component="p">
          This operation cannot be undone so please be careful.
        </Text>
      </TextContent>
    </Modal>
    </>
  )
}