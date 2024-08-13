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
docker compose up --scale websocket_server=3 --build
```

## Technologies used
<img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS"></img>
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></img>
<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Nodejs"></img>
<img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"></img>
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"></img>
<img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white" alt="Nginx"></img>

