import { ActionGroup, Button, Form, Modal, ModalVariant, Title } from '@patternfly/react-core';
import React, { useState } from 'react'
import { ConnectHint } from '../util/ConnectHint';
import { eventService, workspace } from '@hawtio/react';
import { artemisService } from '../artemis-service';

type DeleteQueueProps = {
  queue: string
}
export const DeleteQueue: React.FunctionComponent<DeleteQueueProps> = (props: DeleteQueueProps) => {

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteQueue = async (name: string) => {
    await artemisService.deleteQueue(name)
      .then((value: unknown) => {
        setShowDeleteModal(false);
        workspace.refreshTree();
        eventService.notify({
          type: 'success',
          message: 'Queue Deleted',
          duration: 3000,
        })
      })
      .catch((error: string) => {
        setShowDeleteModal(false);
        eventService.notify({
          type: 'danger',
          message: 'Queue Not Deleted: ' + error,
        })
      });
  };

  return (
    <>
      <Title headingLevel="h2">Delete Queue {props.queue}</Title>
      <ConnectHint text={["This page allows you to delete the chosen Queue on the broker.", "Note that this will only succeed if the queue has no consumers bound to it."]}/>
      <Form>
        <ActionGroup>
          <Button variant="primary" onClick={() => setShowDeleteModal(true)} >Delete</Button>
        </ActionGroup>
      </Form>
      <Modal
      aria-label='queue-delete-modal'
      variant={ModalVariant.medium}
      title="Delete Queue?"
      isOpen={showDeleteModal}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => deleteQueue(props.queue)}>
          Confirm
        </Button>,
        <Button key="cancel" variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
      ]}><p>You are about to delete queue <b>{props.queue}</b>.</p>
      <p>This operation cannot be undone so please be careful.</p>
    </Modal>
    </>
  )
}