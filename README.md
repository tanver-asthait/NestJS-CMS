<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

BDJobs CMS - A NestJS-based Content Management System with Angular frontend.

### Key Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access control (ADMIN, EDITOR, VIEWER)
- 📝 **Post Management** - Create, update, and organize posts with categories, placements, and tags
- 🏷️ **Categories & Placements** - Organize content with customizable categories and placement positions
- 👥 **User Management** - Multi-user support with role-based permissions
- 📊 **Dashboard** - Real-time statistics and content overview
- 🔍 **Advanced Filtering** - Filter posts by category, placement, status, tags, and search
- ⚡ **Performance Optimized** - Uses MongoDB ObjectId for faster queries and indexing
- 📱 **Responsive Admin Panel** - Angular 18-based admin interface with modern UI

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn
- TypeScript knowledge (for development)

## Project setup

```bash
# Install dependencies
$ npm install

# Set up environment variables
$ cp .env.example .env
```

**Important:** After copying `.env.example` to `.env`, update the following variables:

- `MONGODB_URI` - Your MongoDB connection string (default: `mongodb://localhost:27017/bdjobs-cms`)
- `JWT_SECRET` - A secure random string for JWT token signing (generate a secure one for production)
- `PORT` - Application port (default: 3000)

### Generate a secure JWT secret:

```bash
$ node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Local MongoDB Setup (macOS):

```bash
# Install MongoDB using Homebrew
$ brew tap mongodb/brew
$ brew install mongodb-community

# Start MongoDB service
$ brew services start mongodb-community

# Verify MongoDB is running
$ mongosh --eval "db.adminCommand('ping')"
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

### Posts API

#### Post Schema Fields

```typescript
{
  title: string;           // Post title (required)
  slug: string;            // URL-friendly slug (required, unique)
  excerpt?: string;        // Short description
  content: string;         // Full post content (required)
  image?: string;          // Featured image URL
  status: PostStatus;      // DRAFT | PUBLISHED | ARCHIVED
  author: ObjectId;        // Reference to User
  category: ObjectId;      // Reference to Category (stored as ObjectId)
  placement: ObjectId;     // Reference to Placement (stored as ObjectId)
  tags?: string[];         // Array of tags
  orderNo: number;         // Display order (required, default: 0)
  viewCount: number;       // View counter (default: 0)
  publishedAt?: Date;      // Publication date
  expiredAt?: Date;        // Expiration date
  metaTitle?: string;      // SEO meta title
  metaDescription?: string;// SEO meta description
}
```

#### Important Notes about ObjectId

**Category and Placement fields are stored as MongoDB ObjectId** (not strings) for better performance:

- ✅ **3-5x faster queries** compared to string matching
- ✅ **Smaller index size** (12 bytes vs 24+ bytes)
- ✅ **Better MongoDB optimization** with native ObjectId comparison

If you have existing posts with string IDs, run the migration script:

```bash
$ npx ts-node src/posts/migrate-to-objectid.script.ts
```

This will convert all string category/placement IDs to ObjectId format.

#### Key Endpoints

```http
# Get all posts with pagination
GET /posts?page=1&limit=10&status=PUBLISHED

# Filter posts by category name and placement name
GET /posts/filter?categoryName=Technology&placementName=Header

# Get post by ID
GET /posts/:id

# Get post by slug
GET /posts/slug/:slug

# Create post (requires authentication)
POST /posts
Body: {
  "title": "My Post",
  "slug": "my-post",
  "content": "Content here",
  "category": "category_id",
  "placement": "placement_id",
  "orderNo": 100,
  "status": "PUBLISHED"
}

# Update post (requires authentication)
PATCH /posts/:id

# Delete post (requires authentication)
DELETE /posts/:id
```

#### Post Sorting

Posts are sorted by:

1. **orderNo** (ascending) - Lower numbers appear first
2. **publishedAt** (descending) - Newer posts appear first when orderNo is the same

Example: Posts with orderNo 1, 10, 100, 200 will appear in that order.

### Categories API

```http
GET /categories              # Get all categories
GET /categories/:id          # Get category by ID
POST /categories             # Create category (auth required)
PATCH /categories/:id        # Update category (auth required)
DELETE /categories/:id       # Delete category (auth required)
```

### Placements API

```http
GET /placements                        # Get all active placements
GET /placements/all                    # Get all placements (including inactive)
GET /placements/subcategory/:subCat    # Get by subcategory
GET /placements/:id                    # Get placement by ID
POST /placements                       # Create placement (auth required)
PATCH /placements/:id                  # Update placement (auth required)
DELETE /placements/:id                 # Delete placement (auth required)
```

### Authentication API

```http
POST /auth/register    # Register new user
POST /auth/login       # Login and get JWT token
GET /auth/profile      # Get current user profile (auth required)
```

For complete API documentation with examples, see:

- `api-endpoints.http` - REST Client file with all endpoints
- `BDJobs-CMS-API.postman_collection.json` - Postman collection
- `api-documentation.html` - Generated API documentation

## Documentation

### 📚 Available Documentation

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card with common commands, API endpoints, and tasks
- **[CHANGELOG.md](./CHANGELOG.md)** - Recent updates, new features, and bug fixes
- **[docs/POST_SCHEMA.md](./docs/POST_SCHEMA.md)** - Complete Post schema documentation with all fields, DTOs, and examples
- **[docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)** - Step-by-step guide for migrating string IDs to ObjectId
- **[api-endpoints.http](./api-endpoints.http)** - REST Client examples for all API endpoints
- **[BDJobs-CMS-API.postman_collection.json](./BDJobs-CMS-API.postman_collection.json)** - Postman collection for API testing

### 🎯 Quick Links

- **Quick commands and API reference?** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **New to the project?** Start with [Key Features](#key-features) and [Project Setup](#project-setup)
- **Need API reference?** Check [API Documentation](#api-documentation) or `api-endpoints.http`
- **Database schema details?** See [docs/POST_SCHEMA.md](./docs/POST_SCHEMA.md)
- **Have existing data?** Follow [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)
- **Recent changes?** Read [CHANGELOG.md](./CHANGELOG.md)

## Database Schema

### Document Type Declarations

This project uses **HydratedDocument** from Mongoose for proper TypeScript support:

```typescript
// ✅ Correct way (provides full type safety with _id property)
export type CategoryDocument = HydratedDocument<Category>;
export type PlacementDocument = HydratedDocument<Placement>;
export type PostDocument = HydratedDocument<Post>;

// ❌ Avoid this pattern (TypeScript doesn't infer _id properly)
export type CategoryDocument = Category & Document;
```

### Performance Best Practices

1. **Always use ObjectId for references** - Store category, placement, author as ObjectId, not strings
2. **Use proper TypeScript types** - HydratedDocument provides \_id type inference
3. **Index frequently queried fields** - MongoDB automatically indexes \_id, but consider adding indexes for:
   - `slug` (unique)
   - `status + publishedAt` (compound index for published posts)
   - `category + status` (for category filtering)
   - `placement + status` (for placement filtering)

### Migration Guide

If you have existing data with string IDs instead of ObjectId:

```bash
# Run the migration script
$ npx ts-node src/posts/migrate-to-objectid.script.ts
```

The script will:

- ✅ Find all posts with string category/placement IDs
- ✅ Convert them to ObjectId format
- ✅ Show detailed progress and summary
- ✅ Verify the migration was successful

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
