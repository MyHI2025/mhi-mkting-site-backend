import { storage } from "./storage"; 

/**
 * Initialize default roles and permissions
 */
export async function initializeRoles() {
  try {
    console.log("🔑 Initializing roles and permissions...");
    
    // Check if admin role already exists
const existingAdminRole = await storage.getRoleByName("Admin");
    if (existingAdminRole) {
      console.log("✅ Admin role already exists");
      
      // Check if admin user has the role
      const adminUser = await storage.getUserByUsername("admin");
      if (adminUser) {
        const userRoles = await storage.getAUserRole(adminUser.id);
        if (!userRoles.find(r => r.name === "Admin")) {
          console.log("   ⚠️  Admin user doesn't have Admin role, assigning now...");
          await storage.assignUserRole(adminUser.id, existingAdminRole.id);
          console.log("   ✅ Admin role assigned to admin user");
        }
      }
      return;
    }

    // Define all permissions
    const allPermissions = [
      { resource: "users", actions: ["create", "read", "update", "delete"] },
      { resource: "roles", actions: ["create", "read", "update", "delete"] },
      { resource: "pages", actions: ["create", "read", "update", "delete", "publish"] },
      { resource: "content", actions: ["create", "read", "update", "delete"] },
      { resource: "media", actions: ["create", "read", "update", "delete"] },
      { resource: "team", actions: ["create", "read", "update", "delete"] },
      { resource: "navigation", actions: ["create", "read", "update", "delete"] },
      { resource: "themes", actions: ["create", "read", "update", "delete"] },
      { resource: "videos", actions: ["create", "read", "update", "delete"] },
    ];

    // Create admin role with all permissions
    const adminRole = await storage.createRole({
      name: "Admin",
      description: "Full system access with all permissions",
      permissions: allPermissions,
    });
    console.log("   ✓ Created Admin role with full permissions");

    // Assign admin role to admin user
    const adminUser = await storage.getUserByUsername("admin");
    if (adminUser) {
      await storage.assignUserRole(adminUser.id, adminRole.id);
      console.log("   ✓ Assigned Admin role to admin user");
    }

    // Create editor role with limited permissions
    await storage.createRole({
      name: "Editor",
      description: "Can manage content but not users or settings",
      permissions: [
        { resource: "pages", actions: ["create", "read", "update", "delete", "publish"] },
        { resource: "content", actions: ["create", "read", "update", "delete"] },
        { resource: "media", actions: ["create", "read", "update", "delete"] },
      ],
    });
    console.log("   ✓ Created Editor role");

    // Create viewer role with read-only permissions
    await storage.createRole({
      name: "Viewer",
      description: "Read-only access to content",
      permissions: [
        { resource: "pages", actions: ["read"] },
        { resource: "content", actions: ["read"] },
        { resource: "media", actions: ["read"] },
      ],
    });
    console.log("   ✓ Created Viewer role");

    console.log("✅ Roles and permissions initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize roles:", error);
    throw error;
  }
}
