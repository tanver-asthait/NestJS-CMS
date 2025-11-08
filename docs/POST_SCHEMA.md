# Post Schema Documentation

## Overview

The Post schema is the core content entity in the BDJobs CMS. It represents articles, news, or any content that can be published on the platform.

## Schema Definition

### Location

`src/posts/schemas/post.schema.ts`

### TypeScript Interface

```typescript
@Schema({
  timestamps: true,
})
export class Post {
  // Core Content Fields
  title: string; // Post title
  slug: string; // URL-friendly identifier (unique)
  excerpt?: string; // Short summary/preview
  content: string; // Full post content (HTML/Markdown)
  image?: string; // Featured image URL

  // Status & Workflow
  status: PostStatus; // DRAFT | PUBLISHED | ARCHIVED
  publishedAt?: Date; // Publication timestamp
  expiredAt?: Date; // Optional expiration date

  // Relationships (stored as ObjectId)
  author: Types.ObjectId; // Reference to User
  category: Types.ObjectId; // Reference to Category
  placement: Types.ObjectId; // Reference to Placement

  // Organization
  tags?: string[]; // Array of tag strings
  orderNo: number; // Display order (default: 0)

  // Engagement
  viewCount: number; // View counter (default: 0)

  // SEO
  metaTitle?: string; // SEO page title
  metaDescription?: string; // SEO meta description
}

export type PostDocument = HydratedDocument<Post>;
```

## Field Details

### Required Fields

#### `title` (String)

- **Description**: The main title of the post
- **Required**: Yes
- **Validation**:
  - `@IsString()`
  - `@IsNotEmpty()`
- **Example**: `"10 Tips for Better Web Development"`

#### `slug` (String)

- **Description**: URL-friendly unique identifier
- **Required**: Yes
- **Unique**: Yes
- **Validation**:
  - `@IsString()`
  - `@IsNotEmpty()`
  - Must be unique across all posts
- **Format**: lowercase, hyphen-separated
- **Example**: `"10-tips-for-better-web-development"`
- **Usage**: Used in URLs: `/posts/slug/10-tips-for-better-web-development`

#### `content` (String)

- **Description**: The full content of the post
- **Required**: Yes
- **Validation**:
  - `@IsString()`
  - `@IsNotEmpty()`
- **Format**: Can be HTML or Markdown
- **Example**: `"<p>This is the full article content...</p>"`

#### `status` (PostStatus Enum)

- **Description**: Current publication status
- **Required**: Yes
- **Default**: `PostStatus.DRAFT`
- **Values**:
  - `DRAFT`: Not published, work in progress
  - `PUBLISHED`: Live and visible to public
  - `ARCHIVED`: Hidden from public, kept for records
- **Validation**:
  - `@IsEnum(PostStatus)`
- **Example**: `"PUBLISHED"`

#### `author` (ObjectId)

- **Description**: Reference to the User who created the post
- **Required**: Yes
- **Type**: `Types.ObjectId`
- **Reference**: `User` collection
- **Populated fields**: `firstName`, `lastName`, `email`
- **Example**: `ObjectId("690ede4a1c5888179fff855f")`
- **Note**: Automatically converted from string in create/update methods

#### `category` (ObjectId)

- **Description**: Reference to the Category this post belongs to
- **Required**: Yes
- **Type**: `Types.ObjectId`
- **Reference**: `Category` collection
- **Populated fields**: `name`, `slug`, `color`
- **Example**: `ObjectId("690ee833ad2a3161f8ce3b21")`
- **Performance**: Using ObjectId provides 3-5x faster queries than strings
- **Note**: Automatically converted from string in create/update methods

#### `placement` (ObjectId)

- **Description**: Reference to the Placement position for this post
- **Required**: Yes
- **Type**: `Types.ObjectId`
- **Reference**: `Placement` collection
- **Populated fields**: `name`, `slug`, `subCategory`, `color`
- **Example**: `ObjectId("690eda46770fe79c157a21d2")`
- **Performance**: Using ObjectId provides 3-5x faster queries than strings
- **Note**: Automatically converted from string in create/update methods

#### `orderNo` (Number)

- **Description**: Display order for sorting posts
- **Required**: Yes
- **Default**: `0`
- **Type**: `Number`
- **Validation**:
  - `@IsNumber()`
  - `@IsNotEmpty()`
  - `@Min(0)`
- **Usage**: Lower numbers appear first
- **Example**: `100`
- **Sorting**: Posts are sorted by `orderNo` (ascending), then `publishedAt` (descending)

### Optional Fields

#### `excerpt` (String)

