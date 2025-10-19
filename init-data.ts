import { storage } from "./storage";
import dotenv from "dotenv";
dotenv.config();

/**
 * One-time script to initialize default data
 * Run with: npx tsx init-data.ts
 */
async function initializeData() {
  try {
    console.log("🚀 Initializing default data...\n");

    // Get admin user ID
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      console.error("❌ Admin user not found. Please create admin user first.");
      process.exit(1);
    }

    const adminUserId = adminUser.id;
    console.log(`✅ Found admin user: ${adminUser.username}\n`);

    // Initialize pages
    await initializeDefaultPages(adminUserId);
    
    // Initialize navigation
    await initializeDefaultNavigation(adminUserId);
    
    // Initialize team members
    await initializeDefaultTeamMembers(adminUserId);
    
    // Initialize media positions
    await initializeDefaultMediaPositions(adminUserId);

    console.log("\n🎉 All default data initialized successfully!");
    console.log("   You can now refresh your admin panel to see the changes.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize data:", error);
    process.exit(1);
  }
}

async function initializeDefaultPages(adminUserId: string) {
  try {
    console.log("📄 Initializing marketing pages...");
    
    const existingPages = await storage.getAllPages();
    if (existingPages.length > 0) {
      console.log(`   ℹ️  Found ${existingPages.length} existing pages - skipping page creation`);
      return;
    }

    const pages = [
      {
        slug: "home",
        title: "My Health Integral - AI meets humanity to unify healthcare",
        description: "Your comprehensive digital healthcare platform connecting patients, providers, and partners through innovative AI-powered solutions.",
        metaTitle: "My Health Integral - Digital Healthcare Platform",
        metaDescription: "AI meets humanity to unify healthcare. Comprehensive digital platform for telemedicine, health records, diagnostics, and more."
      },
      {
        slug: "patients",
        title: "For Patients - Your Health, Simplified",
        description: "Access comprehensive healthcare services from the comfort of your home through our patient-focused platform.",
        metaTitle: "Patient Healthcare Services - My Health Integral",
        metaDescription: "Simplified healthcare access for patients. Telemedicine, health records, prescriptions, and AI-powered health insights."
      },
      {
        slug: "providers",
        title: "Healthcare Providers Overview",
        description: "Comprehensive solutions for all types of healthcare providers to streamline operations and enhance patient care.",
        metaTitle: "Healthcare Provider Solutions - My Health Integral",
        metaDescription: "Streamline healthcare operations with our comprehensive provider solutions. Enhanced patient care through digital transformation."
      },
      {
        slug: "about",
        title: "About My Health Integral",
        description: "Learn about our mission to revolutionize healthcare through AI-powered digital solutions and human-centered care.",
        metaTitle: "About My Health Integral - Our Mission",
        metaDescription: "Our mission to revolutionize healthcare through AI-powered solutions. Human-centered care meets cutting-edge technology."
      },
      {
        slug: "contact",
        title: "Contact Us - Get in Touch",
        description: "Connect with our team to learn more about our healthcare solutions and how we can serve your needs.",
        metaTitle: "Contact My Health Integral - Get in Touch",
        metaDescription: "Contact our healthcare technology team. Learn more about our solutions and how we can serve your healthcare needs."
      },
      {
        slug: "career",
        title: "Career Opportunities - Join Our Mission",
        description: "Join our team in revolutionizing healthcare technology and making a meaningful impact on global health outcomes.",
        metaTitle: "Healthcare Careers - My Health Integral",
        metaDescription: "Join our mission to revolutionize healthcare. Career opportunities in healthcare technology and digital transformation."
      },
      {
        slug: "blog",
        title: "Health & Technology Blog",
        description: "Stay updated with the latest insights on healthcare technology, AI innovations, and digital health trends.",
        metaTitle: "Healthcare Technology Blog - My Health Integral",
        metaDescription: "Latest insights on healthcare technology and AI innovations. Stay updated with digital health trends and industry news."
      }
    ];

    for (const pageData of pages) {
      const page = await storage.createPage(pageData);
      await storage.updatePage(page.id, {
        createdBy: adminUserId,
        updatedBy: adminUserId,
        isPublished: true,
        publishedAt: new Date(),
      });
      console.log(`   ✓ Created page: ${pageData.title}`);
    }
    
    console.log(`✅ Created ${pages.length} marketing pages\n`);
  } catch (error) {
    console.error("❌ Failed to initialize pages:", error);
  }
}

