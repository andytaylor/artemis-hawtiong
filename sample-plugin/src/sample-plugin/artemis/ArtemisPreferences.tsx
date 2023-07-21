import { Button, CardBody, Checkbox, Dropdown, DropdownItem, DropdownToggle, Flex, FlexItem, Form, FormGroup, FormSection, Select, SelectOption, SelectOptionObject, SelectVariant, TextInput } from '@patternfly/react-core'
import React, { useState } from 'react'
import { artemisPreferencesService, ArtemisOptions } from './artemis-preferences-service'
import { Icon, Tooltip } from '@patternfly/react-core'
import { HelpIcon } from '@patternfly/react-icons'
import { log } from './globals'

export const ArtemisPreferences: React.FunctionComponent = () => (
  <CardBody>
    <Form isHorizontal>
      <ArtemisPreferencesForm />
    </Form>
  </CardBody>
)

export const TooltipHelpIcon = ({ tooltip }: { tooltip: string }) => (
  <Icon size='md'>
    <Tooltip content={tooltip}>
      <HelpIcon />
    </Tooltip>
  </Icon>
)


type FormatType = {
  id: string;
  description: string;
  index: number;
}


const ArtemisPreferencesForm: React.FunctionComponent = () => {
  const off: FormatType = {id: "off", description: "Off", index: 99};
  const text: FormatType = {id: "text", description: "Text", index: 16}
  const decimal: FormatType = {id: "decimal", description: "Decimal", index: 8}
  const hex: FormatType = {id: "hex", description: "Hex", index: 4}
  const decimaltext: FormatType = {id: "decimaltext", description: "Decimal and Text", index: 2}
  const hexttext: FormatType = {id: "hexttext", description: "Hex and Text", index: 1}

  const formats = [off, text, decimal, hex, decimaltext, hexttext];

  const [artemisPreferences, setArtemisPreferences] = useState(artemisPreferencesService.loadArtemisPreferences())
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);
  const format = formats.find(format => format.index === artemisPreferences.artemisBrowseBytesMessages);
  const [selectedFormat, setSelectedFormat] = useState(format?format.description:off.description);


  const updatePreferences = (value: string | number, key: keyof ArtemisOptions): void => {
    const updatedPreferences = { ...artemisPreferences, ...{ [key]: value } }

    artemisPreferencesService.saveArtemisPreferences(updatedPreferences)
    setArtemisPreferences(updatedPreferences)
  }



  const updateNumberValueFor = (key: keyof ArtemisOptions): ((value: string) => void) => {
    //Returning an arrow function to reduce boilerplate
    return (value: string) => {
      const intValue = parseInt(value)

      if (!intValue) return

      updatePreferences(intValue, key)
    }
  }

  const updateStringValueFor = (key: keyof ArtemisOptions): ((value: string) => void) => {
    return (value: string) => {
      if (!value) return

      updatePreferences(value, key)
    }
  }

  const handleToggle = () => {
    setDropdownOpen(!isDropdownOpen)
  }

  const handleFormatChange = (event: React.MouseEvent | React.ChangeEvent, value: string | SelectOptionObject) => {
    setSelectedFormat(value as string);
    setDropdownOpen(false);
    const format = formats.find(format => format.description === value);
    log.info("format=" + format?.index)
    if (format) {
      updatePreferences( format?.index,'artemisBrowseBytesMessages');
    }
  }

  log.info(selectedFormat)

  return (
    <FormSection title='Artemis' titleElement='h2'>
      <FormGroup
        hasNoPaddingTop
        label='Dead-letter address regex'
        fieldId='artemis-form-artemisDLQ'
        labelIcon={
          <TooltipHelpIcon tooltip='A regular expression to match one or more dead-letter addresses' />
        }
      >
        <TextInput
          id='artemis-input-artemisDLQ'
          type='text'
          value={artemisPreferences.artemisDLQ}
          onChange={updateStringValueFor('artemisDLQ')}
        />
      </FormGroup>
      <FormGroup
        hasNoPaddingTop
        label='Expiry address regex'
        fieldId='artemis-form-expiry'
        labelIcon={<TooltipHelpIcon tooltip='A regular expression to match one or more expiry addresses' />}
      >
        <TextInput
          id='artemis-input-expiry'
          type='text'
          value={artemisPreferences.artemisExpiryQueue}
          onChange={updateStringValueFor('artemisExpiryQueue')}
        />
      </FormGroup>
      <FormGroup>
        <Flex>
          <FlexItem flex={{ default: 'flexNone', md: 'flex_2' }}>
            {' '}
            <Select
              variant={SelectVariant.single}
              aria-label='Select Format'
              onToggle={handleToggle}
              onSelect={handleFormatChange}
              selections={selectedFormat}
              isOpen={isDropdownOpen}
            >
              <SelectOption label={off.id} value={off.description} />
              <SelectOption label={text.id} value={text.description} />
              <SelectOption label={decimal.id} value={decimal.description} />
              <SelectOption label={hex.id} value={hex.description} />
              <SelectOption label={decimaltext.id} value={decimaltext.description} />
              <SelectOption label={hexttext.id} value={hexttext.description} />
            </Select>
          </FlexItem>
        </Flex>
      </FormGroup>
  
    </FormSection>
  )
}
