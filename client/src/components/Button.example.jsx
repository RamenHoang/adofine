/**
 * Button Component Usage Examples
 * 
 * This file demonstrates all the ways to use the shared Button component
 * throughout the client application.
 */

import React from 'react';
import Button from './Button';

const ButtonExamples = () => {
  return (
    <div style={{ padding: '40px', background: '#111', color: '#fff' }}>
      <h1>Button Component Examples</h1>

      {/* Variants */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Variants</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Button variant="default">Default Button</Button>
          <Button variant="primary">Primary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="gradient">Gradient Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="icon">🔍</Button>
        </div>
      </section>

      {/* Sizes */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Sizes</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="small">Small Button</Button>
          <Button size="medium">Medium Button</Button>
          <Button size="large">Large Button</Button>
        </div>
      </section>

      {/* States */}
      <section style={{ marginBottom: '40px' }}>
        <h2>States</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Button>Normal State</Button>
          <Button disabled>Disabled State</Button>
          <Button loading>Loading State</Button>
          <Button active>Active State</Button>
        </div>
      </section>

      {/* With Icons */}
      <section style={{ marginBottom: '40px' }}>
        <h2>With Icons</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Button icon={<span>👈</span>} iconPosition="left">
            Icon Left
          </Button>
          <Button icon={<span>👉</span>} iconPosition="right">
            Icon Right
          </Button>
          <Button variant="primary" icon={<span>✉️</span>}>
            Send Email
          </Button>
        </div>
      </section>

      {/* Full Width */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Full Width</h2>
        <Button fullWidth variant="primary">Full Width Button</Button>
      </section>

      {/* As Different Elements */}
      <section style={{ marginBottom: '40px' }}>
        <h2>As Different Elements</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Button as="button" onClick={() => alert('Button clicked!')}>
            HTML Button
          </Button>
          <Button as="link" to="/about">
            React Router Link
          </Button>
          <Button as="a" href="https://example.com" target="_blank">
            Anchor Link
          </Button>
        </div>
      </section>

      {/* Form Submit */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Form Usage</h2>
        <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); }}>
          <Button type="submit" variant="gradient" size="large">
            Submit Form
          </Button>
        </form>
      </section>

      {/* Real World Examples */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Real World Examples</h2>
        
        <h3>Contact Form Submit Button</h3>
        <Button
          type="submit"
          variant="gradient"
          size="large"
          loading={false}
        >
          Send Message
        </Button>

        <h3 style={{ marginTop: '20px' }}>Hero CTA Button</h3>
        <Button
          as="link"
          to="/collections"
          variant="default"
          size="large"
        >
          KHÁM PHÁ NGAY
        </Button>

        <h3 style={{ marginTop: '20px' }}>Blog Read More Button</h3>
        <Button
          as="link"
          to="/news/123"
          variant="outline"
          size="small"
        >
          READ MORE
        </Button>

        <h3 style={{ marginTop: '20px' }}>Collection View Button</h3>
        <Button
          as="link"
          to="/collections/1"
          variant="outline"
          size="medium"
        >
          VIEW COLLECTION
        </Button>

        <h3 style={{ marginTop: '20px' }}>Filter Buttons</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="default" size="small" active>
            ALL
          </Button>
          <Button variant="default" size="small">
            RUBY
          </Button>
          <Button variant="default" size="small">
            SAPPHIRE
          </Button>
          <Button variant="default" size="small">
            EMERALD
          </Button>
        </div>

        <h3 style={{ marginTop: '20px' }}>Navigation Arrows</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" onClick={() => console.log('Previous')}>
            &lt;
          </Button>
          <Button variant="ghost" onClick={() => console.log('Next')}>
            &gt;
          </Button>
        </div>

        <h3 style={{ marginTop: '20px' }}>Tag Remove Button</h3>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#333', padding: '8px 12px', borderRadius: '4px' }}>
          <span>Selected Item</span>
          <Button
            variant="ghost"
            size="small"
            onClick={() => console.log('Remove')}
          >
            ×
          </Button>
        </div>
      </section>

      {/* Props Reference */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Props Reference</h2>
        <pre style={{ background: '#222', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
{`variant: 'default' | 'primary' | 'outline' | 'gradient' | 'ghost' | 'icon'
  - default: Transparent with white border (default)
  - primary: Red background (--primary-color)
  - outline: Transparent with red border
  - gradient: Purple-blue gradient
  - ghost: Transparent, no border
  - icon: Circular button for icons

size: 'small' | 'medium' | 'large'
  - small: 8px 16px padding, 0.75rem font
  - medium: 12px 24px padding, 0.85rem font (default)
  - large: 16px 32px padding, 1rem font

as: 'button' | 'link' | 'a'
  - button: HTML button element (default)
  - link: React Router Link component
  - a: HTML anchor element

to: string
  - Route path for React Router Link (requires as="link")

href: string
  - URL for anchor element (requires as="a")

disabled: boolean
  - Disables the button and reduces opacity to 0.6

loading: boolean
  - Shows loading spinner and disables interaction

active: boolean
  - Applies active state styling (primary color background)

fullWidth: boolean
  - Makes button stretch to full container width

icon: React.ReactNode
  - Icon element to display alongside text

iconPosition: 'left' | 'right'
  - Position of icon relative to text (default: 'left')

className: string
  - Additional CSS classes to apply

onClick: function
  - Click event handler

type: 'button' | 'submit' | 'reset'
  - Button type for form elements (default: 'button')

...rest: any
  - All other props are passed through to the element`}
        </pre>
      </section>
    </div>
  );
};

export default ButtonExamples;
