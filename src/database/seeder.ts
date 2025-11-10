import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CategoriesService } from '../categories/categories.service';
import { PlacementsService } from '../placements/placements.service';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { PostStatus } from '../posts/schemas/post.schema';
import { UserRole } from '../users/schemas/user.schema';
import { SubCategory } from '../categories/category.schema';
import { SubCategory as PlacementSubCategory } from '../placements/placement.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const categoriesService = app.get(CategoriesService);
  const placementsService = app.get(PlacementsService);
  const postsService = app.get(PostsService);
  const usersService = app.get(UsersService);

  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user first
    console.log('👤 Creating admin user...');
    const adminUser = await usersService.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@bdjobs.com',
      password: 'admin123',
      role: UserRole.ADMIN
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create editor user
    console.log('👤 Creating editor user...');
    const editorUser = await usersService.create({
      firstName: 'Editor',
      lastName: 'User',
      email: 'editor@bdjobs.com',
      password: 'editor123',
      role: UserRole.EDITOR
    });
    console.log('✅ Editor user created:', editorUser.email);

    // Create author user
    console.log('👤 Creating author user...');
    const authorUser = await usersService.create({
      firstName: 'John',
      lastName: 'Author',
      email: 'author@bdjobs.com',
      password: 'author123',
      role: UserRole.AUTHOR
    });
    console.log('✅ Author user created:', authorUser.email);

    // Seed Categories
    console.log('📂 Seeding categories...');
    const categories = [
      {
        name: 'Jobs',
        slug: 'jobs',
        subCategory: SubCategory.TOPNAV,
        description: 'Job listings and career opportunities',
        color: '#3498db',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Technology',
        slug: 'technology',
        subCategory: SubCategory.TOPNAV,
        description: 'Latest technology news and trends',
        color: '#e74c3c',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Career Tips',
        slug: 'career-tips',
        subCategory: SubCategory.RIGHTSIDEBAR,
        description: 'Professional development and career advice',
        color: '#2ecc71',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Company News',
        slug: 'company-news',
        subCategory: SubCategory.LEFTSIDEBAR,
        description: 'Latest company updates and announcements',
        color: '#f39c12',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Industry Insights',
        slug: 'industry-insights',
        subCategory: SubCategory.BOTTOM,
        description: 'Deep insights into various industries',
        color: '#9b59b6',
        isActive: true,
        sortOrder: 5
      }
    ];

    const createdCategories: any[] = [];
    for (const categoryData of categories) {
      try {
        const category = await categoriesService.create(categoryData);
        createdCategories.push(category);
        console.log(`✅ Category created: ${category.name}`);
      } catch (error) {
        console.log(`⚠️  Category already exists or error: ${categoryData.name}`);
      }
    }

    // Seed Placements
    console.log('📍 Seeding placements...');
    const placements = [
      {
        name: 'Top Banner',
        slug: 'top-banner',
        subCategory: PlacementSubCategory.HEADER,
        description: 'Main banner at the top of the page',
        color: '#e74c3c',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Featured Posts',
        slug: 'featured-posts',
        subCategory: PlacementSubCategory.FEATURED,
        description: 'Featured posts section',
        color: '#3498db',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Right Sidebar',
        slug: 'right-sidebar',
        subCategory: PlacementSubCategory.RIGHTSIDEBAR,
        description: 'Right sidebar placement',
        color: '#2ecc71',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Left Sidebar',
        slug: 'left-sidebar',
        subCategory: PlacementSubCategory.LEFTSIDEBAR,
        description: 'Left sidebar placement',
        color: '#f39c12',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Footer Section',
        slug: 'footer-section',
        subCategory: PlacementSubCategory.FOOTER,
        description: 'Footer area placement',
        color: '#95a5a6',
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'Bottom Content',
        slug: 'bottom-content',
        subCategory: PlacementSubCategory.BOTTOM,
        description: 'Bottom content area',
        color: '#9b59b6',
        isActive: true,
        sortOrder: 6
      }
    ];

    const createdPlacements: any[] = [];
    for (const placementData of placements) {
      try {
        const placement = await placementsService.create(placementData);
        createdPlacements.push(placement);
        console.log(`✅ Placement created: ${placement.name}`);
      } catch (error) {
        console.log(`⚠️  Placement already exists or error: ${placementData.name}`);
      }
    }

    // Seed Posts
    console.log('📄 Seeding posts...');
    const posts = [
      {
        title: 'Welcome to BDJobs CMS',
        slug: 'welcome-to-bdjobs-cms',
        excerpt: 'A comprehensive content management system for job portals and career websites.',
        content: `
          <h2>Welcome to BDJobs CMS</h2>
          <p>This is a powerful content management system built with NestJS and Angular, designed specifically for job portals and career websites.</p>
          
          <h3>Features</h3>
          <ul>
            <li>Modern Angular 20 frontend with signals</li>
            <li>NestJS backend with MongoDB</li>
            <li>Role-based access control</li>
            <li>Content categorization and placement management</li>
            <li>SEO-friendly URLs</li>
          </ul>
          
          <p>Get started by exploring the admin panel and creating your first job listing!</p>
        `,
        status: PostStatus.PUBLISHED,
        tags: ['cms', 'welcome', 'getting-started'],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        orderNo: 1,
        publishedAt: new Date(),
        expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        title: 'Top 10 Tech Skills in Demand for 2025',
        slug: 'top-10-tech-skills-2025',
        excerpt: 'Discover the most sought-after technology skills that employers are looking for in 2025.',
        content: `
          <h2>Top 10 Tech Skills in Demand for 2025</h2>
          <p>The technology landscape continues to evolve rapidly. Here are the skills that will be most valuable in 2025:</p>
          
          <ol>
            <li><strong>Artificial Intelligence & Machine Learning</strong> - AI continues to transform industries</li>
            <li><strong>Cloud Computing</strong> - AWS, Azure, and Google Cloud expertise</li>
            <li><strong>Cybersecurity</strong> - Protecting digital assets is crucial</li>
            <li><strong>Data Science & Analytics</strong> - Making sense of big data</li>
            <li><strong>DevOps & Automation</strong> - Streamlining development processes</li>
            <li><strong>Mobile Development</strong> - iOS and Android app development</li>
            <li><strong>Blockchain Technology</strong> - Beyond cryptocurrencies</li>
            <li><strong>Internet of Things (IoT)</strong> - Connected devices everywhere</li>
            <li><strong>Quantum Computing</strong> - The next frontier in computing</li>
            <li><strong>Full-Stack Development</strong> - Versatility is key</li>
          </ol>
          
          <p>Stay ahead of the curve by developing these in-demand skills!</p>
        `,
        status: PostStatus.PUBLISHED,
        tags: ['technology', 'skills', 'career', '2025'],
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        orderNo: 2,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        expiredAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      },
      {
        title: 'How to Write a Compelling Cover Letter',
        slug: 'how-to-write-compelling-cover-letter',
        excerpt: 'Master the art of writing cover letters that get you noticed by employers.',
        content: `
          <h2>How to Write a Compelling Cover Letter</h2>
          <p>A well-crafted cover letter can be the difference between landing an interview and getting overlooked. Here's how to make yours stand out:</p>
          
          <h3>1. Research the Company</h3>
          <p>Before you start writing, research the company culture, values, and recent news. This helps you tailor your letter effectively.</p>
          
          <h3>2. Start with a Strong Opening</h3>
          <p>Skip the generic "To whom it may concern" and address the hiring manager by name if possible. Open with enthusiasm and mention the specific position.</p>
          
          <h3>3. Highlight Relevant Achievements</h3>
          <p>Don't just repeat your resume. Choose 2-3 specific achievements that directly relate to the job requirements.</p>
          
          <h3>4. Show Your Personality</h3>
          <p>Let your personality shine through while maintaining professionalism. Companies want to know who you are as a person.</p>
          
          <h3>5. End with a Call to Action</h3>
          <p>Close by expressing enthusiasm for an interview and mention that you'll follow up.</p>
          
          <p>Remember: Keep it concise, error-free, and tailored to each position!</p>
        `,
        status: PostStatus.PUBLISHED,
        tags: ['career-tips', 'cover-letter', 'job-search'],
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
        orderNo: 3,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        expiredAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      },
      {
        title: 'Remote Work: Best Practices for 2025',
        slug: 'remote-work-best-practices-2025',
        excerpt: 'Essential tips and strategies for succeeding in remote work environments.',
        content: `
          <h2>Remote Work: Best Practices for 2025</h2>
          <p>Remote work has become the new normal for many professionals. Here are the best practices to thrive in a remote environment:</p>
          
          <h3>Setting Up Your Workspace</h3>
          <ul>
            <li>Invest in ergonomic furniture</li>
            <li>Ensure good lighting</li>
            <li>Minimize distractions</li>
            <li>Have reliable internet and backup options</li>
          </ul>
          
          <h3>Time Management</h3>
          <ul>
            <li>Establish clear boundaries between work and personal time</li>
            <li>Use time-blocking techniques</li>
            <li>Take regular breaks</li>
            <li>Set daily and weekly goals</li>
          </ul>
          
          <h3>Communication Skills</h3>
          <ul>
            <li>Over-communicate rather than under-communicate</li>
            <li>Master video conferencing etiquette</li>
            <li>Use collaborative tools effectively</li>
            <li>Schedule regular check-ins with your team</li>
          </ul>
          
          <p>Success in remote work requires discipline, communication skills, and the right tools!</p>
        `,
        status: PostStatus.PUBLISHED,
        tags: ['remote-work', 'productivity', 'work-life-balance'],
        image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
        orderNo: 4,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        expiredAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
      {
        title: 'Industry Spotlight: Fintech Revolution',
        slug: 'fintech-revolution-industry-spotlight',
        excerpt: 'Exploring the rapid growth and innovation in the financial technology sector.',
        content: `
          <h2>Industry Spotlight: Fintech Revolution</h2>
          <p>The financial technology (fintech) industry continues to disrupt traditional banking and financial services. Here's what's driving this revolution:</p>
          
          <h3>Key Trends in Fintech</h3>
          <ul>
            <li><strong>Digital Payments:</strong> Contactless and mobile payment solutions</li>
            <li><strong>Cryptocurrency:</strong> Mainstream adoption of digital currencies</li>
            <li><strong>Robo-Advisors:</strong> AI-powered investment management</li>
            <li><strong>RegTech:</strong> Technology solutions for regulatory compliance</li>
            <li><strong>InsurTech:</strong> Innovation in insurance technology</li>
          </ul>
          
          <h3>Career Opportunities</h3>
          <p>The fintech sector offers exciting career opportunities for professionals with diverse backgrounds:</p>
          <ul>
            <li>Software Engineers and Developers</li>
            <li>Data Scientists and Analysts</li>
            <li>Cybersecurity Specialists</li>
            <li>Product Managers</li>
            <li>Compliance and Risk Managers</li>
          </ul>
          
          <h3>Skills in Demand</h3>
          <ul>
            <li>Programming languages (Python, Java, JavaScript)</li>
            <li>Blockchain and cryptocurrency knowledge</li>
            <li>Financial regulations understanding</li>
            <li>API development and integration</li>
            <li>Machine learning and AI</li>
          </ul>
          
          <p>The fintech revolution is creating new opportunities while transforming how we think about money and financial services.</p>
        `,
        status: PostStatus.PUBLISHED,
        tags: ['fintech', 'industry-insights', 'career-opportunities', 'technology'],
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
        orderNo: 5,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        expiredAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
      },
      {
        title: 'Draft: Upcoming Features in BDJobs CMS',
        slug: 'upcoming-features-bdjobs-cms',
        excerpt: 'A preview of exciting new features coming to the BDJobs CMS platform.',
        content: `
          <h2>Upcoming Features in BDJobs CMS</h2>
          <p>We're constantly working to improve the BDJobs CMS platform. Here's a sneak peek at what's coming:</p>
          
          <h3>Enhanced User Experience</h3>
          <ul>
            <li>Improved dashboard design</li>
            <li>Better mobile responsiveness</li>
            <li>Advanced search functionality</li>
          </ul>
          
          <h3>New Content Features</h3>
          <ul>
            <li>Rich text editor improvements</li>
            <li>Media library management</li>
            <li>Content scheduling</li>
          </ul>
          
          <p>Stay tuned for more updates!</p>
        `,
        status: PostStatus.DRAFT,
        tags: ['cms', 'features', 'updates'],
        image: 'https://images.unsplash.com/photo-1522075469751-3847e138b2f5?w=800',
        orderNo: 6,
        publishedAt: undefined,
        expiredAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      }
    ];

    // Assign posts to categories and placements in a round-robin fashion
    for (let i = 0; i < posts.length; i++) {
      const categoryIndex = i % createdCategories.length;
      const placementIndex = i % createdPlacements.length;
      const authorIndex = i % 3; // Rotate between admin, editor, and author
      
      let authorId;
      switch (authorIndex) {
        case 0:
          authorId = adminUser._id;
          break;
        case 1:
          authorId = editorUser._id;
          break;
        case 2:
          authorId = authorUser._id;
          break;
      }

      const postData = {
        ...posts[i],
        category: createdCategories[categoryIndex]?._id || createdCategories[0]._id,
        placement: createdPlacements[placementIndex]?._id || createdPlacements[0]._id,
      };

      try {
        const post = await postsService.create(postData, authorId);
        console.log(`✅ Post created: ${post.title} (Status: ${post.status})`);
      } catch (error) {
        console.log(`⚠️  Post already exists or error: ${posts[i].title}`, error.message);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: 3 (admin, editor, author)`);
    console.log(`📂 Categories: ${categories.length}`);
    console.log(`📍 Placements: ${placements.length}`);
    console.log(`📄 Posts: ${posts.length} (${posts.filter(p => p.status === PostStatus.PUBLISHED).length} published, ${posts.filter(p => p.status === PostStatus.DRAFT).length} draft)`);
    console.log('\n🔐 Default login credentials:');
    console.log('Admin: admin@bdjobs.com / admin123');
    console.log('Editor: editor@bdjobs.com / editor123');
    console.log('Author: author@bdjobs.com / author123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

// Run the seeder
bootstrap().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});