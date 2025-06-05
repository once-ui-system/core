# Usage Examples for once-ui

## Basic Component Usage

```jsx
import { Button, Card, Heading } from 'once-ui';

export default function MyComponent() {
  return (
    <Card>
      <Heading>Hello World</Heading>
      <Button variant="primary">Click Me</Button>
    </Card>
  );
}
```

## Using the Icon System

The Once UI library implements a flexible icon provider system that works with Next.js server components:

```tsx
// In your layout or parent component
import { IconProvider } from 'once-ui';

export default function Layout({ children }) {
  return (
    <IconProvider iconConfig={{
      chevronLeft: "PiArrowLeft"
    }}>
      {children}
    </IconProvider>
  );
}
```

```tsx
// In your component
import { Icon } from 'once-ui';

export default function MyComponent() {
  return (
    <Icon name="loading" size="m" />
  );
}
```

## Using Hooks

```jsx
import { useDebounce } from 'once-ui';

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Use debouncedSearchTerm for API calls
  
  return (
    <input 
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
import { dev } from 'once-ui';

export default function MyComponent() {
  const handleClick = () => {
    dev.log('Button clicked');
    // Your logic here
  };
  
  return (
    <button onClick={handleClick}>Click Me</button>
  );
}
```