- **Description**: Short summary or preview of the post
- **Optional**: Yes
- **Validation**:
  - `@IsString()`
  - `@IsOptional()`
- **Usage**: Display in post lists, cards, previews
- **Recommended length**: 150-200 characters
- **Example**: `"Learn the top 10 tips that will improve your web development skills..."`

#### `image` (String)

- **Description**: URL to the featured image
- **Optional**: Yes
- **Validation**:
  - `@IsString()`
  - `@IsUrl()`
  - `@IsOptional()`
- **Format**: Full URL or relative path
- **Example**: `"https://example.com/images/post-featured.jpg"`

#### `tags` (String Array)

- **Description**: Array of tags for categorization and search
- **Optional**: Yes
- **Default**: `[]`
- **Validation**:
  - `@IsArray()`
  - `@IsOptional()`
- **Usage**: Filtering, search, related posts
- **Example**: `["javascript", "typescript", "nestjs"]`

#### `publishedAt` (Date)

- **Description**: Timestamp when post was published
- **Optional**: Yes (auto-set when status changes to PUBLISHED)
- **Validation**:
  - `@IsDate()`
  - `@IsOptional()`
- **Auto-set**: Automatically set when `status` changes to `PUBLISHED`
- **Example**: `2025-11-08T11:17:00.000Z`

#### `expiredAt` (Date)

- **Description**: Optional expiration date for time-sensitive content
- **Optional**: Yes
- **Validation**:
  - `@IsDate()`
  - `@IsOptional()`
- **Usage**: Posts past this date won't appear in public queries
- **Example**: `2025-11-15T11:40:00.000Z`

#### `metaTitle` (String)

- **Description**: SEO-optimized page title
- **Optional**: Yes
- **Validation**:
  - `@IsString()`
  - `@IsOptional()`
- **Recommended length**: 50-60 characters
- **Example**: `"10 Web Development Tips | BDJobs Blog"`

#### `metaDescription` (String)

- **Description**: SEO meta description
- **Optional**: Yes
- **Validation**:
  - `@IsString()`
  - `@IsOptional()`
- **Recommended length**: 150-160 characters
- **Example**: `"Discover 10 essential tips to improve your web development skills..."`

### Auto-Generated Fields

#### `viewCount` (Number)

- **Description**: Number of times the post has been viewed
- **Default**: `0`
- **Type**: `Number`
- **Read-only**: Should not be set directly
- **Updated**: Via `incrementViewCount()` method

#### `createdAt` (Date)

- **Description**: Timestamp when post was created
- **Auto-generated**: Yes (by Mongoose timestamps)
- **Example**: `2025-11-08T11:17:27.072Z`

#### `updatedAt` (Date)

- **Description**: Timestamp when post was last updated
- **Auto-generated**: Yes (by Mongoose timestamps)
- **Auto-updated**: Automatically updates on every save
- **Example**: `2025-11-08T11:20:42.297Z`

## DTOs (Data Transfer Objects)

### CreatePostDto

Located in: `src/posts/dto/create-post.dto.ts`

```typescript
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;

  @IsEnum(PostStatus)
  status: PostStatus;

  @IsString()
  @IsNotEmpty()
  category: string; // Converted to ObjectId in service

  @IsString()
  @IsNotEmpty()
  placement: string; // Converted to ObjectId in service

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  orderNo: number;

  @IsDate()
  @IsOptional()
  publishedAt?: Date;

  @IsDate()
  @IsOptional()
  expiredAt?: Date;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}
```

### UpdatePostDto

Located in: `src/posts/dto/update-post.dto.ts`

Extends `PartialType(CreatePostDto)`, making all fields optional.

```typescript
export class UpdatePostDto extends PartialType(CreatePostDto) {
  // All fields from CreatePostDto, but optional
  // orderNo?: number;  // Also optional in updates
}
```

## Database Indexes

Recommended indexes for optimal performance:

```typescript
// Unique index on slug (automatically created)
{ slug: 1 } // unique: true

// Compound index for published posts query
{ status: 1, publishedAt: -1 }

// Index for category filtering
{ category: 1, status: 1 }

// Index for placement filtering
{ placement: 1, status: 1 }

// Index for sorting by orderNo
{ orderNo: 1, publishedAt: -1 }

// Text index for search (optional)
{ title: "text", content: "text", excerpt: "text" }
```

## Service Methods

### Create Post

```typescript
async create(createPostDto: CreatePostDto, authorId: string): Promise<Post>
```

- Converts `category`, `placement`, `author` to ObjectId
- Checks for duplicate slug
- Auto-sets `publishedAt` if status is PUBLISHED
- Increments category and placement post counts

