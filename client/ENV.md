# Environment Variables - Frontend

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` as needed:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## Variables

### `VITE_API_URL`
- **Description**: Base URL for the backend API server
- **Default**: `http://localhost:3000`
- **Production Example**: `https://api.adofine.com`

## Usage in Code

The API URL is imported from `src/config.js`:

```javascript
import { API_URL } from '../config';

// Use in fetch calls
const response = await fetch(`${API_URL}/api/products`);
```

## Notes

- All environment variables in Vite must be prefixed with `VITE_`
- Changes to `.env` require restarting the dev server
- The `.env` file is gitignored for security
