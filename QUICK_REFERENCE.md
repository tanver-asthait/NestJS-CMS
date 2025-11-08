# Quick Reference Card - BDJobs CMS

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run development server
npm run start:dev

# Run production server
npm run start:prod

# Run tests
npm test
```

## 📡 API Endpoints

### Base URL

```
http://localhost:3000
```

### Authentication

```http
POST /auth/register          # Register new user
POST /auth/login             # Login (returns JWT token)
GET  /auth/profile           # Get current user (requires auth)
```

### Posts

```http
GET    /posts                              # Get all posts (paginated)
GET    /posts/filter?categoryName=X        # Filter by category name
GET    /posts/filter?placementName=Y       # Filter by placement name
GET    /posts/:id                          # Get post by ID
GET    /posts/slug/:slug                   # Get post by slug
POST   /posts                              # Create post (requires auth)
PATCH  /posts/:id                          # Update post (requires auth)
DELETE /posts/:id                          # Delete post (requires auth)
PATCH  /posts/:id/view                     # Increment view count
```

### Categories

```http
GET    /categories           # Get all categories
GET    /categories/:id       # Get category by ID
POST   /categories           # Create category (requires auth)
PATCH  /categories/:id       # Update category (requires auth)
DELETE /categories/:id       # Delete category (requires auth)
```

### Placements

```http
GET    /placements                        # Get all active placements
GET    /placements/subcategory/:subCat   # Get by subcategory
GET    /placements/:id                    # Get placement by ID
POST   /placements                        # Create placement (requires auth)
PATCH  /placements/:id                    # Update placement (requires auth)
DELETE /placements/:id                    # Delete placement (requires auth)
```

### Users

```http
GET    /users              # Get all users (requires auth)
GET    /users/:id          # Get user by ID (requires auth)
POST   /users              # Create user (requires auth)
PATCH  /users/:id          # Update user (requires auth)
DELETE /users/:id          # Delete user (requires auth)
```

## 📝 Post Object Structure

### Minimum Required Fields

```json
{
  "title": "My Post Title",
  "slug": "my-post-title",
  "content": "Full post content here...",
  "category": "category_id_here",
  "placement": "placement_id_here",
  "orderNo": 100,
  "status": "DRAFT"
}
```

### Complete Post Object

```json
{
  "title": "My Post Title",
  "slug": "my-post-title",
  "excerpt": "Short preview text...",
  "content": "Full post content here...",
  "image": "https://example.com/image.jpg",
  "status": "PUBLISHED",
  "category": "690ee833ad2a3161f8ce3b21",
  "placement": "690eda46770fe79c157a21d2",
  "tags": ["tech", "news"],
  "orderNo": 100,
  "publishedAt": "2025-11-08T10:00:00.000Z",
  "expiredAt": "2025-12-08T10:00:00.000Z",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description"
}
```

## 🏷️ Field Reference

### Post Fields

| Field             | Type     | Required | Default | Description                          |
| ----------------- | -------- | -------- | ------- | ------------------------------------ |
| `title`           | String   | ✅ Yes   | -       | Post title                           |
| `slug`            | String   | ✅ Yes   | -       | URL-friendly identifier (unique)     |
| `content`         | String   | ✅ Yes   | -       | Full post content                    |
| `category`        | String   | ✅ Yes   | -       | Category ID (converted to ObjectId)  |
| `placement`       | String   | ✅ Yes   | -       | Placement ID (converted to ObjectId) |
| `orderNo`         | Number   | ✅ Yes   | 0       | Display order (lower = first)        |
| `status`          | Enum     | ✅ Yes   | DRAFT   | DRAFT, PUBLISHED, ARCHIVED           |
| `excerpt`         | String   | ❌ No    | -       | Short preview                        |
| `image`           | String   | ❌ No    | -       | Featured image URL                   |
| `tags`            | String[] | ❌ No    | []      | Array of tags                        |
| `publishedAt`     | Date     | ❌ No    | -       | Publication date (auto-set)          |
| `expiredAt`       | Date     | ❌ No    | -       | Expiration date                      |
| `metaTitle`       | String   | ❌ No    | -       | SEO title                            |
| `metaDescription` | String   | ❌ No    | -       | SEO description                      |

### Status Values

- `DRAFT` - Not published, work in progress
- `PUBLISHED` - Live and visible to public
- `ARCHIVED` - Hidden from public

### Post Sorting

1. **Primary:** `orderNo` (ascending) - Lower numbers first
2. **Secondary:** `publishedAt` (descending) - Newer posts first

Example order: 1, 10, 50, 100, 200, 1000

## 🔐 Authentication

### Get JWT Token

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Use Token in Requests

```bash
# Add Authorization header
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## 🔧 Common Tasks

