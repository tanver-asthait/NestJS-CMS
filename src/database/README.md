# Database Seeder

This seeder script populates your BDJobs CMS database with sample data including users, categories, placements, and posts.

## What it creates:

### Users (3 total)
- **Admin User**: `admin@bdjobs.com` / `admin123`
- **Editor User**: `editor@bdjobs.com` / `editor123` 
- **Author User**: `author@bdjobs.com` / `author123`

### Categories (5 total)
- Jobs (Top Navigation)
- Technology (Top Navigation)
- Career Tips (Right Sidebar)
- Company News (Left Sidebar)
- Industry Insights (Bottom)

### Placements (6 total)
- Top Banner (Header)
- Featured Posts (Featured)
- Right Sidebar (Right Sidebar)
- Left Sidebar (Left Sidebar)
- Footer Section (Footer)
- Bottom Content (Bottom)

### Posts (6 total)
- 5 Published posts with different topics
- 1 Draft post
- Posts are distributed across different categories and placements
- Each post has realistic content, tags, and images

## Running the Seeder

1. Make sure your MongoDB database is running
2. Ensure your `.env` file is configured with correct database connection
3. Run the seeder:

```bash
npm run seed
```

## What happens during seeding:

1. Creates users with different roles
2. Creates categories with proper subcategories and colors
3. Creates placements with different positioning
4. Creates posts assigned to categories/placements and authored by different users
5. Handles duplicate data gracefully (won't create duplicates if run multiple times)

## Output

The seeder provides detailed console output showing:
- ✅ Successful creations
- ⚠️ Warnings for existing data
- 📊 Final summary with counts
- 🔐 Login credentials for testing

## After Seeding

You can immediately:
1. Log into the admin panel with any of the provided credentials
2. Browse the created content
3. Test the filtering endpoints with real data
4. Create additional content using the seeded data as templates

## Troubleshooting

If you encounter errors:
1. Check your MongoDB connection
2. Ensure all services are running
3. Check for validation errors in the console output
4. Clear existing data if you want a fresh start

The seeder is idempotent - you can run it multiple times safely.