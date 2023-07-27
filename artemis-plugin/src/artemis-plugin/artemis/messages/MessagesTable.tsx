import React, { useEffect, useState } from 'react'
import { Column } from '../table/ArtemisTable';
import { artemisService } from '../artemis-service';
import { Toolbar, ToolbarContent, ToolbarItem, Text, SearchInput, Button, PaginationVariant, Pagination, DataList, DataListCell, DataListCheck, DataListItem, DataListItemCells, DataListItemRow, Modal, TextContent, Title, TextArea } from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody, Td, ActionsColumn, IAction } from '@patternfly/react-table';
import { log } from '../globals';
import { createQueueObjectName } from '../util/jmx';

export type MessageProps = {
  address: string,
  queue: string,
  routingType: string
}

type Message = {
  messageID: string, 
  text?: string, 
  BodyPreview?: number[],
  address: string,
  durable: boolean,
  expiration: number,
  largeMessage: boolean,
  persistentSize: number,
  priority: number,
  protocol: string,
  redelivered: boolean,
  timestamp: number,
  type: number,
  userID: string
}

export const MessagesTable: React.FunctionComponent<MessageProps> = props => {
  const allColumns: Column[] = [
    { id: 'messageID', name: 'Message ID', visible: true, sortable: true, filterable: true },
    { id: 'type', name: 'Type', visible: true, sortable: true, filterable: true },
    { id: 'durable', name: 'Durable', visible: true, sortable: true, filterable: true },
    { id: 'priority', name: 'Priority', visible: true, sortable: true, filterable: true },
    { id: 'timestamp', name: 'Timestamp', visible: true, sortable: true, filterable: true },
    { id: 'expiration', name: 'Expires', visible: true, sortable: true, filterable: true },
    { id: 'redelivered', name: 'Redelivered', visible: true, sortable: true, filterable: true },
    { id: 'largeMessage', name: 'Large', visible: true, sortable: true, filterable: true },
    { id: 'persistentSize', name: 'Persistent Size', visible: true, sortable: true, filterable: true },
    { id: 'userID', name: 'User ID', visible: false, sortable: true, filterable: false },
    { id: 'validatedUser', name: 'Validated User', visible: false, sortable: true, filterable: false },
    { id: 'originalQueue', name: 'Original Queue', visible: false, sortable: true, filterable: false },
  ];

  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([])
  const [perPage, setPerPage] = useState(10);
  const [columns, setColumns] = useState(allColumns);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [resultsSize, setresultsSize] = useState(0);
  const [messagesView, setMessagesView] = useState(true);
  const initialMessage: Message = {
    messageID: '',
    address: '',
    durable: false,
    expiration: 0,
    largeMessage: false,
    persistentSize: 0,
    priority: 0,
    protocol: '',
    redelivered: false,
    timestamp: 0,
    type: 0,
    userID: ''
  };
  const [currentMessage, setCurrentMessage] = useState(initialMessage);
  const [messageBody, setMessageBody] = useState("");
  const [messageTextMode, setMessageTextMode] = useState("");
  const MS_PER_SEC = 1000;
  const MS_PER_MIN = 60 * MS_PER_SEC;
  const MS_PER_HOUR = 60 * MS_PER_MIN;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const typeLabels = ["DEFAULT", "1", "object", "text", "bytes", "map", "stream", "embedded"];


 

  useEffect(() => {
    log.info("rendering Messages table");
    const listData = async () => {
      var data = await listMessages();
      setRows(data.data);
      setresultsSize(data.count);
      log.info(JSON.stringify(data));
    } 
    const listMessages = async (): Promise<any> => {
      const brokerObjectname = await artemisService.getBrokerObjectName();
      const queueMBean: string = createQueueObjectName(brokerObjectname, props.address, props.routingType, props.queue);
      const response = await artemisService.getMessages(queueMBean, page, perPage, filter);
      return response;
    }
    if (messagesView) {
      listData();
    }

  }, [columns, currentMessage, messagesView, props.address, props.routingType, props.queue, page, perPage, filter])

  const handleSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number, newPage: number) => {
    setPerPage(newPerPage);
  };

  const handleColumnsModalToggle = () => {
    setColumnsModalOpen(!columnsModalOpen);
  };


  const onFilterChange = (newValue: string) => {
    setFilter(newValue);
  };

  const filterMessages = () => {

  };

  const getRowActions = (row: any, rowIndex: number): IAction[] => {
    return [
      {
        title: 'delete',
        onClick: () => {
          console.log(`clicked on Some action, on row delete ` + row.name);
        }
      },
      {
        title: 'view',
        onClick: () => {
          console.log(`clicked on Another action, on row browse ` + row.name);
          setCurrentMessage(rows[rowIndex]);
          updateBodyText(rows[rowIndex]);
          setMessagesView(false);
        }

      }
    ]
  };

  const selectAllColumns = () => {
    const updatedColumns = [...columns]
    updatedColumns.map((column) => {
      column.visible = true;
      return true;
    })
    setColumns(updatedColumns);
  };

  const onSave = () => {
    setColumnsModalOpen(!columnsModalOpen);
  };

  const updateColumnStatus = (index: number, column: Column) => {
    const updatedColumns = [...columns];
    updatedColumns[index].visible = !columns[index].visible;
    setColumns(updatedColumns);
  }

  const getKeyByValue = (message: any, columnID: string): string => {
    if (columnID === "type") {
      const idx: number = message[columnID];
      return typeLabels[idx];
    }
    if (columnID === "timestamp") {
      const timestamp: number = message[columnID];
      return formatTimestamp(timestamp);
    }
    if (columnID === "expiration") {
      const timestamp: number = message[columnID];
      return formatExpires(timestamp, false);
    }
    if (columnID === "persistentSize") {
      const size: number = message[columnID];
      return formatPersistentSize(size);
    }
    if (columnID === "originalQueue" && message["StringProperties"]) {
      const originalQueue = message["StringProperties"]._AMQ_ORIG_QUEUE;
      return originalQueue?originalQueue:"";
    }
    return message[columnID]?"" + message[columnID]: "";
  }

  const formatExpires = (timestamp: number, addTimestamp: boolean): string => {
    if (isNaN(timestamp) || typeof timestamp !== "number") {
      return "" + timestamp;
    }
    if (timestamp === 0) {
      return "never";
    }
    var expiresIn = timestamp - Date.now();
    if (Math.abs(expiresIn) < MS_PER_DAY) {
      var duration = expiresIn < 0 ? -expiresIn : expiresIn;
      var hours = pad2(Math.floor((duration / MS_PER_HOUR) % 24));
      var mins = pad2(Math.floor((duration / MS_PER_MIN) % 60));
      var secs = pad2(Math.floor((duration / MS_PER_SEC) % 60));
      var ret;
      if (expiresIn < 0) {
        // "HH:mm:ss ago"
        ret = hours + ":" + mins + ":" + secs + " ago";
      } else {
        // "in HH:mm:ss"
        ret = "in " + hours + ":" + mins + ":" + secs;
      }
      if (addTimestamp) {
        ret += ", at " + formatTimestamp(timestamp);
      }
      return ret;
    }
    return formatTimestamp(timestamp);
  }

  const formatTimestamp = (timestamp: number): string => {
    if (isNaN(timestamp) || typeof timestamp !== "number") {
      return "" + timestamp;
    }
    if (timestamp === 0) {
      return "N/A";
    }
    var d = new Date(timestamp);
    // "yyyy-MM-dd HH:mm:ss"
    //add 1 to month as getmonth returns the position not the actual month
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  }

  const formatPersistentSize = (bytes: number) => {
    if(isNaN(bytes) || typeof bytes !== "number" || bytes < 0) return "N/A";
    if(bytes < 10240) return bytes.toLocaleString() + " Bytes";
    if(bytes < 1048576) return (bytes / 1024).toFixed(2) + " KiB";
    if(bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MiB";
    return (bytes / 1073741824).toFixed(2) + " GiB";
  }

  const pad2 = (value: number) => {
    return (value < 10 ? '0' : '') + value;
  }

  const updateBodyText = (currentMessage: Message): void =>  {
    log.debug("loading message:" + currentMessage);
        var body: string = "";
    if (currentMessage.text) {
       body = currentMessage.text;
        var lenTxt = "" + body.length;
        setMessageTextMode("text (" + lenTxt + " chars)");
        setMessageBody(body);
    } else if (currentMessage.BodyPreview) {
        var code = Number(localStorage["ArtemisBrowseBytesMessages"] || "1");
        setMessageTextMode("bytes (turned off)");
        var len = 0;
        if (code !== 99) {
            var bytesArr: string[] = [];
            var textArr: string[] = [];
            currentMessage.BodyPreview.forEach(function(b: number) {
                if (code === 1 || code === 2 || code === 16) {
                    // text
                    textArr.push(String.fromCharCode(b));
                }
                if (code === 1 || code === 4) {
                    var unsignedByte = b & 0xff;

                    if (unsignedByte < 16) {
                        // hex and must be 2 digit so they space out evenly
                        bytesArr.push('0' + unsignedByte.toString(16));
                    } else {
                        bytesArr.push(unsignedByte.toString(16));
                    }
                } else {
                    // just show as is without spacing out, as that is usually more used for hex than decimal
                    var s = b.toString(10);
                    bytesArr.push(s);
                }
            });
            var bytesData = bytesArr.join(" ");
            var textData = textArr.join("");
            if (code === 1 || code === 2) {
                // bytes and text
                len = currentMessage.BodyPreview.length;
                lenTxt = "" + textArr.length;
                body = "bytes:\n" + bytesData + "\n\ntext:\n" + textData;
               setMessageTextMode("bytes (" + len + " bytes) and text (" + lenTxt + " chars)");
            } else if (code === 16) {
                // text only
                len = currentMessage.BodyPreview.length;
                lenTxt = "" + textArr.length;
                body = "text:\n" + textData;
                setMessageTextMode("text (" + lenTxt + " chars)");
            } else {
                // bytes only
                len = currentMessage.BodyPreview.length;
                body = bytesData;
                setMessageTextMode("bytes (" + len + " bytes)");
            }
        }
        setMessageBody(body);
    } else {
      setMessageTextMode("unsupported");
      setMessageBody("Unsupported message body type which cannot be displayed by hawtio");
    }
}

  const renderPagination = (variant: PaginationVariant | undefined) => (
    <Pagination
      itemCount={resultsSize}
      page={page}
      perPage={perPage}
      onSetPage={handleSetPage}
      onPerPageSelect={handlePerPageSelect}
      variant={variant}
      titles={{
        paginationTitle: `${variant} pagination`
      }}
    />
  );

  const renderModal = () => {
    return (
      <Modal
        title="Manage columns"
        isOpen={columnsModalOpen}
        variant="small"
        description={
          <TextContent>
            <Text>Selected categories will be displayed in the table.</Text>
            <Button isInline onClick={selectAllColumns} variant="link">
              Select all
            </Button>
          </TextContent>
        }
        onClose={handleColumnsModalToggle}
        actions={[
          <Button key="save" variant="primary" onClick={onSave}>
            Save
          </Button>,
          <Button key="close" variant="secondary" onClick={handleColumnsModalToggle}>
            Cancel
          </Button>
        ]}
      >
        <DataList aria-label="Table column management" id="table-column-management" isCompact>
          {columns.map((column, id) => (
            <DataListItem key={`table-column-management-${column.id}`} aria-labelledby={`table-column-management-${column.id}`}>
              <DataListItemRow>
                <DataListCheck
                  aria-labelledby={`table-column-management-item-${column.id}`}
                  checked={column.visible}
                  name={`check-${column.id}`}
                  id={`check-${column.id}`}
                  onChange={checked => updateColumnStatus(id, column)}
                />
                <DataListItemCells
                  dataListCells={[
                    <DataListCell id={`table-column-management-item-${column.id}`} key={`table-column-management-item-${column.id}`}>
                      <label htmlFor={`check-${column.id}`}>{column.name}</label>
                    </DataListCell>
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      </Modal>
    );
  };

  const toolbarItems = (
    <React.Fragment>
      <Toolbar id="toolbar">
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <SearchInput
              aria-label="With filters example search input"
              onChange={(value, _event) => onFilterChange(value as unknown as string)}
              value={filter}
              onClear={() => {
                onFilterChange('');
              }}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button onClick={filterMessages}>Search</Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant='link' onClick={handleColumnsModalToggle}>Manage Columns</Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </React.Fragment>
  );

  const MessagesView: React.FunctionComponent = () => {
    return (
      <React.Fragment>
      {toolbarItems}
      <TableComposable variant="compact" aria-label="Column Management Table">
        <Thead>
          <Tr >
            {columns.map((column, id) => {
              if (column.visible) {
                return <Th key={id}>{column.name}</Th>
              } else return ''
            }
            )}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              <>
                {columns.map((column, id) => {
                  if (column.visible) {
                    const text = getKeyByValue(row, column.id);
                    return <Td key={id}>{text}</Td>
                  } else return ''
                }
                )}
                <td>
                  <ActionsColumn
                    items={getRowActions(row, rowIndex)}
                  />
                </td>
              </>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
      {renderPagination(PaginationVariant.bottom)}
      {renderModal()}
    </React.Fragment>
    )
  };

  const MessageView: React.FunctionComponent = () => {
    return (
      <>
      <Title headingLevel="h4">Message ID: {currentMessage.messageID}</Title>
      <Title headingLevel="h4">Displaying Body as : {messageTextMode}</Title>
      <TextArea autoResize>{messageBody}</TextArea>
      <Title headingLevel="h4">Headers</Title>
      <TableComposable variant="compact" aria-label="Headers Table">
        <Thead>
          <Tr>
            <Th>key</Th>
            <Th>value</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>address</Td>
            <Td>{currentMessage.address}</Td>
          </Tr>
        </Tbody>
      </TableComposable>
      </>
    )
  };
  return (
    <>
      {messagesView &&
        <MessagesView/>
      }
      {!messagesView &&
        <MessageView/>
      }
    </>
  );
}