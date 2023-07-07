import { ActionGroup, Button, Checkbox, ExpandableSection, Flex, FlexItem, Form, FormGroup, NumberInput, Radio, TextInput, Title, Text } from '@patternfly/react-core';
import React, { useState } from 'react'
import { TrashIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { log } from '../globals';
import { artemisService } from '../artemis-service';
import { BrokerConnection } from '../brokers/brokers-service';
import { Broker } from '../ArtemisTabs';
import { eventService } from '@hawtio/react';
  
type CreateQueueInfo = {
    address: string
    broker: Broker
}
export const CreateQueue: React.FunctionComponent<CreateQueueInfo> = (info: CreateQueueInfo) => {
    const [queueName, setQueueName] = useState('');
    const [filter, setFilter] = useState('');
    const [queueRoutingType, setQueueRoutingType] = useState('');
    const [isDurableChecked, setIsDurableChecked] = useState<boolean>(true);
    const [maxConsumers, setMaxConsumers] = useState<number | ''>(-1);
    const [isPurgeChecked, setPurgeChecked] = useState<boolean>(false);
    const [configurations, setConfigurations] = useState<Array<{ name: string; value: string }>>([])

    const handleQueueNameChange = (name: string) => {
        setQueueName(name);
    };

    const handleQueueRoutingTypeChange = (name: string) => {
        setQueueRoutingType(name);
    };

    const handleCreateQueue = () => {
        var queueConfiguration: any = {
            "name": queueName,
            "address": info.address,
            "filter": filter,
            "routing-type": queueRoutingType.toUpperCase(),
            "durable": isDurableChecked,
            "max-consumers": maxConsumers,
            "purge-on-no-consumers": isPurgeChecked,
        }
        configurations.forEach(configuration => {
            const key = configuration.name
            if (key && key !== '') {
               // Object.assign(queueConfiguration, {key: configuration.value})
               queueConfiguration[key] = configuration.value
            }
        })

        log.info("Creating queue with configuration" + JSON.stringify(queueConfiguration) );
        artemisService.createQueue(info.broker.jolokia, info.broker.brokerMBeanName, JSON.stringify(queueConfiguration)).
        then(() => {
            eventService.notify({
                type: 'success',
                message: "Queue Succcesfully Created",
              })
        })
        .catch((error: string) => {
          eventService.notify({
            type: 'warning',
            message: error,
          })
        })
    };

    const handleDurableChange = (checked: boolean) => {
        setIsDurableChecked(checked)
    }

    const handleFilterChange = (filter: string) => {
        setFilter(filter);
    };

    const onMinus = () => {
    const newValue = (maxConsumers || 0) - 1;
        setMaxConsumers(newValue);
    };

    const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
        setMaxConsumers(value === '' ? value : +value);
    };

    const onPlus = () => {
    const newValue = (maxConsumers || 0) + 1;
        setMaxConsumers(newValue);
    };

    const handlePurgeChange = (checked: boolean) => {
        setPurgeChecked(checked)
    }

    type ConfigurationProps = {
        onConfigurationChange: (configurations: { name: string; value: string }[]) => void
      }
    const handleAddConfiguration = () => {
        const updatedConfigurations = [...configurations, { name: '', value: '' }]
        setConfigurations(updatedConfigurations)
    }
    const handleConfigurationChange = (index: number, newValue: string, event: React.FormEvent<HTMLInputElement>) => {
        const updatedConfigurations = [...configurations]
        updatedConfigurations[index] = { ...updatedConfigurations[index], [event.currentTarget.name]: newValue }
        setConfigurations(updatedConfigurations)
    }

    const handleRemoveConfiguration = (index: number) => {
        const updatedConfigurations = [...configurations]
        updatedConfigurations.splice(index, 1)
        setConfigurations(updatedConfigurations)
    }

    log.info(queueName.length)
    log.info(queueRoutingType.length)

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
            This page allows you to create a queue bound to the chosen address.
          </Text>
          <Text component='p'>
            if you want the queue to support JMS like queues, i.e. point to point, then choose anycast. If you
                    want your address to support JMS like topic subscriptions, publish/subscribe, then choose multicast.
          </Text>
          <Text> Selecting durable means that the queue will survive a restart of the broker.</Text>
          <Text component='p'>
            Adding a filter expression will mean that only messages that match that filter will be routed to this queue:
                    see <a href="https://activemq.apache.org/components/artemis/documentation/latest/filter-expressions.html" target="_blank">Filter Expressions</a>
          </Text>
          <Text>Max consumers will limit how many consumers can consume from a queue at any one time, -1 means no limit.</Text>
          <Text>
          Purge on no consumers means the queue will not start receiving messages until a consumer is attached.
                    When the last consumer is detached from the queue.  The queue is purged (its messages are removed)
                    and will not receive any more messages until a new consumer is attached.
          </Text>
        </ExpandableSection>
      )
    return (
        <><Title headingLevel="h2">Create Queue on Address {info.address}</Title>
        <ConnectHint/>
        <Form>
            <FormGroup label="Queue Name">
                <TextInput
                    isRequired
                    type="text"
                    id="queue-name"
                    name="queue-name"
                    value={queueName}
                    onChange={handleQueueNameChange} />
            </FormGroup>
            <FormGroup role="radiogroup" isInline fieldId="routing-typr" label="Routing Type">
                <Radio name="basic-inline-radio" label="Anycast" id="ANYCAST" onChange={() => handleQueueRoutingTypeChange("ANYCAST")} />
                <Radio name="basic-inline-radio" label="Multicast" id="MULTICAST" onChange={() => handleQueueRoutingTypeChange("MULTICAST")} />
            </FormGroup>
            <FormGroup label="Durable">
                <Checkbox
                    isChecked={isDurableChecked}
                    onChange={() => handleDurableChange(!isDurableChecked)}
                    id="durable" />
            </FormGroup>
            <FormGroup label="Filter">
                <TextInput
                    isRequired
                    type="text"
                    id="filter"
                    name="filter"
                    value={filter}
                    onChange={handleFilterChange} />
            </FormGroup>
            <FormGroup label="Max Consumers">
                <NumberInput
                    value={maxConsumers}
                    onMinus={onMinus}
                    onChange={onChange}
                    onPlus={onPlus}
                    inputName="input"
                    inputAriaLabel="number input"
                    minusBtnAriaLabel="minus"
                    plusBtnAriaLabel="plus"
                    allowEmptyInput />
            </FormGroup>
            <FormGroup label="Purge when no Consumers">
                <Checkbox
                    isChecked={isPurgeChecked}
                    onChange={() => handlePurgeChange(!isPurgeChecked)}
                    id="purge" />
            </FormGroup>
            <FormGroup>
                {/* eslint-disable-next-line react/jsx-no-undef */}
                <Button variant='link' onClick={handleAddConfiguration}>
                    Add Configuration
                </Button>
            </FormGroup>
            <FormGroup>
                {configurations.length > 0 && (
                    <Flex>
                        <FlexItem flex={{ default: 'flexNone', md: 'flex_2' }}>Name</FlexItem>
                        <FlexItem flex={{ default: 'flexNone', md: 'flex_2' }}>Value</FlexItem>
                        <FlexItem flex={{ default: 'flexNone', md: 'flex_1' }}></FlexItem>
                    </Flex>
                )}

                {configurations.length > 0 &&
                    configurations.map((header, index) => (
                        <Flex key={index}>
                            <FlexItem flex={{ default: 'flexNone', md: 'flex_2' }}>
                                <TextInput
                                    type='text'
                                    aria-label={'name-input-' + index}
                                    name='name'
                                    value={header.name}
                                    onChange={(newValue, event) => handleConfigurationChange(index, newValue, event)} />
                            </FlexItem>
                            <FlexItem flex={{ default: 'flexNone', md: 'flex_2' }}>
                                <TextInput
                                    type='text'
                                    name='value'
                                    aria-label={'value-input-' + index}
                                    value={header.value}
                                    onChange={(newValue, event) => handleConfigurationChange(index, newValue, event)} />
                            </FlexItem>
                            <FlexItem flex={{ default: 'flexNone', md: 'flex_1' }} span={4}>
                                <Button variant='link' onClick={() => handleRemoveConfiguration(index)} aria-label='Remove Header'>
                                    <TrashIcon />
                                </Button>
                            </FlexItem>
                        </Flex>
                    ))}
            </FormGroup>
            <ActionGroup>
                <Button variant="primary" onClick={() => handleCreateQueue()} isDisabled={queueName.length === 0 || queueRoutingType.length === 0}>Create Queue</Button>
            </ActionGroup>
        </Form></>
    )
}