### Create a New Post

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "slug": "my-post",
    "content": "Content here...",
    "category": "category_id",
    "placement": "placement_id",
    "orderNo": 100,
    "status": "PUBLISHED"
  }'
```

### Get Posts by Category

```bash
# By category name
curl "http://localhost:3000/posts/filter?categoryName=Technology"

# By category ID
curl "http://localhost:3000/posts/category/690ee833ad2a3161f8ce3b21"
```

### Filter Posts

```bash
# By category AND placement
curl "http://localhost:3000/posts/filter?categoryName=Technology&placementName=Header"

# With pagination
curl "http://localhost:3000/posts/filter?categoryName=Technology&page=2&limit=20"
```

### Update Post Order

```bash
curl -X PATCH http://localhost:3000/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderNo": 200}'
```

### Publish a Draft

```bash
curl -X PATCH http://localhost:3000/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PUBLISHED"}'
```

## 🗄️ Database Tasks

### Check Post Storage Format

```bash
# Connect to MongoDB
mongosh "your-connection-string"

# Check post structure
db.posts.findOne({}, { category: 1, placement: 1, author: 1 })
```

### Migrate to ObjectId

```bash
# Run migration script
npx ts-node src/posts/migrate-to-objectid.script.ts
```

### Backup Database

```bash
# Full backup
mongodump --uri="your-connection-string" --out=./backup

# Restore
mongorestore --uri="your-connection-string" ./backup
```

### Add Indexes

```javascript
// In MongoDB shell
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ status: 1, publishedAt: -1 });
db.posts.createIndex({ category: 1, status: 1 });
db.posts.createIndex({ placement: 1, status: 1 });
db.posts.createIndex({ orderNo: 1, publishedAt: -1 });
```

## 📊 Query Parameters

### Pagination

```http
?page=1              # Page number (default: 1)
?limit=10            # Items per page (default: 10)
```

### Filters

```http
?status=PUBLISHED    # Filter by status
?author=USER_ID      # Filter by author ID
?search=keyword      # Search in title/content/excerpt
?tags=tech,news      # Filter by tags (comma-separated)
```

### Examples

```bash
# Page 2, 20 items per page
GET /posts?page=2&limit=20

# Published posts only
GET /posts?status=PUBLISHED

# Search with pagination
GET /posts?search=javascript&page=1&limit=10

# Multiple filters
GET /posts?status=PUBLISHED&tags=tech&page=1
```

## 🚨 Troubleshooting

### Common Issues

**Issue:** Posts not appearing in filter results

```bash
# Check if posts are published
db.posts.find({ status: "PUBLISHED" }).count()

# Check expiration dates
db.posts.find({ expiredAt: { $exists: true, $gt: new Date() } }).count()
```

**Issue:** TypeScript error with `_id`

```typescript
// ❌ Wrong
export type PostDocument = Post & Document;

// ✅ Correct
export type PostDocument = HydratedDocument<Post>;
```

**Issue:** Slow queries

```bash
# Check if using ObjectId (fast)
db.posts.findOne({}, { category: 1, placement: 1 })
# Should show: ObjectId("...") not "..."

# Run migration if needed
npx ts-node src/posts/migrate-to-objectid.script.ts
```

## 📈 Performance Tips

1. **Use ObjectId for references** - 3-5x faster than strings
2. **Add proper indexes** - Dramatically speeds up queries
3. **Use pagination** - Don't load all posts at once
4. **Filter by status first** - Reduces result set
5. **Populate selectively** - Only load needed fields

## 🔗 Useful Links

- **Full Documentation:** [README.md](./README.md)
- **API Examples:** [api-endpoints.http](./api-endpoints.http)
- **Schema Details:** [docs/POST_SCHEMA.md](./docs/POST_SCHEMA.md)
- **Migration Guide:** [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)
- **Recent Changes:** [CHANGELOG.md](./CHANGELOG.md)
- **Postman Collection:** [BDJobs-CMS-API.postman_collection.json](./BDJobs-CMS-API.postman_collection.json)

## 💡 Pro Tips

- Use `.http` files with REST Client VS Code extension for quick API testing
- Import Postman collection for comprehensive API testing
- Run migration script after importing existing data
- Set proper JWT_SECRET in production (use strong random string)
- Enable MongoDB replica set for transactions (if needed)
- Use MongoDB Atlas for cloud hosting with automatic backups
- Add indexes before deploying to production
- Monitor query performance with MongoDB Atlas Performance Advisor

---

**Need help?** Check the [full documentation](./README.md) or create an issue in the repository.