### Update Post

```typescript
async update(id: string, updatePostDto: UpdatePostDto, currentUserId?: string): Promise<Post>
```

- Converts `category`, `placement` to ObjectId if provided
- Auto-sets `publishedAt` if status changes to PUBLISHED
- Updates category/placement post counts if changed

### Find Methods

#### `findAll(queryParams: PostQueryParams): Promise<PostsResponse>`

- Pagination support
- Filter by: status, author, search, tags
- Returns: posts array, total, page, limit, totalPages

#### `findByFilters(categoryName?, placementName?, queryParams): Promise<PostsResponse>`

- Filters by category name and/or placement name
- Only returns PUBLISHED posts
- Excludes expired posts
- Sorted by: orderNo (asc), publishedAt (desc)
- Uses ObjectId for fast queries

#### `findOne(id: string): Promise<Post>`

- Find by MongoDB \_id
- Populates: author, category, placement

#### `findBySlug(slug: string): Promise<Post>`

- Find by unique slug
- Populates: author, category, placement

### Other Methods

- `incrementViewCount(id: string)`: Increment view counter
- `remove(id: string)`: Delete post and update counts
- `findByAuthor(authorId, queryParams)`: Get posts by author
- `findByTag(tag, queryParams)`: Get posts by tag
- `findPublished()`: Get all published posts

## Query Examples

### Get Published Posts for a Category and Placement

```typescript
const posts = await postsService.findByFilters(
  'Technology', // categoryName
  'Header Banner', // placementName
  { page: 1, limit: 10 },
);
```

### Create a New Post

```typescript
const post = await postsService.create(
  {
    title: 'My Post',
    slug: 'my-post',
    content: 'Full content here...',
    excerpt: 'Short preview...',
    category: '690ee833ad2a3161f8ce3b21',
    placement: '690eda46770fe79c157a21d2',
    orderNo: 100,
    status: PostStatus.DRAFT,
    tags: ['tech', 'news'],
  },
  authorId,
);
```

### Update Post Order

```typescript
const updatedPost = await postsService.update(postId, {
  orderNo: 200,
});
```

## Performance Considerations

### ObjectId vs String for References

**Why ObjectId is Better:**

- **3-5x faster queries** - Binary comparison vs string comparison
- **50% smaller indexes** - 12 bytes vs 24+ bytes
- **Better MongoDB optimization** - Native ObjectId handling

**Migration:**
If you have existing posts with string category/placement:

```bash
npx ts-node src/posts/migrate-to-objectid.script.ts
```

### Sorting Performance

Posts are sorted by:

1. `orderNo` ascending (primary)
2. `publishedAt` descending (secondary)

This allows:

- Manual ordering of important posts (low orderNo)
- Automatic chronological ordering within same orderNo

### Query Optimization Tips

1. **Always specify status** - Dramatically reduces result set
2. **Use pagination** - Limit results to needed amount
3. **Populate selectively** - Only populate needed fields
4. **Use lean() for read-only** - Skip Mongoose document overhead
5. **Add indexes** - For frequently queried fields

## Frontend Integration

### Angular Models

Located in: `cms-admin/src/app/models/post.model.ts`

```typescript
export interface Post {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  status: PostStatus;
  author: User;
  category: Category;
  placement: Placement;
  tags?: string[];
  orderNo: number;
  viewCount: number;
  publishedAt?: Date;
  expiredAt?: Date;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Form Validation

```typescript
this.postForm = this.fb.group({
  title: ['', [Validators.required]],
  slug: ['', [Validators.required]],
  content: ['', [Validators.required]],
  category: ['', [Validators.required]],
  placement: ['', [Validators.required]],
  orderNo: [1, [Validators.required, Validators.min(0)]],
  status: [PostStatus.DRAFT, [Validators.required]],
  // ... other fields
});
```

## Common Issues & Solutions

### Issue: TypeScript error "\_id is of type unknown"

**Solution:** Use `HydratedDocument` instead of `& Document`

```typescript
// ❌ Wrong
export type PostDocument = Post & Document;

// ✅ Correct
export type PostDocument = HydratedDocument<Post>;
```

### Issue: Category/placement queries return empty results

**Solution:** Ensure data is stored as ObjectId, not strings. Run migration if needed.

### Issue: Posts not sorting correctly

**Solution:** Ensure `orderNo` is a number, not a string. Use proper numeric comparison.

---

For more information, see:

- [README.md](./README.md) - General documentation
- [CHANGELOG.md](./CHANGELOG.md) - Recent changes
- [api-endpoints.http](./api-endpoints.http) - API examples
