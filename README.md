# Knowledge Base API

A scalable RESTful API for managing knowledge articles with intelligent duplicate detection. Built with Node.js, TypeScript, Express, TypeORM, and RabbitMQ.

## Table of Contents

- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Setup & Installation](#setup--installation)
  - [Local Development Setup](#local-development-setup)
  - [Docker Setup](#docker-setup)
- [Running the Project](#running-the-project)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Duplicate Detection Heuristics](#duplicate-detection-heuristics)
- [Data Modeling](#data-modeling)
  - [Entity Relationships](#entity-relationships)
  - [Relationship Design Decisions](#relationship-design-decisions)
  - [Persistence Layer Implementation](#persistence-layer-implementation)
- [Event-Driven Design](#event-driven-design)
  - [Separation of Event Emission and Consumption](#separation-of-event-emission-and-consumption)
  - [Duplicate Detection Approach](#duplicate-detection-approach)
- [Scalability Considerations](#scalability-considerations)
  - [Current Architecture Bottlenecks](#current-architecture-bottlenecks)
  - [Scaling for Growth](#scaling-for-growth)
- [API Documentation](#api-documentation)
- [Future Work](#future-work)

---

## Project Structure

```
kb-api/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── article.controller.ts
│   │   ├── duplicateController.ts
│   │   ├── tenant.controller.ts
│   │   ├── topic.controller.ts
│   │   └── aliases.controller.ts
│   ├── entities/            # TypeORM entities
│   │   ├── KnowledgeArticle.ts
│   │   ├── Tenant.ts
│   │   ├── Topic.ts
│   │   ├── Alias.ts
│   │   └── DuplicateRecord.ts
│   ├── events/              # Event handling
│   │   ├── rabbitmq.ts      # RabbitMQ connection
│   │   ├── eventTypes.ts    # Event schemas
│   │   ├── consumers/       # Event consumers
│   │   │   └── duplicateConsumer.ts
│   │   └── producers/       # Event producers
│   │       └── duplicateProducer.ts
│   ├── routes/              # Express routes
│   │   ├── articles.route.ts
│   │   ├── tenants.route.ts
│   │   ├── topics.route.ts
│   │   ├── aliases.route.ts
│   │   └── duplicate.route.ts
│   ├── data-source.ts       # TypeORM configuration
│   ├── index.ts             # API server entry point
│   ├── duplicate-worker.ts  # Worker entry point
│   ├── logger.ts            # Winston logger
│   ├── swagger.ts           # Swagger setup
│   └── swaggerSpec.ts       # API specifications
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Orchestration config
├── .dockerignore           # Docker build exclusions
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```


## Architecture Overview

The Knowledge Base API follows a simple architecture with 3 main components:

1. **API Server** (`src/index.ts`): Handles HTTP requests for managing tenants, topics, articles, and aliases
2. **Duplicate Detection Worker** (`src/duplicate-worker.ts`): Processes duplicate detection events asynchronously
3. **An SQLite DB** for data storage

```
┌─────────────┐      HTTP       ┌──────────────┐
│   Client    │ ─────────────> │  API Server  │
└─────────────┘                 └──────┬───────┘
                                       │
                                       │ Publishes Events
                                       ▼
                                ┌──────────────┐
                                │   RabbitMQ   │
                                └──────┬───────┘
                                       │
                                       │ Consumes Events
                                       ▼
                                ┌──────────────┐
                                │    Worker    │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │  SQLite DB   │
                                └──────────────┘
```

---

---

## Setup & Installation

### Prerequisites

- **Node.js** 18+ and npm
- **RabbitMQ** (for local development) OR **Docker** (recommended)

---

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kb-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start RabbitMQ** (if not using Docker)
   ```bash
   # macOS with Homebrew
   brew install rabbitmq
   brew services start rabbitmq

   # Or use Docker for just RabbitMQ
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
   ```

4. **Configure environment variables** (optional)
   ```bash
   # Create .env file (optional)
   echo "RABBITMQ_URL=amqp://localhost" > .env
   echo "DATABASE_PATH=db.sqlite" >> .env
   ```

---

### Docker Setup

**No additional setup required!** Docker Compose handles everything.

Just ensure you have:
- **Docker** installed: [Get Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** installed: Included with Docker Desktop

---

## Running the Project

### Running Locally

#### 1. Start the API Server
```bash
npm run dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs

#### 2. Start the Duplicate Detection Worker (in a separate terminal)
```bash
npm run dev:worker
```

**Expected Output:**
```
[WORKER] Database connected
[WORKER] Listening for duplicate_article_warning events...
```

#### 3. Access RabbitMQ Management UI
- **URL**: http://localhost:15672
- **Username**: `guest`
- **Password**: `guest`

---

### Running with Docker

#### 1. Build and start all services
```bash
docker-compose up --build
```

This command:
- Builds the Docker image for the API and worker
- Starts RabbitMQ
- Starts the API server
- Starts the duplicate detection worker
- Sets up networking between containers

#### 2. Run in detached mode (background)
```bash
docker-compose up -d
```

#### 3. View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f rabbitmq
```

#### 4. Stop all services
```bash
docker-compose down
```

#### 5. Stop and remove volumes (reset database)
```bash
docker-compose down -v
```

---

### Service URLs (Docker)

When running with Docker:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

---

### Building for Production

#### Compile TypeScript
```bash
npm run build
```

#### Start production server
```bash
npm start              # Start API
npm run start:worker   # Start worker (in separate terminal)
```

---

## API Documentation

### Interactive Swagger UI

Visit http://localhost:3000/docs for interactive API documentation.

### Core Endpoints

#### Tenants
- `POST /api/v1/tenants` - Create a tenant
- `GET /api/v1/tenants` - List all tenants
- `GET /api/v1/tenants/:id` - Get tenant by ID
- `PUT /api/v1/tenants/:id` - Update tenant
- `DELETE /api/v1/tenants/:id` - Delete tenant

#### Topics
- `POST /api/v1/topics` - Create a topic
- `GET /api/v1/topics` - List topics
- `GET /api/v1/topics/:id` - Get topic by ID
- `PUT /api/v1/topics/:id` - Update topic
- `DELETE /api/v1/topics/:id` - Delete topic

#### Articles
- `POST /api/v1/articles` - Create an article
- `GET /api/v1/articles` - List articles (supports filtering by `q`, `tenantId`, `year`)
- `GET /api/v1/articles/:id` - Get article by ID
- `PUT /api/v1/articles/:id` - Update article
- `DELETE /api/v1/articles/:id` - Delete article

#### Aliases
- `POST /api/v1/aliases` - Create an alias
- `GET /api/v1/aliases` - List aliases
- `DELETE /api/v1/aliases/:id` - Delete alias

#### Duplicates
- `GET /api/v1/duplicates/:tenantId` - Get potential duplicates for a tenant

---

### Example: Creating an Article

```bash
curl -X POST http://localhost:3000/api/v1/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "RESTful API Best Practices",
    "body": "A comprehensive guide to designing REST APIs...",
    "publishedYear": 2024,
    "tenantId": 1,
    "aliases": ["REST API Guide", "API Design Patterns"],
    "topicIds": [1, 2]
  }'
```

**Response:**
```json
{
  "id": 1,
  "title": "RESTful API Best Practices",
  "body": "A comprehensive guide to designing REST APIs...",
  "publishedYear": 2024,
  "tenant": { "id": 1, "name": "Acme Corp" },
  "topics": [...],
  "aliases": [
    { "id": 1, "text": "REST API Guide" },
    { "id": 2, "text": "API Design Patterns" }
  ]
}
```

If a duplicate is detected, an event is sent to RabbitMQ and logged by the worker.

---

## Features

- **Multi-tenant support**: Isolate knowledge bases by tenant
- **Article management**: CRUD operations for knowledge articles
- **Topic categorization**: Organize articles by topics
- **Alias support**: Multiple alternative names for articles
- **Intelligent duplicate detection**: Real-time and batch duplicate detection
- **Event-driven architecture**: Asynchronous processing with RabbitMQ
- **API documentation**: Auto-generated Swagger/OpenAPI docs
- **Docker support**: Containerized deployment with Docker Compose
- **Logging**: Structured logging with Winston

---

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Web Framework**: Express 5
- **ORM**: TypeORM
- **Database**: SQLite (easily swappable for PostgreSQL/MySQL)
- **Message Queue**: RabbitMQ (via amqplib)
- **API Docs**: Swagger UI + swagger-jsdoc
- **Logging**: Winston
- **Containerization**: Docker & Docker Compose

## Duplicate Detection Heuristics

The system employs a **two-tier approach** to detect potential duplicate articles:

### 1. Real-Time Event-Based Detection

When creating a new article, the API immediately checks existing articles and emits events for potential duplicates:

#### **Heuristic 1.1: Title Matching**
- **Logic**: Compares the new article's title against all existing article titles (case-insensitive)
- **Event**: Emitted to RabbitMQ with reason `title_match`
- **Code**: `src/controllers/article.controller.ts` lines 35-44

```typescript
if (existing.title.toLowerCase() === title.toLowerCase()) {
  await emitDuplicateWarning({
    newArticleId: 0,
    existingArticleId: existing.id,
    tenantId,
    reason: "title_match",
    timestamp: new Date().toISOString(),
  });
}
```

#### **Heuristic 1.2: Alias Collision**
- **Logic**: Checks if the new article's title matches any existing article's alias
- **Event**: Emitted to RabbitMQ with reason `alias_match`
- **Code**: `src/controllers/article.controller.ts` lines 46-54

```typescript
for (const alias of existing.aliases) {
  if (alias.text.toLowerCase() === title.toLowerCase()) {
    await emitDuplicateWarning({
      newArticleId: 0,
      existingArticleId: existing.id,
      tenantId,
      reason: "alias_match",
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Rationale**: If a new article's title exactly matches an existing alias, it's likely describing the same concept.

---

### 2. Batch Analysis (On-Demand)

The `/api/v1/duplicates/:tenantId` endpoint performs comprehensive analysis:

#### **Heuristic 2.1: Title/Alias Grouping**
- **Logic**: Groups articles that share identical titles or aliases (case-insensitive)
- **Implementation**: Uses a HashMap to collect articles by normalized keys
- **Code**: `src/controllers/duplicateController.ts` lines 20-32

```typescript
const map = new Map<string, KnowledgeArticle[]>();

for (const article of articles) {
  const keys = new Set<string>();
  
  keys.add(article.title.toLowerCase());
  article.aliases.forEach(a => keys.add(a.text.toLowerCase()));
  
  for (const key of keys) {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(article);
  }
}
```

**Output**: Returns groups where `length > 1`, indicating potential duplicates

#### **Heuristic 2.2: Historical Duplicate Logs**
- **Logic**: Retrieves all duplicate warnings logged by the worker from the database
- **Code**: `src/controllers/duplicateController.ts` lines 41-50

**Rationale**: Combines real-time detection with historical data for comprehensive duplicate overview.

---

### Why These Heuristics?

1. **String Matching**: Simple, fast, and catches exact duplicates (typos notwithstanding)
2. **Alias Awareness**: Recognizes that different names can refer to the same concept
3. **Case-Insensitive**: Users may capitalize inconsistently
4. **Incremental**: Real-time checks prevent duplicates at creation time
5. **Auditable**: Historical logs provide transparency

### Limitations & Future Improvements

**Current Limitations**:
- No fuzzy matching (e.g., "API Design" vs "API Designing")
- No semantic similarity (e.g., "REST API" vs "RESTful Service")
- No stemming/lemmatization (e.g., "running" vs "run")

**See [Future Work](#future-work) for planned enhancements.**

---

## Data Modeling

### Entity Relationships

The data model is designed around four core entities with well-defined relationships:

```
┌─────────────┐
│   Tenant    │ (1)
│             │
│ - id        │
│ - name      │
│ - locale    │
└──────┬──────┘
       │
       │ One-to-Many
       │ (CASCADE DELETE)
       ▼
┌─────────────────┐
│ KnowledgeArticle│ (N)
│                 │
│ - id            │
│ - title         │◄─────────┐
│ - body          │          │
│ - publishedYear │          │ One-to-Many
└────┬────────┬───┘          │ (CASCADE DELETE)
     │        │              │
     │        │         ┌────┴────┐
     │        │         │  Alias  │ (N)
     │        │         │         │
     │        │         │ - id    │
     │        │         │ - text  │
     │        │         └─────────┘
     │        │
     │        │ Many-to-Many
     │        │ (JOIN TABLE)
     │        ▼
     │   ┌────────┐
     │   │ Topic  │ (N)
     │   │        │
     │   │ - id   │
     │   │ - name │
     │   └────────┘
     │
     └──> (self-reference via topics)
```

### Relationship Design Decisions

#### 1. **Tenant → Articles (One-to-Many with CASCADE)**
```typescript
@ManyToOne(() => Tenant, (tenant) => tenant.articles, { onDelete: "CASCADE" })
tenant: Tenant;
```

**Rationale**:
- **Strong Ownership**: A tenant owns all its articles
- **Data Isolation**: Multi-tenancy ensures data separation
- **Cascade Delete**: When a tenant is deleted, all articles are automatically removed (business rule: no orphaned articles)
- **Database Consistency**: Foreign key constraint maintains referential integrity

**Trade-off**: Cannot share articles between tenants (acceptable for knowledge base isolation)

#### 2. **Article → Aliases (One-to-Many with CASCADE)**
```typescript
@OneToMany(() => Alias, (alias) => alias.article, { cascade: true, eager: true })
aliases: Alias[];
```

**Rationale**:
- **Lifecycle Coupling**: Aliases have no meaning without their parent article
- **Cascade Delete**: Deleting an article automatically removes its aliases
- **Cascade Save**: Creating an article with aliases saves everything in one transaction
- **Eager Loading**: Aliases are always loaded with articles (small data, frequently needed for duplicate detection)

**Trade-off**: Eager loading may fetch unnecessary data, but aliases are lightweight and critical for search/duplication logic.

#### 3. **Article ↔ Topics (Many-to-Many)**
```typescript
@ManyToMany(() => Topic, (topic) => topic.articles, { cascade: true })
@JoinTable()
topics: Topic[];
```

**Rationale**:
- **Flexibility**: Articles can have multiple topics, topics can categorize multiple articles
- **Shared Taxonomy**: Topics are reusable across articles (e.g., "API Design" topic for many articles)
- **No Ownership**: Neither entity owns the other
- **Join Table**: TypeORM creates `knowledge_article_topics_topic` table automatically

**Design Choice**: `@JoinTable()` on Article side makes Article the "owner" of the relationship for TypeORM operations.

#### 4. **DuplicateRecord (Standalone Audit Log)**
```typescript
@Entity()
export class DuplicateRecord {
  @Column() newArticleId: number;
  @Column() existingArticleId: number;
  @Column() tenantId: number;
  @Column() reason: string;
  @Column() timestamp: string;
}
```

**Rationale**:
- **No Foreign Keys**: Intentionally uses plain IDs instead of relations
- **Historical Integrity**: Even if articles are deleted, we preserve the duplicate warning history
- **Audit Trail**: Immutable log of all duplicate detection events
- **Query Flexibility**: Can analyze duplication patterns without expensive joins

**Trade-off**: Must manually ensure data consistency, but gains historical preservation.

---

### Persistence Layer Implementation

#### Why TypeORM?

1. **Declarative Schema**: Entities defined in TypeScript with decorators
2. **Type Safety**: End-to-end type checking from database to API
3. **Migration Support**: Schema versioning (though currently using `synchronize: true` for development)
4. **Database Agnostic**: Easy to switch from SQLite → PostgreSQL/MySQL
5. **Active Record/Repository Pattern**: Flexible query building

#### Current Configuration

```typescript
// src/data-source.ts
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: DATABASE_PATH,
  synchronize: true, // Auto-create tables (DEV ONLY)
  entities: [Tenant, KnowledgeArticle, Alias, Topic, DuplicateRecord],
});
```

**Development vs Production**:
- **Dev**: `synchronize: true` - Auto-creates/updates tables from entity definitions
- **Prod**: Should use TypeORM migrations for controlled schema changes

#### Database Choice: SQLite

**Why SQLite for this project**:
- ✅ Zero configuration (file-based)
- ✅ Perfect for prototypes and small/medium workloads
- ✅ ACID-compliant transactions
- ✅ Easy to share database state via Docker volumes
- ✅ Sufficient for read-heavy workloads with moderate writes

**When to migrate to PostgreSQL/MySQL**:
- High concurrent writes (SQLite locks the entire database)
- Large datasets (>100GB, though SQLite supports up to 281TB theoretically)
- Advanced features (full-text search, JSON operators, window functions)
- Horizontal scaling with read replicas

**Migration Path**: Change 5 lines in `data-source.ts`:
```typescript
type: "postgres",
host: "localhost",
port: 5432,
username: "user",
password: "password",
database: "kb_api",
```

All queries remain unchanged due to TypeORM abstraction.

---

## Event-Driven Design

### Separation of Event Emission and Consumption

The architecture cleanly separates **producers** (event emitters) from **consumers** (event processors):

```
┌───────────────────────────┐
│  API Server (Producer)    │
│                           │
│  article.controller.ts    │
│         │                 │
│         ▼                 │
│  emitDuplicateWarning()   │
│         │                 │
│         │ RabbitMQ Client │
└─────────┼─────────────────┘
          │
          │ Message Bus
          │ (Decoupled)
          ▼
    ┌─────────────┐
    │  RabbitMQ   │
    │   Queue     │
    └──────┬──────┘
           │
           │ Message Delivery
           ▼
┌──────────────────────────┐
│  Worker (Consumer)       │
│                          │
│  duplicateConsumer.ts    │
│         │                │
│         ▼                │
│  Save to DuplicateRecord │
└──────────────────────────┘
```

### Producer: Event Emission

**Location**: `src/events/producers/duplicateProducer.ts`

```typescript
export async function emitDuplicateWarning(event: DuplicateArticleWarningEvent) {
  const channel = await getRabbitChannel();
  
  await channel.assertQueue(QUEUES.DUPLICATE_WARNING, { durable: true });
  
  channel.sendToQueue(
    QUEUES.DUPLICATE_WARNING,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
}
```

**Key Design Decisions**:

1. **Durable Queue**: `{ durable: true }` - Queue survives RabbitMQ restarts
2. **Persistent Messages**: `{ persistent: true }` - Messages written to disk
3. **Fire-and-Forget**: Producer doesn't wait for consumer processing (async)
4. **Idempotent**: Safe to emit duplicate events (consumer handles deduplication if needed)

**Benefits**:
- API responds immediately (doesn't wait for DB write)
- Worker failures don't impact API availability
- Can emit events from multiple sources (API, batch jobs, webhooks)

---

### Consumer: Event Processing

**Location**: `src/events/consumers/duplicateConsumer.ts`

```typescript
export async function startDuplicateConsumer() {
  const channel = await getRabbitChannel();
  
  await channel.assertQueue(QUEUES.DUPLICATE_WARNING, { durable: true });
  
  channel.consume(
    QUEUES.DUPLICATE_WARNING,
    async (msg) => {
      if (!msg) return;
      
      const event: DuplicateArticleWarningEvent = JSON.parse(msg.content.toString());
      
      const repo = AppDataSource.getRepository(DuplicateRecord);
      await repo.save({
        newArticleId: event.newArticleId,
        existingArticleId: event.existingArticleId,
        tenantId: event.tenantId,
        reason: event.reason,
        timestamp: event.timestamp,
      });
      
      channel.ack(msg); // Acknowledge successful processing
    },
    { noAck: false }
  );
}
```

**Key Design Decisions**:

1. **Manual Acknowledgment**: `{ noAck: false }` - Consumer must explicitly acknowledge
2. **Acknowledgment After Processing**: `channel.ack(msg)` only after successful DB write
3. **Error Handling**: If processing fails, message returns to queue (at-least-once delivery)
4. **Separate Process**: Worker runs independently from API server

**Benefits**:
- Guaranteed processing (ack only on success)
- Automatic retry on failure
- Can scale by adding more worker instances
- Easy to add new event types/consumers

---

### Duplicate Detection Approach

**Two-Phase Strategy**:

#### Phase 1: Synchronous Pre-Check (Blocking)
**Location**: `src/controllers/article.controller.ts`

- Runs **before** creating the article
- Loads all existing articles for the tenant
- Compares title/aliases against new article
- Emits events for detected duplicates
- **Does NOT block article creation**

**Rationale**:
- Fast string comparison (in-memory)
- Provides immediate feedback
- Doesn't prevent creation (warnings, not errors)

#### Phase 2: Asynchronous Logging (Non-Blocking)
**Location**: `src/duplicate-worker.ts`

- Receives events from RabbitMQ
- Writes to `DuplicateRecord` table
- Processed independently from user request

**Rationale**:
- Offloads DB writes from API request path
- Creates audit trail

---

### Event Flow Example

```
1. User creates article "REST API Guide"
   ↓
2. API checks existing articles
   ↓
3. Finds duplicate: "RESTful API Guide"
   ↓
4. API emits event → RabbitMQ
   {
     newArticleId: 123,
     existingArticleId: 456,
     tenantId: 1,
     reason: "title_match",
     timestamp: "2025-11-27T10:30:00Z"
   }
   ↓
5. API returns 200 OK (article created)
   ↓
6. Worker receives event from queue
   ↓
7. Worker saves to DuplicateRecord table
   ↓
8. Worker acknowledges message
```

**Total API response time**: ~100ms (without waiting for worker)

---

## Scalability Considerations

### Current Architecture Bottlenecks

1. **SQLite Write Concurrency**: Database-level locking limits concurrent writes
2. **Single Worker Instance**: One consumer processes all duplicate events
3. **In-Memory Duplicate Check**: Loads all articles per tenant into memory
4. **No Caching**: Repeated queries for same data

---

### Scaling for Growth

#### 1. **As Number of Tenants/Articles Grows**

**Problem**: Loading all articles for duplicate detection becomes expensive

**Solutions**:

**a) Database Indexing**
```sql
CREATE INDEX idx_article_title ON knowledge_article(title, tenant_id);
CREATE INDEX idx_alias_text ON alias(text);
```
- Speeds up title/alias lookups
- Reduces full table scans

**b) Migrate to PostgreSQL**
- Connection pooling (10-50 connections)
- No database-level write locks
- Advanced full-text search with `tsvector`

**c) Pagination for Duplicate Checks**
```typescript
// Instead of loading all articles
const articles = await articleRepo.find({ 
  where: { tenant: { id: tenantId } },
  take: 1000, // Limit to recent articles
  order: { id: 'DESC' }
});
```

**d) Bloom Filters for Fast Duplicate Detection**
```typescript
// Probabilistic data structure for "likely duplicate" checks
const filter = new BloomFilter(tenantId);
if (filter.mightContain(title)) {
  // Do expensive DB check
}
```

---

#### 2. **As Concurrent Requests Increase**

**Problem**: Single API instance can't handle thousands of requests/second

**Solutions**:

**a) Horizontal API Scaling**
```yaml
# docker-compose.yml
services:
  api:
    deploy:
      replicas: 5  # Run 5 API instances
```
- Load balancer (NGINX/HAProxy) distributes requests
- Each instance handles subset of traffic
- Stateless API enables easy scaling

**b) Worker Scaling (Competing Consumers)**
```yaml
services:
  worker:
    deploy:
      replicas: 3  # Run 3 workers
```
- All workers consume from same queue
- RabbitMQ distributes messages round-robin
- Parallel processing of duplicate events

**c) Redis Caching**
```typescript
// Cache tenant articles for 5 minutes
const cached = await redis.get(`tenant:${tenantId}:articles`);
if (cached) return JSON.parse(cached);

const articles = await articleRepo.find({ /* ... */ });
await redis.setex(`tenant:${tenantId}:articles`, 300, JSON.stringify(articles));
```
- Reduces DB load for read-heavy operations
- Invalidate cache on article creation/update

**d) Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

app.use('/api/v1', limiter);
```

---

#### 3. **Adding Multi-Language Content**

**Problem**: Current schema doesn't support translations
**Solution 1: Separate Translation Table**

**Duplicate Detection Impact**:
- Check duplicates within same locale
- Emit events per language: `{ reason: "title_match_en-US" }`

**Solution 2: JSONB Column (PostgreSQL)**
```typescript
@Column("jsonb")
translations: {
  'en-US': { title: string, body: string },
  'es-ES': { title: string, body: string }
}
```

---

#### 4. **Implementing Soft Deletes**

**Problem**: Hard deletes lose data; can't restore accidentally deleted articles

**Solution**:
```typescript
@Entity()
export class KnowledgeArticle {
  // ... existing fields
  
  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedAt?: Date;
}
```

**Query Updates**:
```typescript
// Find non-deleted articles
const articles = await articleRepo.find({
  where: { tenant: { id: tenantId }, isDeleted: false }
});

// Soft delete
article.isDeleted = true;
article.deletedAt = new Date();
await articleRepo.save(article);
```

**Duplicate Detection Impact**:
- Exclude deleted articles from checks
- Option to detect duplicates against deleted articles (warn about recreation)

---

#### 5. **Adding More Event Types**

**Current**: Only `duplicate_article_warning` event

**Future Events**:
```typescript
enum EventType {
  ARTICLE_CREATED = 'article.created',
  ARTICLE_UPDATED = 'article.updated',
  ARTICLE_DELETED = 'article.deleted',
  DUPLICATE_DETECTED = 'article.duplicate_detected',
  DUPLICATE_RESOLVED = 'article.duplicate_resolved',
  TENANT_CREATED = 'tenant.created',
  SEARCH_PERFORMED = 'search.performed',
}
```

**Scaling Event Processing**:

**a) Topic-Based Routing (RabbitMQ Exchanges)**
```typescript
// Publish to exchange instead of queue
channel.publish('kb-events', 'article.created', Buffer.from(JSON.stringify(event)));

// Consumers subscribe to topics
channel.bindQueue(queue, 'kb-events', 'article.*');
channel.bindQueue(analyticsQueue, 'kb-events', 'search.*');
```

**b) Separate Workers per Event Type**
```yaml
services:
  duplicate-worker:
    # Handles article.duplicate_detected
  
  analytics-worker:
    # Handles search.performed
  
  notification-worker:
    # Handles article.created, article.updated
```

**c) Dead Letter Queue for Failed Events**
```typescript
await channel.assertQueue('duplicate-warnings', {
  durable: true,
  deadLetterExchange: 'dlx',
  deadLetterRoutingKey: 'failed-events'
});
```
- Failed events move to DLQ after 3 retries
- Manual inspection/reprocessing
- Prevents infinite retry loops

---

### Infrastructure Evolution

**Phase 1: Current (Prototype)**
- SQLite, single API, single worker
- Handles: 10 tenants, 10K articles, 100 req/min

**Phase 2: Small Production (100 tenants, 100K articles)**
- PostgreSQL with indexes
- 3 API instances behind load balancer
- 2 worker instances
- Redis cache
- Handles: 1000 req/min

**Phase 3: Medium Production (1000 tenants, 1M articles)**
- PostgreSQL with read replicas
- 10 API instances (auto-scaling)
- 5 worker instances (auto-scaling)
- Redis cluster
- Full-text search (Elasticsearch)
- Handles: 10K req/min

**Phase 4: Large Scale (10K tenants, 100M articles)**
- PostgreSQL sharding by tenant
- 50+ API instances (Kubernetes)
- 20+ worker instances
- Distributed cache (Redis Cluster)
- CDN for static content
- Separate microservices (search, analytics, notifications)
- Handles: 100K req/min

---
## Future Work

### Enhancements

1. **Advanced Duplicate Detection**
   - **Fuzzy string matching** using Levenshtein distance (e.g., "API Design" ≈ "API Designing")
   - **Semantic similarity** using NLP embeddings (e.g., BERT, Sentence Transformers)
   - **TF-IDF or BM25** for content-based similarity
   - **Configurable threshold** for similarity scores

2. **Database Improvements**
   - **PostgreSQL/MySQL** support for production (currently using SQLite)
   - **Database migrations** using TypeORM migrations instead of `synchronize: true`
   - **Full-text search** for article content
   - **Database indexing** on frequently queried fields

3. **Authentication & Authorization**
   - **JWT-based authentication**
   - **Role-based access control (RBAC)** for tenants
   - **API key management** for external integrations

4. **Testing**
   - **Unit tests** with Jest
   - **Integration tests** for API endpoints
   - **E2E tests** with Supertest
   - **Test coverage** reporting

5. **Monitoring & Observability**
   - **Prometheus** metrics for API performance
   - **Grafana** dashboards for visualization
   - **Distributed tracing** with OpenTelemetry
   - **Health check endpoints** for Kubernetes

6. **Performance Optimization**
   - **Caching** with Redis for frequently accessed data
   - **Database connection pooling**
   - **Pagination** for list endpoints
   - **Rate limiting** to prevent abuse

7. **Advanced Features**
   - **Versioning** of articles (track changes over time)
   - **Article relationships** (references, prerequisites)
   - **Search suggestions** and autocomplete
   - **Bulk import/export** functionality
   - **Scheduled duplicate scans** (cron jobs)

8. **DevOps**
   - **CI/CD pipeline** with GitHub Actions
   - **Kubernetes deployment** manifests
   - **Helm charts** for easy deployment
   - **Blue-green deployments** for zero-downtime updates

9. **Documentation**
   - **API versioning** strategy
   - **Postman collection** for easy testing
   - **Architecture decision records (ADRs)**
   - **Contribution guidelines**

10. **Worker Enhancements**
    - **Dead letter queue** for failed events
    - **Retry logic** with exponential backoff
    - **Worker scaling** based on queue depth
    - **Priority queues** for critical events

---

**Built with ❤️ using TypeScript, Express, and RabbitMQ**
