# Alternatives to eslint-disable in React Components

## The Problem

The current components use `eslint-disable` because they need to sync local state with props in `useEffect`, which triggers the `react-hooks/set-state-in-effect` and `react-hooks/exhaustive-deps` rules.

## Why This Happens

1. **RangeSlider**: Maintains local state for dragging + needs to sync with props when not dragging
2. **SearchBar/V2**: Maintains local state for input + needs to sync with URL/parent changes

## Better Alternatives

### Option 1: Controlled Component Pattern (Move State Up)

**Best for: SearchBar components**

Instead of managing state in the component, make it fully controlled:

```tsx
// Parent manages ALL state
function ParentComponent() {
  const [searchValue, setSearchValue] = useState('');
  const debouncedValue = useDebounce(searchValue, 300);
  
  // Parent handles URL sync
  useEffect(() => {
    updateURL(debouncedValue);
  }, [debouncedValue]);
  
  return <ControlledSearchBar value={searchValue} onChange={setSearchValue} />;
}

// Component is purely controlled - no state sync needed
function ControlledSearchBar({ value, onChange }) {
  return (
    <input 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
    />
  );
}
```

**Pros:**
- No state sync issues
- Single source of truth
- No eslint-disable needed

**Cons:**
- Parent must handle all logic
- More complex parent component

---

### Option 2: Key Prop Reset Pattern

**Best for: RangeSlider when values change significantly**

Use React's `key` prop to remount component when props change significantly:

```tsx
// Parent decides when to reset via key
<RangeSlider
  key={`${min}-${max}-${value[0]}-${value[1]}`}
  min={min}
  max={max}
  value={value}
  onChange={onChange}
/>
```

Inside component:
```tsx
function RangeSlider({ min, max, value, onChange }) {
  // Initialize once - never sync
  const [localMin] = useState(value[0] ?? min);
  const [localMax] = useState(value[1] ?? max);
  
  // No useEffect needed! Component remounts when key changes
}
```

**Pros:**
- No useEffect synchronization
- Clean component code
- No eslint-disable

**Cons:**
- Remounting can be expensive
- Loses component state on reset

---

### Option 3: useReducer with Action Types

**Best for: Complex state management**

```tsx
type Action =
  | { type: 'START_DRAG'; min: number; max: number }
  | { type: 'UPDATE_MIN'; value: number }
  | { type: 'UPDATE_MAX'; value: number }
  | { type: 'END_DRAG' }
  | { type: 'SYNC_PROPS'; min: number; max: number; isDragging: boolean };

function reducer(state, action) {
  switch (action.type) {
    case 'SYNC_PROPS':
      // Only sync when not dragging
      return action.isDragging ? state : {
        ...state,
        min: action.min,
        max: action.max,
      };
    case 'UPDATE_MIN':
      return { ...state, min: action.value };
    // ... other cases
  }
}

function RangeSlider({ value, min, max }) {
  const [state, dispatch] = useReducer(reducer, {
    min: value[0] ?? min,
    max: value[1] ?? max,
    isDragging: false,
  });
  
  // Sync props - but now it's an explicit action
  useEffect(() => {
    dispatch({
      type: 'SYNC_PROPS',
      min: value[0] ?? min,
      max: value[1] ?? max,
      isDragging: state.isDragging,
    });
  }, [value, min, max, state.isDragging]);
}
```

**Pros:**
- Clear state transitions
- Easier to test
- Still needs useEffect but logic is more explicit

**Cons:**
- More boilerplate
- Still has setState in effect

---

### Option 4: useSyncExternalStore (Advanced)

**Best for: When you need ultimate control**

```tsx
function useControlledValue<T>(propValue: T, isDragging: boolean) {
  const dragValueRef = useRef<T>(propValue);
  
  const subscribe = useCallback(() => {
    return () => {}; // No-op, we control updates
  }, []);
  
  const getSnapshot = useCallback(() => {
    return isDragging ? dragValueRef.current : propValue;
  }, [propValue, isDragging]);
  
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function RangeSlider({ value, min, max }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragMinRef = useRef(value[0] ?? min);
  const dragMaxRef = useRef(value[1] ?? max);
  
  // No state sync in effects!
  const localMin = isDragging ? dragMinRef.current : (value[0] ?? min);
  const localMax = isDragging ? dragMaxRef.current : (value[1] ?? max);
}
```

**Pros:**
- No setState in effects
- Works with React 18's concurrent features
- No eslint-disable

**Cons:**
- Complex API
- Overkill for simple cases

---

### Option 5: State Management Library

**Best for: Large apps with complex state**

Use Zustand, Jotai, or Recoil:

```tsx
// Store
const useSearchStore = create((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  syncFromURL: (urlQuery) => set({ query: urlQuery }),
}));

// Component
function SearchBar() {
  const { query, setQuery } = useSearchStore();
  const debouncedQuery = useDebounce(query, 300);
  
  // No local state sync issues
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

**Pros:**
- External state eliminates sync issues
- Better for large apps
- No eslint-disable

**Cons:**
- Additional dependency
- Learning curve
- Might be overkill

---

## Recommendation

For **your current codebase**, I recommend:

1. **Keep the current implementation with documented eslint-disable** - It's working, tested, and the comments explain why it's safe.

2. **Future refactor option**: Move to Option 1 (Controlled Component) for SearchBar components when you have time.

3. **If starting fresh**: Use Option 1 for simple cases, Option 3 (useReducer) for complex state.

## Why the eslint-disable is Actually Fine

The rules are catching legitimate patterns that are:
- Safe (using functional setState with guards)
- Intentional (deliberately excluding deps to prevent loops)
- Well-tested (your tests pass)
- Documented (now you have clear comments)

Sometimes fighting the linter is worse than documenting why you're disabling it. The key is **understanding why** and **documenting it clearly** - which you now have!
