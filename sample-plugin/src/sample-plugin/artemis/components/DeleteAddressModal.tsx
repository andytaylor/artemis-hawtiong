import { ActionGroup, Button, Checkbox, ExpandableSection, Flex, FlexItem, Form, FormGroup, NumberInput, Radio, TextInput, Title, Text, Modal, ModalVariant, Icon, TextContent } from '@patternfly/react-core';
import React, { MouseEventHandler, useState } from 'react'
import { TrashIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { log } from '../globals';
import { artemisService } from '../artemis-service';
import { BrokerConnection } from '../brokers/brokers-service';
import { Broker } from '../ArtemisTabs';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { eventService } from '@hawtio/react';
  
type DeleteAddressInfo = {
    address: string
    show: boolean
    onClick: Function;
    broker: Broker
}
export const DeleteAddressModal: React.FunctionComponent<DeleteAddressInfo> = (info: DeleteAddressInfo) => {

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteAddress = () => {
        artemisService.deleteAddress(info.broker.jolokia, info.broker.brokerMBeanName, info.address).
        then(() => {
            eventService.notify({
                type: 'success',
                message: "Address Successfully Deleted",
              })
        })
        .catch((error: string) => {
          eventService.notify({
            type: 'warning',
            message: error,
          })
        })
      info.onClick();   
    };

    const handleShowModal = () => {
      info.onClick();

      log.info(info.address + "££££")
    }

    log.info(info.address)

    return (
      <Modal
        variant={ModalVariant.medium}
        isOpen={info.show}
        actions={[
          <Button key="cancel" variant="secondary" onClick={handleShowModal}>
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
            You are about to delete address {info.address}
          </Text>
          <Text component="p">
            This operation cannot be undone so please be careful.
          </Text>
        </TextContent>
    </Modal>
    )
}