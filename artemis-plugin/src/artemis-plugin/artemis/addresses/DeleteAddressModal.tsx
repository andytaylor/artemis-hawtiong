import { Button, Text, Modal, ModalVariant, Icon, TextContent } from '@patternfly/react-core';
import { log } from '../globals';
import { artemisService } from '../artemis-service';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { eventService } from '@hawtio/react';

type DeleteAddressProps = {
  address: string
  show: boolean
  onClick: Function;
}
export const DeleteAddressModal: React.FunctionComponent<DeleteAddressProps> = (props: DeleteAddressProps) => {

  const handleDeleteAddress = () => {
    artemisService.deleteAddress(props.address)
      .then(() => {
        props.onClick();
        eventService.notify({
          type: 'success',
          message: "Address Successfully Deleted",
        })
      })
      .catch((error: string) => {
        props.onClick();
        eventService.notify({
          type: 'warning',
          message: error,
        })
      })
  };


  log.info(props.address)

  return (
    <Modal
      aria-label='delete-address-modal'
      variant={ModalVariant.medium}
      isOpen={props.show}
      actions={[
        <Button key="cancel" variant="secondary" onClick={props.onClick()}>
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