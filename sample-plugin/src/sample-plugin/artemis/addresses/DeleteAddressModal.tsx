import { Button, Text, Modal, ModalVariant, Icon, TextContent } from '@patternfly/react-core';
import { log } from '../globals';
import { artemisService } from '../artemis-service';
import { Broker } from '../views/ArtemisTabView';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { eventService } from '@hawtio/react';

type DeleteAddressProps = {
  address: string
  show: boolean
  onClick: Function;
  broker: Broker
}
export const DeleteAddressModal: React.FunctionComponent<DeleteAddressProps> = (props: DeleteAddressProps) => {

  const handleDeleteAddress = () => {
    artemisService.deleteAddress(props.broker.jolokia, props.broker.brokerMBeanName, props.address)
      .then(() => {
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
    props.onClick();
  };

  const handleShowModal = () => {
    props.onClick();

    log.info(props.address + "££££")
  }

  log.info(props.address)

  return (
    <Modal
      aria-label='delete-address-modal'
      variant={ModalVariant.medium}
      isOpen={props.show}
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
          You are about to delete address {props.address}
        </Text>
        <Text component="p">
          This operation cannot be undone so please be careful.
        </Text>
      </TextContent>
    </Modal>
  )
}