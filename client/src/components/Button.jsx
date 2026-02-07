import React from 'react';
import { Link } from 'react-router-dom';

// Loading spinner component (defined outside to avoid re-creation on each render)
const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{
      animation: 'spin 1s linear infinite',
    }}
  >
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
  </svg>
);

/**
 * Shared Button Component
 * 
 * @param {string} variant - Button style variant: 'default' | 'primary' | 'outline' | 'gradient' | 'ghost' | 'icon'
 * @param {string} size - Button size: 'small' | 'medium' | 'large'
 * @param {string} as - Element type: 'button' | 'link' | 'a'
 * @param {string} to - Route path (for react-router Link)
 * @param {string} href - URL (for anchor tag)
 * @param {boolean} disabled - Disabled state
 * @param {boolean} loading - Loading state
 * @param {boolean} active - Active state
 * @param {boolean} fullWidth - Full width button
 * @param {React.ReactNode} icon - Icon element
 * @param {string} iconPosition - Icon position: 'left' | 'right'
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler
 * @param {string} type - Button type (for button element)
 */
const Button = ({
  variant = 'default',
  size = 'medium',
  as = 'button',
  to,
  href,
  disabled = false,
  loading = false,
  active = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) => {
  // Base styles
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: '10px',
    borderWidth: '0',
    borderStyle: 'solid',
    borderColor: 'transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    fontFamily: 'inherit',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
  };

  // Size styles
  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '0.75rem',
      letterSpacing: '0.5px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '0.85rem',
      letterSpacing: '1px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '1rem',
      letterSpacing: '1.5px',
    },
  };

  // Variant styles
  const variantStyles = {
    default: {
      background: 'transparent',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#fff',
      color: '#fff',
      hover: {
        background: 'var(--primary-color)',
        borderColor: 'var(--primary-color)',
        transform: 'translateY(-2px)',
      },
    },
    primary: {
      background: 'var(--primary-color)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--primary-color)',
      color: '#fff',
      hover: {
        background: '#a81735',
        borderColor: '#a81735',
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(211, 30, 68, 0.4)',
      },
    },
    outline: {
      background: 'transparent',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--primary-color)',
      color: 'var(--primary-color)',
      hover: {
        background: 'var(--primary-color)',
        color: '#fff',
        transform: 'translateY(-2px)',
      },
    },
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderWidth: '0',
      borderStyle: 'solid',
      borderColor: 'transparent',
      color: '#fff',
      borderRadius: '8px',
      hover: {
        transform: 'translateY(-3px)',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.5)',
      },
    },
    ghost: {
      background: 'transparent',
      borderWidth: '0',
      borderStyle: 'solid',
      borderColor: 'transparent',
      color: '#fff',
      hover: {
        background: 'rgba(255, 255, 255, 0.1)',
        transform: 'scale(1.05)',
      },
    },
    icon: {
      background: 'transparent',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#fff',
      color: '#fff',
      padding: '10px',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      hover: {
        background: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'var(--primary-color)',
        color: 'var(--primary-color)',
        transform: 'scale(1.1)',
      },
    },
  };

  // Active state styles
  const activeStyles = active
    ? {
        background: 'var(--primary-color)',
        borderColor: 'var(--primary-color)',
        color: '#fff',
      }
    : {};

  // Combine styles
  const buttonStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...activeStyles,
  };

  // Handle hover
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (!disabled && !loading) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const finalStyles = isHovered && variantStyles[variant].hover && !disabled && !loading
    ? { ...buttonStyles, ...variantStyles[variant].hover }
    : buttonStyles;

  // Render content
  const content = (
    <>
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  // Common props
  const commonProps = {
    style: finalStyles,
    className,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...rest,
  };

  // Render based on 'as' prop
  if (as === 'link' && to) {
    return (
      <Link
        to={to}
        {...commonProps}
        onClick={disabled || loading ? (e) => e.preventDefault() : onClick}
      >
        {content}
      </Link>
    );
  }

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        {...commonProps}
        onClick={disabled || loading ? (e) => e.preventDefault() : onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      {...commonProps}
    >
      {content}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
