# Button Component

Shared button component cho toàn bộ ứng dụng client. Component này thay thế các button classes rải rác (`.btn`, `.btn-hero`, `.btn-explore`, `.submit-button`, v.v.) bằng một API component nhất quán và dễ sử dụng.

## Tính năng

✅ **6 Variants**: default, primary, outline, gradient, ghost, icon  
✅ **3 Sizes**: small, medium, large  
✅ **Multiple Element Types**: button, Link (react-router), anchor  
✅ **States**: disabled, loading, active, hover  
✅ **Icon Support**: Left/right icon positioning  
✅ **Full Width**: Stretch to container width  
✅ **Accessibility**: Proper ARIA attributes và keyboard support  
✅ **TypeScript Ready**: Full JSDoc documentation  

## Import

```jsx
import Button from './components/Button';
```

## Basic Usage

```jsx
// Default button
<Button>Click Me</Button>

// Primary button
<Button variant="primary">Submit</Button>

// Outline button
<Button variant="outline">Learn More</Button>

// With loading state
<Button loading>Processing...</Button>

// As Link (react-router)
<Button as="link" to="/about">About Us</Button>

// As anchor
<Button as="a" href="https://example.com">External Link</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'outline' \| 'gradient' \| 'ghost' \| 'icon'` | `'default'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `as` | `'button' \| 'link' \| 'a'` | `'button'` | Element type to render |
| `to` | `string` | - | Route path (for react-router Link) |
| `href` | `string` | - | URL (for anchor tag) |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state with spinner |
| `active` | `boolean` | `false` | Active state |
| `fullWidth` | `boolean` | `false` | Full width button |
| `icon` | `React.ReactNode` | - | Icon element |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `function` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `children` | `React.ReactNode` | - | Button content |

## Variants

### Default
Transparent background với white border. Hover chuyển sang primary color.
```jsx
<Button variant="default">Default</Button>
```

### Primary
Red background (`--primary-color`). Dùng cho primary CTAs.
```jsx
<Button variant="primary">Primary</Button>
```

### Outline
Transparent với red border. Hover fill primary color.
```jsx
<Button variant="outline">Outline</Button>
```

### Gradient
Purple-blue gradient. Dùng cho special CTAs (submit forms, etc.)
```jsx
<Button variant="gradient">Gradient</Button>
```

### Ghost
Transparent, no border. Subtle hover effect.
```jsx
<Button variant="ghost">Ghost</Button>
```

### Icon
Circular button cho icons. 40x40px.
```jsx
<Button variant="icon">🔍</Button>
```

## Sizes

```jsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
```

## States

### Disabled
```jsx
<Button disabled>Disabled Button</Button>
```

### Loading
Hiển thị spinner và disable interactions.
```jsx
<Button loading>Loading...</Button>
```

### Active
Dùng cho filter buttons, tabs, etc.
```jsx
<Button active>Active</Button>
```

## With Icons

```jsx
// Icon left (default)
<Button icon={<span>👈</span>}>Icon Left</Button>

// Icon right
<Button icon={<span>👉</span>} iconPosition="right">Icon Right</Button>

// Icon only
<Button variant="icon">🔍</Button>
```

## As Different Elements

### As Button (default)
```jsx
<Button onClick={() => console.log('clicked')}>
  Click Me
</Button>
```

### As React Router Link
```jsx
<Button as="link" to="/about">
  About Page
</Button>
```

### As Anchor
```jsx
<Button as="a" href="https://example.com" target="_blank">
  External Link
</Button>
```

## Real-World Examples

### Contact Form Submit
```jsx
<Button
  type="submit"
  variant="gradient"
  size="large"
  loading={isSubmitting}
>
  {isSubmitting ? 'Submitting...' : 'Send Message'}
</Button>
```

### Hero CTA
```jsx
<Button
  as="link"
  to="/collections"
  variant="default"
  size="large"
