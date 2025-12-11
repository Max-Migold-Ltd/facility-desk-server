import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Facility Desk API Documentation",
            version: "1.0.0",
            description: "API documentation for Facility Desk - A comprehensive facility management system",
            contact: {
                name: "API Support"
            }
        },
        servers: [
            {
                url: "http://localhost:5500",
                description: "Development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT token"
                }
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false
                        },
                        error: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string"
                                },
                                code: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        tags: [
            { name: "Auth", description: "Authentication endpoints" },
            { name: "Users", description: "User management endpoints" },
            { name: "Roles", description: "Role management endpoints" },
            { name: "Permissions", description: "Permission management endpoints" },
            { name: "Complexes", description: "Complex/Site management endpoints" },
            { name: "Buildings", description: "Building management endpoints" },
            { name: "Floors", description: "Floor management endpoints" },
            { name: "Units", description: "Unit management endpoints" },
            { name: "Rooms", description: "Room management endpoints" },
            { name: "Assets", description: "Asset management endpoints" },
            { name: "Asset Categories", description: "Asset category management endpoints" }
        ]
    },
    apis: ["./src/modules/**/*.routes.ts"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;