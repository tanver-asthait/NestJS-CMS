const fs = require('fs');
const path = require('path');

// API Documentation Generator
const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'BDJobs CMS API',
    version: '1.0.0',
    description: 'Complete API documentation for BDJobs CMS system',
    contact: {
      name: 'BDJobs Development Team',
      email: 'dev@bdjobs.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'objectId' },
          name: { type: 'string', example: 'Technology' },
          description: { type: 'string', example: 'Technology related posts' },
          slug: { type: 'string', example: 'technology' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Placement: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'objectId' },
          name: { type: 'string', example: 'Header Banner' },
          description: { type: 'string', example: 'Main header banner placement' },
          slug: { type: 'string', example: 'header-banner' },
          subCategory: { type: 'string', example: 'header' },
          sortOrder: { type: 'number', example: 1 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'objectId' },
          title: { type: 'string', example: 'My New Post' },
          slug: { type: 'string', example: 'my-new-post' },
          excerpt: { type: 'string', example: 'This is a short excerpt' },
          content: { type: 'string', example: 'Full post content here...' },
          status: { 
            type: 'string', 
            enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
            example: 'PUBLISHED'
          },
          category: { type: 'string', format: 'objectId' },
          placement: { type: 'string', format: 'objectId' },
          author: { type: 'string', format: 'objectId' },
          tags: { 
            type: 'array', 
            items: { type: 'string' },
            example: ['technology', 'news']
          },
          image: { type: 'string', format: 'uri', example: 'https://example.com/image.jpg' },
          views: { type: 'number', example: 0 },
          metaTitle: { type: 'string', example: 'SEO Title' },
          metaDescription: { type: 'string', example: 'SEO Description' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'objectId' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { 
            type: 'string',
            enum: ['ADMIN', 'EDITOR', 'VIEWER'],
            example: 'ADMIN'
          },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'API is running'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['ADMIN', 'EDITOR', 'VIEWER'], example: 'ADMIN' }
                },
                required: ['firstName', 'lastName', 'email', 'password']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully'
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    access_token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/categories': {
      get: {
        summary: 'Get all categories',
        responses: {
          '200': {
            description: 'List of categories',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Category' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new category',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Technology' },
                  description: { type: 'string', example: 'Technology related posts' },
                  slug: { type: 'string', example: 'technology' }
                },
                required: ['name']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Category created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Category' }
              }
            }
          }
        }
      }
    }
    // Add more endpoints here...
  }
};

// Generate OpenAPI JSON file
const outputPath = path.join(__dirname, 'api-documentation.json');
fs.writeFileSync(outputPath, JSON.stringify(apiDocs, null, 2));

console.log('✅ OpenAPI documentation generated at:', outputPath);
console.log('🌐 You can use this with online Swagger editors or Postman import');

// Generate Postman collection from OpenAPI
const postmanCollection = {
  info: {
    name: apiDocs.info.title,
    description: apiDocs.info.description,
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  auth: {
    type: 'bearer',
    bearer: [{ key: 'token', value: '{{access_token}}', type: 'string' }]
  },
  variable: [
    { key: 'base_url', value: 'http://localhost:3000', type: 'string' },
    { key: 'access_token', value: '', type: 'string' }
  ],
  item: []
};

// Convert OpenAPI paths to Postman requests
Object.entries(apiDocs.paths).forEach(([path, methods]) => {
  Object.entries(methods).forEach(([method, spec]) => {
    const request = {
      name: spec.summary,
      request: {
        method: method.toUpperCase(),
        url: {
          raw: `{{base_url}}${path}`,
          host: ['{{base_url}}'],
          path: path.split('/').filter(Boolean)
        },
        header: []
      }
    };

    if (spec.requestBody) {
      request.request.header.push({
        key: 'Content-Type',
        value: 'application/json'
      });
      
      const schema = spec.requestBody.content['application/json'].schema;
      if (schema.properties) {
        const example = {};
        Object.entries(schema.properties).forEach(([key, prop]) => {
          example[key] = prop.example || `${key}_value`;
        });
        request.request.body = {
          mode: 'raw',
          raw: JSON.stringify(example, null, 2)
        };
      }
    }

    if (spec.security) {
      request.request.auth = {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{access_token}}', type: 'string' }]
      };
    }

    postmanCollection.item.push(request);
  });
});

const postmanPath = path.join(__dirname, 'api-postman-generated.json');
fs.writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));

console.log('📮 Postman collection generated at:', postmanPath);

module.exports = { apiDocs, postmanCollection };