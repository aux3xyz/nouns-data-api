# Nouns DAO API

A RESTful API service built with Hono and MongoDB to interact with Nouns DAO data.

## Overview

This API provides endpoints to access various aspects of the Nouns DAO ecosystem, including proposals, candidates, votes, feedback, and updates.

## Tech Stack

- [Hono](https://hono.dev/) - Lightweight web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment platform

## Prerequisites

- Node.js
- MongoDB instance
- Environment variables:
  ```
  MONGODB_URI=your_mongodb_connection_string
  ```

## API Endpoints

### Nouns

| Endpoint | Description |
|----------|-------------|
| `GET /api/nouns` | Get all Nouns NFTs |
| `GET /api/nouns/:nounId` | Get specific Noun NFT details |

### Proposals

| Endpoint | Description |
|----------|-------------|
| `GET /api/props` | List all proposals (paginated) |
| `GET /api/props/latest` | Get the latest proposal |
| `GET /api/props/:propId` | Get specific proposal details |
| `GET /api/props/:propId/feedback` | Get feedback for a specific proposal |
| `GET /api/props/:propId/votes` | Get votes for a specific proposal |

### Proposal Updates

| Endpoint | Description |
|----------|-------------|
| `GET /api/propdates` | Get all proposal updates (paginated) |
| `GET /api/propdates/:propId` | Get updates for a specific proposal |

### Candidates

| Endpoint | Description |
|----------|-------------|
| `GET /api/candidates` | List all proposal candidates (paginated) |
| `GET /api/candidates/:slug` | Get specific candidate details |
| `GET /api/candidates/:slug/feedback` | Get feedback for a specific candidate |
| `GET /api/candidates/:slug/signatures` | Get signatures/sponsors for a specific candidate |

## Query Parameters

| Parameter | Description | Default | Max |
|-----------|-------------|---------|-----|
| `page` | Page number | 1 | - |
| `limit` | Items per page | 10 | 50 |
| `summary` | Summary view flag | false | - |

## Response Examples

### Proposal Response
```json
{
  "id": 1,
  "proposer": "0x...",
  "description": "Proposal description",
  "calldatas": [],
  "targets": [],
  "values": [],
  "startBlock": 123,
  "endBlock": 456,
  "txHash": "0x...",
  "blockNumber": 789
}
```

### Candidate Response
```json
{
  "id": 1,
  "proposer": "0x...",
  "description": "Candidate description",
  "slug": "candidate-slug",
  "proposalIdToUpdate": null,
  "encodedProposalHash": "0x..."
}
```

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 500 | Database connection error |
| 404 | Resource not found |
| 400 | Bad request |

## Development

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run development server
```bash
npm run dev
```

## Production

Deploy to Vercel:
```bash
vercel deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)
