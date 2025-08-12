"use client";

import React, { useState } from "react";
import { 
  Button,
  DropdownWrapper,
  Flex, 
  Text,
  Column,
  Option,
  Icon,
  Input
} from "@once-ui-system/core";

export function BasicDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  
  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" }
  ];
  
  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
  };
  
  return (
    <DropdownWrapper
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button 
          variant="secondary" 
          suffixIcon="chevronDown"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected ? options.find(opt => opt.value === selected)?.label : "Select an option"}
        </Button>
      }
      dropdown={
        <Column minWidth={10} padding="4" gap="2">
          {options.map((option) => (
            <Option
              key={option.value}
              label={option.label}
              value={option.value}
              selected={option.value === selected}
              onClick={handleSelect}
            />
          ))}
        </Column>
      }
    />
  );
}

export function DropdownWithIcons() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  
  const options = [
    { label: "Edit", value: "edit", icon: "edit" },
    { label: "Duplicate", value: "duplicate", icon: "copy" },
    { label: "Delete", value: "delete", icon: "trash", danger: true }
  ];
  
  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
  };
  
  return (
    <DropdownWrapper
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button 
          variant="tertiary" 
          suffixIcon="chevronDown"
          onClick={() => setIsOpen(!isOpen)}
        >
          Actions
        </Button>
      }
      dropdown={
        <Column fillWidth padding="4" gap="2">
          {options.map((option) => (
            <Option
              key={option.value}
              label={option.label}
              value={option.value}
              hasPrefix={<Icon name={option.icon as any} size="s" />}
              danger={option.danger}
              selected={option.value === selected}
              onClick={handleSelect}
            />
          ))}
        </Column>
      }
    />
  );
}

export function CustomPositionDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  
  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" }
];
  
  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
  };
  
  return (
    <DropdownWrapper
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="right-start"
      trigger={
        <Button 
          onClick={() => setIsOpen(!isOpen)}
        >
          Open right
        </Button>
      }
      dropdown={
        <Column fillWidth padding="4" gap="2">
          {options.map((option) => (
            <Option
              key={option.value}
              label={option.label}
              value={option.value}
              selected={option.value === selected}
              onClick={handleSelect}
            />
          ))}
        </Column>
      }
    />
  );
}

export function SearchableDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const options = [
    { label: "Apple", value: "apple", description: "Fruit" },
    { label: "Banana", value: "banana", description: "Fruit" },
    { label: "Carrot", value: "carrot", description: "Vegetable" },
    { label: "Broccoli", value: "broccoli", description: "Vegetable" },
    { label: "Orange", value: "orange", description: "Fruit" }
  ];
  
  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
  };
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DropdownWrapper
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      minHeight={200}
      trigger={
        <Button 
          variant="secondary" 
          suffixIcon="chevronDown"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected ? options.find(opt => opt.value === selected)?.label : "Search items"}
        </Button>
      }
      dropdown={
        <Column fillWidth minWidth={12}>
          <Column padding="4" fillWidth position="sticky" top="0" background="page" zIndex={1}>
            <Input
              height="s"
              id="search-dropdown"
              placeholder="Search"
              hasPrefix={<Icon name="search" size="xs" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </Column>
          <Column fillWidth gap="2" padding="4">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Option
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  description={option.description}
                  selected={option.value === selected}
                  onClick={handleSelect}
                />
              ))
            ) : (
              <Flex fillWidth center paddingX="16" paddingY="32">
                <Text>No results found</Text>
              </Flex>
            )}
          </Column>
        </Column>
      }
    />
  );
}
