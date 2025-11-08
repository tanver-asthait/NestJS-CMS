import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PostsService } from './posts.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';

/**
 * Migration script to convert string category and placement IDs to ObjectId
 *
 * Run this script once to fix existing posts:
 * npx ts-node src/posts/migrate-to-objectid.script.ts
 */
async function migratePostsToObjectId() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const postModel = app.get<Model<PostDocument>>('PostModel');

  console.log('🚀 Starting migration: Converting string IDs to ObjectId...');

  try {
    // Find all posts where category or placement are strings
    const posts = await postModel.find().exec();

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        let needsUpdate = false;
        const updateData: any = {};

        // Check if category is a string
        if (typeof post.category === 'string') {
          console.log(
            `  📝 Post "${post.title}" - category is string: ${post.category}`,
          );
          updateData.category = new Types.ObjectId(post.category);
          needsUpdate = true;
        }

        // Check if placement is a string
        if (typeof post.placement === 'string') {
          console.log(
            `  📝 Post "${post.title}" - placement is string: ${post.placement}`,
          );
          updateData.placement = new Types.ObjectId(post.placement);
          needsUpdate = true;
        }

        if (needsUpdate) {
          await postModel.updateOne({ _id: post._id }, { $set: updateData });
          migratedCount++;
          console.log(`  ✅ Migrated: ${post.title}`);
        } else {
          skippedCount++;
          console.log(`  ⏭️  Skipped: ${post.title} (already ObjectId)`);
        }
      } catch (error) {
        errorCount++;
        console.error(
          `  ❌ Error migrating post "${post.title}":`,
          error.message,
        );
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Migrated: ${migratedCount} posts`);
    console.log(`  ⏭️  Skipped: ${skippedCount} posts (already correct)`);
    console.log(`  ❌ Errors: ${errorCount} posts`);
    console.log(`  📝 Total: ${posts.length} posts processed`);

    // Verify the migration
    console.log('\n🔍 Verification:');
    const remainingStringIds = await postModel
      .find({
        $or: [
          { category: { $type: 'string' } },
          { placement: { $type: 'string' } },
        ],
      })
      .exec();

    if (remainingStringIds.length === 0) {
      console.log(
        '  ✅ All posts now have ObjectId for category and placement!',
      );
    } else {
      console.log(
        `  ⚠️  Warning: ${remainingStringIds.length} posts still have string IDs`,
      );
      remainingStringIds.forEach((post) => {
        console.log(`    - ${post.title} (ID: ${post._id})`);
      });
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await app.close();
    console.log('\n👋 Migration script completed');
  }
}

// Run the migration
migratePostsToObjectId()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
