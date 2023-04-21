import React, { useEffect, useState } from 'react'
import {
  Button,
  DataList,
  DataListCheck,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListItemCells,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Modal,
  OptionsMenu,
  OptionsMenuToggle,
  Pagination,
  PaginationVariant,
  Text,
  TextContent,
  Select,
  SelectVariant,
  OptionsMenuItemGroup,
  OptionsMenuItem,
  OptionsMenuSeparator,
  SelectOption,
  SearchInput,
  SelectOptionObject
} from '@patternfly/react-core';
import SortAmountDownIcon from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import { TableComposable, Thead, Tr, Th, Tbody, Td, Caption } from '@patternfly/react-table';
import { log } from '../globals'
import { IJolokiaService } from '@hawtio/react';

export type Column = {
  id: string
  name: string
  visible: boolean
  sortable: boolean
  filterable: boolean
}

export enum SortDirection {
    ASCENDING = 'asc',
    DESCENDING = 'desc'
}

export type ActiveSort = {
  id: string
  order: SortDirection
}

export type Filter = {
  column: string
  operation: string
  input: string }

export type TableData = {
  brokerMBeanName: string,
  loaded: boolean,
  jolokia: IJolokiaService,
  allColumns: Column[],
  getData: Function
}

export const ArtemisTable: React.FunctionComponent<TableData> = broker => {

  const operationOptions = [
    {id: 'EQUALS', name: 'Equals'},
    {id: 'CONTAINS', name: 'Contains'},
    {id: 'NOT_CONTAINS', name: 'Does Not Contain'},
    {id: 'GREATER_THAN', name: 'Greater Than'},
    {id: 'LESS_THAN', name: 'Less Than'}
  ]

  const initialActiveSort: ActiveSort = {
    id: broker.allColumns[0].id,
    order: SortDirection.ASCENDING
  }
  const [rows, setRows] = useState([])
  const [resultsSize, setresultsSize] = useState(0)
  const [columns, setColumns] = useState(broker.allColumns);
  const [activeSort, setActiveSort] = useState(initialActiveSort);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const initialFilter: Filter = {
    column: columns[0].id,
    operation: operationOptions[0].id,
    input: ''
  }
  const [filter, setFilter] = useState(initialFilter);
  const [filterColumnStatusSelected, setFilterColumnStatusSelected] = useState(columns[0].name);
  const [filterColumnOperationSelected, setFilterColumnOperationSelected] = useState(operationOptions[0].name);
  const [inputValue, setInputValue] = useState('');
  const [filterColumnStatusIsExpanded, setFilterColumnStatusIsExpanded] = useState(false);
  const [filterColumnOperationIsExpanded, setFilterColumnOperationIsExpanded] = useState(false);

  const onFilterColumnStatusToggle = (isExpanded: boolean) => {
    setFilterColumnStatusIsExpanded(isExpanded);
  };

  const onFilterColumnOperationToggle = (isExpanded: boolean) => {
    setFilterColumnOperationIsExpanded(isExpanded);
  };


  useEffect(() => {
    const listData = async () => {
      var data = await broker.getData(page, perPage, activeSort, filter);
      log.info("data="+JSON.stringify(data));
      setRows(data.data);
      setresultsSize(data.count);
    }
    listData();
   
  }, [columns, resultsSize])

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onSave = () => {
    setIsModalOpen(!isModalOpen);
  };

  const selectAllColumns = () => {
    const updatedColumns = [...columns]
    updatedColumns.map((column, columnIndex) => {
      column.visible = true;
    })
    setColumns(updatedColumns);
  };

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onInputChange = (newValue: string) => {
    log.info(newValue)
    setInputValue(newValue);
  };

  const unfilterAllData = () => {

  };

  const updateColumnStatus = (index: number, column: Column) => {
    const updatedColumns = [...columns];
    updatedColumns[index].visible = !columns[index].visible;
    setColumns(updatedColumns);
  }

const updateActiveSort = (id: string, order: SortDirection) => {
  log.info(id)
  log.info(order)
  const updatedActiveSort: ActiveSort = {
    id: id,
    order: order
  };
  setActiveSort(updatedActiveSort)
}

const onFilterColumnStatusSelect = (
  _event: React.MouseEvent | React.ChangeEvent,
  selection: string | SelectOptionObject
) => {
  setFilterColumnStatusSelected(selection as string);
  setFilterColumnStatusIsExpanded(false);
};

const onFilterColumnOperationSelect = (
  _event: React.MouseEvent | React.ChangeEvent,
  selection: string | SelectOptionObject
) => {
  const operation = operationOptions.find(operation => operation.name === selection);
  log.info(selection)
  log.info(operation?.name)
  if (operation) {
    setFilterColumnOperationSelected(selection as string);
  }
  setFilterColumnOperationIsExpanded(false);
};

const handleFilterColumn = (column: Column) => {
  log.info(column.id, column.name);
}

const clearStatusSelection = () => {
  setFilterColumnStatusSelected('');
  setFilterColumnStatusIsExpanded(false);
};

const onPerPageSelect = (
  _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
  newPerPage: number,
  newPage: number
) => {
  setPerPage(newPerPage);
  setPage(newPage);
};

const handleSetPage =(_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
  setPage(newPage);
};

const handlePerPageSelect = ( _event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number, newPage: number ) => {
  setPerPage(newPerPage);
};

const getKeyByValue = (producer: never, columnName: string) => {
  //const key = Object.keys(producer).find(key => producer[key] === columnName);
  return producer[columnName];
}

const applyFilter = () => {
  const operation = operationOptions.find(operation => operation.name === filterColumnOperationSelected);
  const column = columns.find(column => column.name === filterColumnStatusSelected);
 // log.info("filtering with " + filterColumnStatusSelected + " " + filterColumnOperationSelected + ' ' + inputValue) + ' ' + operation;
  if (operation && column) {
    setFilter({column: column.id, operation: operation.id, input: inputValue});
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
        isOpen={isModalOpen}
        variant="small"
        description={
          <TextContent>
            <Text>Selected categories will be displayed in the table.</Text>
            <Button isInline onClick={selectAllColumns} variant="link">
              Select all
            </Button>
          </TextContent>
        }
        onClose={handleModalToggle}
        actions={[
          <Button key="save" variant="primary" onClick={onSave}>
            Save
          </Button>,
          <Button key="close" variant="secondary" onClick={handleModalToggle}>
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
          <ToolbarItem>
            <OptionsMenu
              id="options-menu-multiple-options-example"
              menuItems={[
                <OptionsMenuItemGroup key="first group" aria-label="Sort column">
                  {Object.values(broker.allColumns).map((column, columnIndex) => (
                    <OptionsMenuItem
                      key={column.id}
                      isSelected={activeSort.id === column.id}
                      onSelect={() => {
                        updateActiveSort(column.id, activeSort.order)
                      }}
                    >
                      {column.name}
                    </OptionsMenuItem>
                  ))}
                </OptionsMenuItemGroup>,
                <OptionsMenuSeparator key="separator" />,
                <OptionsMenuItemGroup key="second group" aria-label="Sort direction">
                  <OptionsMenuItem
                    onSelect={() => updateActiveSort(activeSort.id, SortDirection.ASCENDING)}
                    isSelected={activeSort.order === SortDirection.ASCENDING}
                    id="ascending"
                    key="ascending"
                  >
                    Ascending
                  </OptionsMenuItem>
                  <OptionsMenuItem
                    onSelect={() => updateActiveSort(activeSort.id, SortDirection.DESCENDING)}
                    isSelected={activeSort.order === SortDirection.DESCENDING}
                    id="descending"
                    key="descending"
                  >
                    Descending
                  </OptionsMenuItem>
                </OptionsMenuItemGroup>
              ]}
              isOpen={isSortDropdownOpen}
              toggle={
                <OptionsMenuToggle
                  hideCaret
                  onToggle={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  toggleTemplate={<SortAmountDownIcon />}
                />
              }
              isPlain
              isGrouped
            />
          </ToolbarItem>
          <ToolbarItem variant="search-filter">
          <Select
            variant={SelectVariant.single}
            aria-label="Select Input"
            onToggle={onFilterColumnStatusToggle}
            onSelect={onFilterColumnStatusSelect}
            selections={filterColumnStatusSelected}
            isOpen={filterColumnStatusIsExpanded}
          >
            {columns.map((column, index) => (
              <SelectOption key={column.id} value={column.name}/>
            ))}
          </Select>
          </ToolbarItem>
          <ToolbarItem variant="search-filter">
          <Select
            variant={SelectVariant.single}
            aria-label="Select Input"
            onToggle={onFilterColumnOperationToggle}
            onSelect={onFilterColumnOperationSelect}
            selections={filterColumnOperationSelected}
            isOpen={filterColumnOperationIsExpanded}
          >
            {operationOptions.map((column, index) => (
              <SelectOption key={column.id} value={column.name}/>
            ))}
          </Select>
          </ToolbarItem>
          <ToolbarItem variant="search-filter">
          <SearchInput
            aria-label="With filters example search input"
            onChange={(value, _event) => onInputChange(value as unknown as string)}
            value={inputValue}
            onClear={() => {
              onInputChange(''); applyFilter();
            }}
          />
          </ToolbarItem>
          <ToolbarItem>
            <Button onClick={applyFilter}>Search</Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant='link' onClick={handleModalToggle}>Manage Columns</Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </React.Fragment>
  );   

  return (
    <React.Fragment>
      {toolbarItems}
      <TableComposable variant="compact" aria-label="Column Management Table">
      <Thead>
        <Tr >
          {columns.map((column, id) => {
              if(column.visible) {
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
              if(column.visible) {
                return <Td key={id}>{getKeyByValue(row, column.id)}</Td>
              } else return ''
            }
          )}
            </>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
     {renderPagination(PaginationVariant.bottom)}
     {renderModal()}
    </React.Fragment>
  );
};