>
  KHÁM PHÁ NGAY
</Button>
```

### Blog Read More
```jsx
<Button
  as="link"
  to={`/news/${post.id}`}
  variant="outline"
  size="small"
>
  READ MORE
</Button>
```

### Filter Buttons
```jsx
{filters.map(filter => (
  <Button
    key={filter}
    variant="default"
    size="small"
    active={activeFilter === filter}
    onClick={() => setActiveFilter(filter)}
  >
    {filter}
  </Button>
))}
```

### Navigation Arrows
```jsx
<Button variant="ghost" className="nav-arrow left" onClick={prevSlide}>
  &lt;
</Button>
<Button variant="ghost" className="nav-arrow right" onClick={nextSlide}>
  &gt;
</Button>
```

### Tag Remove Button
```jsx
<Button
  variant="ghost"
  size="small"
  onClick={handleRemove}
  className="tag-remove"
>
  ×
</Button>
```

## Styling

Button component sử dụng inline styles với CSS variables từ `index.css`:

- `--primary-color`: #d31e44 (red)
- `--bg-color`: #000000 (black)
- `--text-color`: #ffffff (white)

Bạn có thể thêm custom styles thông qua `className` prop:

```jsx
<Button className="my-custom-class">
  Custom Styled Button
</Button>
```

Hoặc thêm inline styles:

```jsx
<Button style={{ marginTop: '20px' }}>
  With Custom Margin
</Button>
```

## Accessibility

- ✅ Proper `disabled` attribute
- ✅ Keyboard accessible (Enter/Space)
- ✅ Focus states
- ✅ Cursor changes based on state
- ✅ Loading state prevents double-clicks

## Migration Guide

### Before (Old Buttons)
```jsx
// Old: Global .btn class
<button className="btn">Click Me</button>

// Old: .btn-hero class
<Link to="/about" className="btn-hero">Hero Button</Link>

// Old: .btn-explore class
<Link to="/collections" className="btn-explore">Explore</Link>

// Old: .submit-button class
<button className="submit-button" disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
```

### After (New Button Component)
```jsx
// New: Button component with variants
<Button>Click Me</Button>

// New: Button as link
<Button as="link" to="/about" variant="default" size="large">
  Hero Button
</Button>

// New: Outline button as link
<Button as="link" to="/collections" variant="outline">
  Explore
</Button>

// New: Gradient button with loading
<Button
  type="submit"
  variant="gradient"
  loading={isSubmitting}
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

## Files Modified

Các components đã được refactor để sử dụng Button mới:

- ✅ `ContactPage.jsx` - Submit button, tag remove buttons
- ✅ `Hero.jsx` - CTA button, navigation arrows
- ✅ `BlogSection.jsx` - Read more buttons
- ✅ `CollectionsSection.jsx` - View collection buttons
- ✅ `PortfolioGrid.jsx` - Filter buttons, icon buttons

## Browser Support

Component hoạt động trên tất cả modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- ✅ No unnecessary re-renders
- ✅ Spinner component memoized
- ✅ Inline styles cached
- ✅ Minimal bundle size impact

## Tips

1. **Dùng `variant` phù hợp**: `primary` cho main CTAs, `outline` cho secondary actions, `ghost` cho subtle interactions
2. **Consistent sizing**: Dùng `small` cho inline actions, `medium` cho general use, `large` cho hero/prominent CTAs
3. **Loading states**: Luôn set `loading={true}` khi submit forms để prevent double submissions
4. **Icon positioning**: Icons thường ở bên trái, nhưng có thể dùng `iconPosition="right"` cho arrow/chevron icons
5. **Full width**: Dùng `fullWidth` cho mobile buttons hoặc form buttons

## Examples Component

Xem file `Button.example.jsx` để tham khảo tất cả use cases và examples.

## Support

Nếu có issues hoặc questions về Button component, vui lòng tạo ticket hoặc liên hệ team.
