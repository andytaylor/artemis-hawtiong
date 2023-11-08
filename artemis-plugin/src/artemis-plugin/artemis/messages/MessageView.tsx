import React, { useEffect, useState } from 'react'
import { Title, TextArea, Divider, Button } from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { log } from '../globals';
import { artemisService } from '../artemis-service';

export type MessageProps = {
  currentMessage: Message,
  back: Function
}

export type Message = {
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
  userID: string,
  StringProperties?: any,
  BooleanProperties?: any,
  ByteProperties?: any,
  DoubleProperties?: any,
  FloatProperties?: any,
  LongProperties?: any,
  IntProperties?: any
  ShortProperties?: any
}

export const MessageView: React.FunctionComponent<MessageProps> = props => {

  const [currentMessage] = useState(props.currentMessage);
  const [messageBody, setMessageBody] = useState("");
  const [messageTextMode, setMessageTextMode] = useState("");

  useEffect(() => {
    log.info("rendering Message View");
    updateBodyText(currentMessage);
  }, [currentMessage])

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

  return (
    <>
    <Title headingLevel="h4">Message ID: {currentMessage.messageID}</Title>
    <Title headingLevel="h4">Displaying Body as : {messageTextMode}</Title>
    <TextArea autoResize isDisabled value={messageBody}></TextArea>
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
        <Tr>
          <Td>durable</Td>
          <Td>{currentMessage.address}</Td>
        </Tr>
        <Tr>
          <Td>expiration</Td>
          <Td>{artemisService.formatExpires(currentMessage.expiration, true)}</Td>
        </Tr>
        <Tr>
          <Td>largeMessage</Td>
          <Td>{"" + currentMessage.largeMessage}</Td>
        </Tr>
        <Tr>
          <Td>messageID</Td>
          <Td>{currentMessage.messageID}</Td>
        </Tr>
        <Tr>
          <Td>persistentSize</Td>
          <Td>{artemisService.formatPersistentSize(currentMessage.persistentSize)}</Td>
        </Tr>
        <Tr>
          <Td>priority</Td>
          <Td>{currentMessage.priority}</Td>
        </Tr>
        <Tr>
          <Td>protocol</Td>
          <Td>{currentMessage.protocol}</Td>
        </Tr>
        <Tr>
          <Td>redelivered</Td>
          <Td>{"" + currentMessage.redelivered}</Td>
        </Tr>
        <Tr>
          <Td>timestamp</Td>
          <Td>{artemisService.formatTimestamp(currentMessage.timestamp)}</Td>
        </Tr>
        <Tr>
          <Td>type</Td>
          <Td>{artemisService.formatType(currentMessage)}</Td>
        </Tr>
        <Tr>
          <Td>userID</Td>
          <Td>{currentMessage.userID}</Td>
        </Tr>
      </Tbody>
      <Divider/>
      <Title headingLevel="h4">Properties</Title>
      <TableComposable variant="compact" aria-label="Properties Table">
      <Thead>
        <Tr>
          <Th>key</Th>
          <Th>value</Th>
          <Th>type</Th>
        </Tr>
      </Thead>
      <Tbody>
      {
          getProps(currentMessage.StringProperties, "String")
      }
      {
          getProps(currentMessage.BooleanProperties, "Boolean")
      }
      {
          getProps(currentMessage.ByteProperties, "Byte")
      }
      {
          getProps(currentMessage.DoubleProperties, "Double")
      }
      {
          getProps(currentMessage.FloatProperties, "Float")
      }
      {
          getProps(currentMessage.IntProperties, "Integer")
      }
      {
          getProps(currentMessage.LongProperties, "Long")
      }
      {
          getProps(currentMessage.ShortProperties, "Short")
      }
      </Tbody>
      </TableComposable>
    </TableComposable>
    <Button onClick={() => props.back(0)}>Queues</Button>
    <Button onClick={() => props.back(1)}>Browse</Button>
    </>
  )
}

function getProps(properties: any, type:string): React.ReactNode {
  if(properties) {
    return Object.keys(properties).map((key, index) => {
      return (
        <>
          <Tr>
            <Td>{key}</Td>
            <Td>{"" + properties[key]}</Td>
            <Td>{type}</Td>
          </Tr>
        </>
      );
    }
    )
  } else {
    return''
  };
}
