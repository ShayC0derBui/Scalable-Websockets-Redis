# Scaling up websocket with redis

## Environment variables
- create a `.env` file in the root directory
- add the following environment variables
```dotenv
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=password
```

## How to run
- starts nginx as load balancer and 3 websocket servers and redis
```bash
docker compose up --scale websocket_server=3
```

