import React from 'react';
import { useCombobox } from 'downshift';

interface Item {
  id: string;
  name: string;
}

interface AutocompleteProps {
  items: Item[];
  onSelect: (item: Item) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ items, onSelect }) => {
    const { isOpen, getMenuProps, getInputProps, getItemProps } = useCombobox({
      items,
      itemToString: item => (item ? item.name : ''),
      onSelectedItemChange: ({ selectedItem }) => {
        console.log(`Autocomplete onSelectedItemChange: Item selected: ${selectedItem?.name}`);
        if (selectedItem) {
          onSelect(selectedItem);
        }
      },
    });

  // Debugging for getMenuProps
  const menuProps = getMenuProps();
  console.log('getMenuProps return value:', menuProps);

  return (
    <div>
      <input {...getInputProps()} />
      <ul {...menuProps} style={{ display: isOpen ? 'block' : 'none' }}>
        {items.map((item, index) => (
          <li key={item.id} {...getItemProps({ item, index })}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Autocomplete;
