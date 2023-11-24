import React, { useEffect, useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { log } from '../globals';
import { artemisService } from '../artemis-service';
import { ActiveSort, Filter, SortDirection } from '../table/ArtemisTable';

export type QueueSelectProps = {
  selectQueue: Function
}

export const QueueSelectInput: React.FunctionComponent<QueueSelectProps> = (queueSelectProps) => {


    const [queues, setQueues] = useState<any[]>()
    const [filter, setFilter] = useState<Filter>({
      column: 'name',
      operation: 'EQUALS',
      input: ''
    })

    useEffect(() => {
      log.info("rendering Messages table");
      const listData = async () => {
        var activeSort:ActiveSort  = {
          id: 'name',
          order: SortDirection.ASCENDING
        }
        var data: any = await artemisService.getQueues(1, 10, activeSort, filter);
        setQueues(JSON.parse(data).data);
        log.info(JSON.stringify(data));
      }
      listData();
  
    }, [filter])
  

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('');


    const onToggle = () => {
      setIsOpen(!isOpen);
    };

    const handleSelectQueueChange = (event: React.MouseEvent | React.ChangeEvent, value: string | SelectOptionObject) => {
      setIsOpen(false);
      var queueName: string = value as string;
      setSelected(queueName);
      queueSelectProps.selectQueue(queueName);
    }

    const clearSelection = () => {
      setSelected('');
      setIsOpen(false);
    };

    const customFilter = (e: React.ChangeEvent<HTMLInputElement> | null, value: string) => {
      if (!value) {
        return queues?.map((queue: any, index) => (
          <SelectOption key={index} value={queue.name}/>
        ));
      }

      var newFilter: Filter = {
        column: 'name',
        operation: 'CONTAINS',
        input: value}
        setFilter(newFilter);

      return queues?.map((queue: any, index) => (
              <SelectOption key={index} value={queue.name}/>
            ))
    };

    return (
      <div>
        <span id={"select-queues"} hidden>
          Select a Queue
        </span>
        <Select
          variant={SelectVariant.typeahead}
          menuAppendTo="parent"
          typeAheadAriaLabel="Select a Queue"
          onToggle={onToggle}
          onSelect={handleSelectQueueChange}
          onClear={clearSelection}
          onFilter={customFilter}
          selections={selected}
          isOpen={isOpen}
          aria-labelledby={"select-queue"}
          placeholderText="Type Queue Name"
        >
          
            {
              queues?.map((queue: any, index) => (
                <SelectOption key={index} value={queue.name}/>
              ))
            }
          
        </Select>
      </div>
    );
  
}