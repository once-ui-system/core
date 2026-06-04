import { baseURL, schema } from "@/resources";
import { agentDiscoveryPaths } from "@/agent/paths";

export const runtime = "nodejs";

/** Minimal OpenAPI 3 description for the public navigation API */
export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${schema.name} Docs Navigation API`,
      version: "1.0.0",
      description: "Returns the documentation site navigation tree as JSON.",
    },
    servers: [{ url: baseURL }],
    paths: {
      [agentDiscoveryPaths.navigationApi]: {
        get: {
          operationId: "getNavigation",
          summary: "Documentation navigation tree",
          responses: {
            "200": {
              description: "Navigation items",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/NavigationItem" },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        NavigationItem: {
          type: "object",
          properties: {
            slug: { type: "string" },
            title: { type: "string" },
            label: { type: "string" },
            children: {
              type: "array",
              items: { $ref: "#/components/schemas/NavigationItem" },
            },
          },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=86400",
    },
  });
}
