# Usage Examples for @once-ui-system/core

## Using Components

```jsx
import { Button, Card, Heading } from '@once-ui-system/core';

export default function MyComponent() {
  return (
    <Card>
      <Heading>Hello World</Heading>
      <Button variant="primary">Click Me</Button>
    </Card>
  );
}
```

## Using Hooks

```jsx
import { Input, useDebounce } from '@once-ui-system/core';

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Use debouncedSearchTerm for API calls
  
  return (
    <Input 
      type="text" 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Using Utilities

```jsx
import { Button, dev } from '@once-ui-system/core';

export default function MyComponent() {
  const handleClick = () => {
    dev.log('Button clicked');
    // Your logic here
  };
  
  return (
    <Button onClick={handleClick}>Click Me</Button>
  );
}
```
