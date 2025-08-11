"use client";

import React, { useState } from "react";
import { Checkbox, Column } from "@once-ui-system/core";

// Indeterminate checkbox example with interactive child checkboxes
export function IndeterminateCheckboxExample() {
  const [items, setItems] = useState([
    { id: 1, label: 'Item 1', checked: true },
    { id: 2, label: 'Item 2', checked: false },
    { id: 3, label: 'Item 3', checked: true }
  ]);
  
  // Calculate parent checkbox state
  const allChecked = items.every(item => item.checked);
  const someChecked = items.some(item => item.checked);
  const isIndeterminate = someChecked && !allChecked;
  
  // Toggle all items
  const toggleAll = () => {
    const newCheckedState = !allChecked;
    setItems(items.map(item => ({
      ...item,
      checked: newCheckedState
    })));
  };
  
  // Toggle individual item
  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };
  
  return (
    <Column gap="16">
      <Checkbox
        label="Select all items"
        isChecked={allChecked || isIndeterminate}
        isIndeterminate={isIndeterminate}
        onToggle={toggleAll}
      />
      
      <Column gap="8" paddingLeft="8">
        {items.map(item => (
          <Checkbox
            key={item.id}
            label={item.label}
            isChecked={item.checked}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </Column>
    </Column>
  );
}