async function initializeDefaultNavigation(adminUserId: string) {
  try {
    console.log("🔗 Initializing navigation structure...");
    
    const existingNavItems = await storage.getAllNavigationItems();
    if (existingNavItems.length > 0) {
      console.log(`   ℹ️  Found ${existingNavItems.length} existing navigation items - skipping navigation creation`);
      return;
    }

    const navItems = [
      {
        label: "Home",
        href: "/",
        target: "_self",
        displayOrder: 1,
        parentId: null,
        isVisible: true
      },
      {
        label: "For Patients", 
        href: "/patients",
        target: "_self",
        displayOrder: 2,
        parentId: null,
        isVisible: true
      },
      {
        label: "For Healthcare Providers",
        href: "/providers",
        target: "_self", 
        displayOrder: 3,
        parentId: null,
        isVisible: true
      },
      {
        label: "About",
        href: "/about",
        target: "_self",
        displayOrder: 4,
        parentId: null,
        isVisible: true
      },
      {
        label: "Content Hub",
        href: "/blog",
        target: "_self",
        displayOrder: 5,
        parentId: null,
        isVisible: true
      },
      {
        label: "Careers",
        href: "/career",
        target: "_self", 
        displayOrder: 6,
        parentId: null,
        isVisible: true
      },
      {
        label: "Contact", 
        href: "/contact",
        target: "_self",
        displayOrder: 7,
        parentId: null,
        isVisible: true
      }
    ];

    const createdItems: { [key: string]: any } = {};
    
    for (const navItem of navItems) {
      const item = await storage.createNavigationItem(navItem);
      createdItems[navItem.label] = item;
      console.log(`   ✓ Created: ${navItem.label}`);
    }
    
    const providersParentId = createdItems["For Healthcare Providers"].id;
    const dropdownItems = [
      {
        label: "Private Physicians",
        href: "/physicians",
        target: "_self",
        displayOrder: 1,
        parentId: providersParentId,
        isVisible: true
      },
      {
        label: "Hospitals", 
        href: "/hospitals",
        target: "_self",
        displayOrder: 2,
        parentId: providersParentId,
        isVisible: true
      },
      {
        label: "Medical Labs",
        href: "/laboratories",
        target: "_self",
        displayOrder: 3,
        parentId: providersParentId,
        isVisible: true
      },
      {
        label: "Pharmacies",
        href: "/pharmacies", 
        target: "_self",
        displayOrder: 4,
        parentId: providersParentId,
        isVisible: true
      }
    ];

    for (const dropdownItem of dropdownItems) {
      await storage.createNavigationItem(dropdownItem);
      console.log(`     ✓ Created dropdown: ${dropdownItem.label}`);
    }

    console.log(`✅ Created ${navItems.length} navigation items with ${dropdownItems.length} dropdown items\n`);
  } catch (error) {
    console.error("❌ Failed to initialize navigation:", error);
  }
}

async function initializeDefaultTeamMembers(adminUserId: string) {
  try {
    console.log("👥 Initializing team members...");
    
    const existingMembers = await storage.getAllTeamMembers();
    if (existingMembers.length > 0) {
      console.log(`   ℹ️  Found ${existingMembers.length} existing team members - skipping team creation`);
      return;
    }

    const teamMembers = [
      {
        name: "David Izuogu",
        role: "Founder and CEO",
        bio: "Visionary leader driving digital healthcare transformation with expertise in healthcare innovation, technology integration, and global market expansion.",
        linkedin: "https://www.linkedin.com/in/david-chukwuma-izuogu",
        achievements: [
          "Healthcare Technology Innovation",
          "Digital Health Strategy",
          "Global Market Development",
          "Regulatory Compliance Leadership"
        ],
        displayOrder: 0,
        isVisible: true,
        photoUrl: null,
        photoAlt: null,
      },
      {
        name: "Anita Enwere",
        role: "Co-Founder and COO/CMD",
        bio: "Strategic operations leader with deep healthcare expertise, focusing on operational excellence, medical oversight, and healthcare delivery optimization.",
        linkedin: "https://www.linkedin.com/in/chisom-anita-enwere-9810b3264",
        achievements: [
          "Healthcare Operations Management",
          "Medical Practice Oversight",
          "Quality Assurance & Compliance",
          "Healthcare Service Delivery"
        ],
        displayOrder: 1,
        isVisible: true,
        photoUrl: null,
        photoAlt: null,
      }
    ];

    for (const member of teamMembers) {
      await storage.createTeamMember(member);
      console.log(`   ✓ Created: ${member.name}`);
    }

    console.log(`✅ Created ${teamMembers.length} team members\n`);
  } catch (error) {
    console.error("❌ Failed to initialize team members:", error);
  }
}

async function initializeDefaultMediaPositions(adminUserId: string) {
  try {
    console.log("🖼️  Initializing media positions...");
    
    const existingPositions = await storage.getAllMediaPositions();
    const existingKeys = new Set(existingPositions.map(p => p.positionKey));

    const mediaPositions = [
      { positionKey: "hero_home", label: "Home Page Hero Image", description: "Main hero image on homepage", category: "hero", displayOrder: 0 },
      { positionKey: "hero_about", label: "About Page Hero Image", description: "Hero image for about page", category: "hero", displayOrder: 1 },
      { positionKey: "logo_header", label: "Header Logo", description: "Main logo in website header", category: "logo", displayOrder: 0 },
      { positionKey: "logo_footer", label: "Footer Logo", description: "Logo in website footer", category: "logo", displayOrder: 1 },
    ];

    let createdCount = 0;
    for (const position of mediaPositions) {
      if (!existingKeys.has(position.positionKey)) {
        await storage.createMediaPosition(position);
        console.log(`   ✓ Created: ${position.label}`);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`✅ Created ${createdCount} new media positions\n`);
    } else {
      console.log(`   ℹ️  All media positions already exist\n`);
    }
  } catch (error) {
    console.error("❌ Failed to initialize media positions:", error);
  }
}

// Run the initialization
initializeData();