# How to Change the Port

## Default Port
- **Host Port**: `3000` (what you access from outside)
- **Container Port**: `4000` (internal to container)

## How to Change the Port

### Option 1: Change in docker-compose.yml (Quick Fix)

Edit `docker-compose.yml` and change the port mapping:

```yaml
ports:
  - "5000:4000"  # Use port 5000 on host, 4000 in container
```

Or use any other port:
```yaml
ports:
  - "8000:4000"  # Use port 8000
  - "3001:4000"  # Use port 3001
```

### Option 2: Use Environment Variable

Set `HOST_PORT` in your `.env` file or hosting platform:

```env
HOST_PORT=5000
```

Then the docker-compose will use: `5000:4000`

### Option 3: On Hosting Platforms

Most hosting platforms let you:
1. Set the port in the Docker/Container settings
2. Or they automatically assign a port

**Just change the port mapping in your platform's Docker settings.**

## Common Port Options

| Port | Notes |
|------|-------|
| `3000` | Default (common for web apps) |
| `5000` | Alternative |
| `8000` | Alternative |
| `8080` | Common for web servers |
| `3001` | If 3000 is taken |

## Important Notes

1. **Container port stays 4000** - The app inside the container always runs on port 4000
2. **Only change the host port** - Map a different host port to container port 4000
3. **Update CLIENT_ORIGIN** - If you change the port, update `CLIENT_ORIGIN`:
   ```env
   CLIENT_ORIGIN=http://localhost:5000  # Match your new port
   ```

## Example: Using Port 5000

**docker-compose.yml:**
```yaml
ports:
  - "5000:4000"
```

**Environment variables:**
```env
HOST_PORT=5000
CLIENT_ORIGIN=http://localhost:5000
```

**Access your app at:** `http://localhost:5000`

