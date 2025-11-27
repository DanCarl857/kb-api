export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Knowledge Base API",
    version: "1.0.0",
    description: "API for managing tenants, topics, knowledge articles, and aliases",
  },
  servers: [{ url: "http://localhost:3000/api/v1" }],
  components: {
    schemas: {
      Tenant: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Tenant A" },
          primaryLocale: { type: "string", example: "en-US" },
        },
        required: ["name", "primaryLocale"],
      },

      Topic: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Billing" },
        },
        required: ["name"],
      },

      // NEW — full Alias schema
      Alias: {
        type: "object",
        properties: {
          id: { type: "integer", example: 5 },
          text: { type: "string", example: "password recovery" },
          articleId: { type: "integer", example: 3 }
        },
        required: ["text", "articleId"]
      },

      ArticleAlias: {
        type: "object",
        properties: {
          text: { type: "string", example: "Password reset guide" }
        }
      },

      Article: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "How to reset your password" },
          body: { type: "string", example: "Step by step instructions..." },
          publishedYear: { type: "integer", example: 2025 },
          tenant: { $ref: "#/components/schemas/Tenant" },
          aliases: {
            type: "array",
            items: { $ref: "#/components/schemas/Alias" }
          },
          topics: {
            type: "array",
            items: { $ref: "#/components/schemas/Topic" }
          },
        },
        required: ["title", "body", "publishedYear", "tenant"],
      },
    },
  },

  paths: {
    // -------------------------------
    // TENANTS
    // -------------------------------
    "/tenants": {
      post: {
        tags: ["Tenants"],
        summary: "Create a tenant",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Tenant" } }
          }
        },
        responses: { 200: { description: "Tenant created" } },
      },
      get: {
        tags: ["Tenants"],
        summary: "List all tenants",
        responses: {
          200: {
            description: "Tenant list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Tenant" } }
              }
            }
          }
        }
      }
    },

    "/tenants/{id}": {
      get: {
        tags: ["Tenants"],
        summary: "Get tenant by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Tenant found" }, 404: { description: "Tenant not found" } }
      },
      put: {
        tags: ["Tenants"],
        summary: "Update tenant",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Tenant" } } }
        },
        responses: { 200: { description: "Tenant updated" }, 404: { description: "Tenant not found" } }
      },
      delete: {
        tags: ["Tenants"],
        summary: "Delete tenant",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Tenant deleted" }, 404: { description: "Tenant not found" } }
      },
    },

    // -------------------------------
    // TOPICS
    // -------------------------------
    "/topics": {
      post: {
        tags: ["Topics"],
        summary: "Create a topic",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Topic" } }
          }
        },
        responses: { 200: { description: "Topic created" } },
      },
      get: {
        tags: ["Topics"],
        summary: "List all topics",
        responses: {
          200: {
            description: "Topic list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Topic" } }
              }
            }
          }
        }
      }
    },

    "/topics/{id}": {
      get: {
        tags: ["Topics"],
        summary: "Get topic by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Topic found" }, 404: { description: "Topic not found" } }
      },
      put: {
        tags: ["Topics"],
        summary: "Update topic",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Topic" } } }
        },
        responses: { 200: { description: "Topic updated" }, 404: { description: "Topic not found" } }
      },
      delete: {
        tags: ["Topics"],
        summary: "Delete topic",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Topic deleted" }, 404: { description: "Topic not found" } }
      },
    },

    // -------------------------------
    // ARTICLES
    // -------------------------------
    "/articles": {
      post: {
        tags: ["Articles"],
        summary: "Create an article",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Article" } }
          }
        },
        responses: { 200: { description: "Article created" } },
      },
      get: {
        tags: ["Articles"],
        summary: "List all articles",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Filter by title or alias" },
          { name: "tenantId", in: "query", schema: { type: "integer" }, description: "Filter by tenant ID" },
          { name: "year", in: "query", schema: { type: "integer" }, description: "Filter by published year" },
        ],
        responses: {
          200: {
            description: "Articles list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Article" } }
              }
            }
          }
        }
      },
    },

    "/articles/{id}": {
      get: {
        tags: ["Articles"],
        summary: "Get article by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Article found" }, 404: { description: "Article not found" } }
      },
      put: {
        tags: ["Articles"],
        summary: "Update article",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Article" } } }
        },
        responses: { 200: { description: "Article updated" }, 404: { description: "Article not found" } }
      },
      delete: {
        tags: ["Articles"],
        summary: "Delete article",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Article deleted" }, 404: { description: "Article not found" } }
      },
    },

    // -------------------------------
    // ALIASES
    // -------------------------------
    "/aliases": {
      get: {
        tags: ["Aliases"],
        summary: "List all aliases",
        responses: {
          200: {
            description: "Alias list",
            content: {
              "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Alias" } } }
            }
          }
        }
      },
      post: {
        tags: ["Aliases"],
        summary: "Create an alias",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Alias" } }
          }
        },
        responses: { 200: { description: "Alias created" } }
      }
    },

    "/aliases/{id}": {
      get: {
        tags: ["Aliases"],
        summary: "Get alias by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Alias found" }, 404: { description: "Alias not found" } }
      },
      put: {
        tags: ["Aliases"],
        summary: "Update alias",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Alias" } }
          }
        },
        responses: { 200: { description: "Alias updated" }, 404: { description: "Alias not found" } }
      },
      delete: {
        tags: ["Aliases"],
        summary: "Delete alias",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { 200: { description: "Alias deleted" }, 404: { description: "Alias not found" } }
      },
    },
  },
};
