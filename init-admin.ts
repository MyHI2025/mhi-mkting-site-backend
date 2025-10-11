import { hashPassword } from "./auth";
import { initializeRoles } from "./init-roles";
import {
  usersRepository,
  contentRepository,
  mediaRepository,
  navigationRepository,
  teamRepository,
  systemRepository
} from "./repositories/implementations";

// Initialize default admin user and system data
export async function initializeAdmin() {
  try {
    console.log("🔧 Initializing admin system...");

    // Check if any admin users exist
    const existingUsers = await usersRepository.getAllUsers();
    const isFirstRun = existingUsers.length === 0;
    
    let adminUserId: string;
    
    if (isFirstRun) {
      // Create default admin user from environment variable
      const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
      
      if (!defaultAdminPassword) {
        throw new Error("ADMIN_DEFAULT_PASSWORD environment variable is required for first-time setup");
      }

      const hashedPassword = await hashPassword(defaultAdminPassword);

      const adminUser = await usersRepository.createUser({
        username: "admin",
        email: "admin@myhealthintegral.com",
        password: hashedPassword,
        firstName: "System",
        lastName: "Administrator",
      });

      adminUserId = adminUser.id;

      console.log("✅ Default admin user created:");
      console.log("   Username: admin");
      console.log("   Email: admin@myhealthintegral.com");
      console.log("   ⚠️  Password set from ADMIN_DEFAULT_PASSWORD environment variable");
      console.log("   ⚠️  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN");

      // Log the admin creation
      await systemRepository.createAuditLog({
        userId: adminUser.id,
        action: "create",
        resource: "users",
        resourceId: adminUser.id,
        details: { 
          message: "Default admin user created during system initialization",
          username: adminUser.username 
        },
        ipAddress: "127.0.0.1",
        userAgent: "System Initialization",
        createdAt: new Date(),
      });

      // Initialize default marketing pages
      await initializeDefaultPages(adminUserId);
      
      // Initialize navigation structure
      await initializeDefaultNavigation(adminUserId);
      
      // Initialize default team members
      await initializeDefaultTeamMembers(adminUserId);
      
      console.log("🎉 Admin system initialization complete!");
    } else {
      // Get the existing admin user ID
      const adminUser = existingUsers[0];
      adminUserId = adminUser.id;
    }
    
    // Always initialize roles and permissions (assigns role to admin user if needed)
    await initializeRoles();
    
    // Always check and initialize media positions (runs even if admin exists)
    await initializeDefaultMediaPositions(adminUserId);

  } catch (error) {
    console.error("❌ Failed to initialize admin system:", error);
    throw error;
  }
}

async function initializeDefaultPages(adminUserId: string) {
  try {
    console.log("📄 Initializing marketing pages...");
    
    // Check if pages already exist
    const existingPages = await contentRepository.getAllPages();
    if (existingPages.length > 0) {
      console.log("✅ Marketing pages already exist");
      return;
    }

    // Define all marketing pages
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
        slug: "physicians",
        title: "For Physicians - Enhanced Practice Management",
        description: "Empower your medical practice with advanced digital tools for patient management, diagnostics, and telemedicine.",
        metaTitle: "Physician Practice Management - My Health Integral",
        metaDescription: "Advanced digital tools for physicians. Practice management, telemedicine, patient records, and AI-powered diagnostics."
      },
      {
        slug: "hospitals",
        title: "For Hospitals - Comprehensive Digital Health Systems",
        description: "Transform your hospital operations with integrated digital health solutions for improved patient outcomes.",
        metaTitle: "Hospital Digital Health Systems - My Health Integral",
        metaDescription: "Comprehensive digital health systems for hospitals. Integrated solutions for improved patient outcomes and operational efficiency."
      },
      {
        slug: "laboratories",
        title: "For Laboratories - Advanced Diagnostic Solutions",
        description: "Streamline laboratory operations with digital workflow management and AI-powered diagnostic assistance.",
        metaTitle: "Laboratory Management Solutions - My Health Integral",
        metaDescription: "Advanced diagnostic solutions for laboratories. Digital workflow management and AI-powered diagnostic assistance."
      },
      {
        slug: "pharmacies",
        title: "For Pharmacies - Digital Prescription Management",
        description: "Modernize pharmacy operations with digital prescription processing and inventory management systems.",
        metaTitle: "Pharmacy Management Systems - My Health Integral",
        metaDescription: "Digital prescription management for pharmacies. Modern pharmacy operations with integrated inventory systems."
      },
      {
        slug: "emergency",
        title: "Emergency Services - Rapid Response Healthcare",
        description: "Critical care coordination and emergency response systems for immediate healthcare needs.",
        metaTitle: "Emergency Healthcare Services - My Health Integral",
        metaDescription: "Rapid response healthcare solutions. Critical care coordination and emergency response systems for immediate needs."
      },
      {
        slug: "insurance",
        title: "For Insurance Providers - Healthcare Coverage Solutions",
        description: "Integrated insurance solutions for seamless healthcare coverage and claims processing.",
        metaTitle: "Healthcare Insurance Solutions - My Health Integral",
        metaDescription: "Integrated insurance solutions for healthcare. Seamless coverage and claims processing with digital integration."
      },
      {
        slug: "corporates",
        title: "For Corporates - Employee Health & Wellness",
        description: "Comprehensive corporate health solutions to enhance employee wellness and productivity.",
        metaTitle: "Corporate Health Solutions - My Health Integral",
        metaDescription: "Comprehensive corporate health and wellness solutions. Enhance employee health and productivity with digital healthcare."
      },
      {
        slug: "investors",
        title: "For Investors - Healthcare Innovation Opportunities",
        description: "Investment opportunities in revolutionary healthcare technology and digital transformation initiatives.",
        metaTitle: "Healthcare Investment Opportunities - My Health Integral",
        metaDescription: "Investment opportunities in healthcare innovation. Revolutionary technology and digital transformation in healthcare."
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
      },
      {
        slug: "privacy-policy",
        title: "Privacy Policy",
        description: "Our commitment to protecting your health information and personal data privacy in accordance with healthcare regulations.",
        metaTitle: "Privacy Policy - My Health Integral",
        metaDescription: "Our privacy policy and commitment to protecting your health information. HIPAA compliance and data security."
      },
      {
        slug: "terms-of-use",
        title: "Terms of Use",
        description: "Terms and conditions for using My Health Integral's healthcare platform and digital services.",
        metaTitle: "Terms of Use - My Health Integral",
        metaDescription: "Terms and conditions for our healthcare platform. Digital services usage guidelines and user agreements."
      }
    ];

    // Create each page
    for (const pageData of pages) {
      const page = await contentRepository.createPage(pageData);
      
      // Update with creator info
      await contentRepository.updatePage(page.id, {
        createdBy: adminUserId,
        updatedBy: adminUserId,
        isPublished: true,
        publishedAt: new Date(),
      });
      
      console.log(`   ✓ Created page: ${pageData.title}`);
    }
    
    console.log(`✅ Created ${pages.length} marketing pages successfully!`);
    
  } catch (error) {
    console.error("❌ Failed to initialize pages:", error);
  }
}

async function initializeDefaultNavigation(adminUserId: string) {
  try {
    console.log("🔗 Initializing navigation structure...");
    
    // Check if navigation already exists
    const existingNavItems = await navigationRepository.getAllNavigationItems();
    if (existingNavItems.length > 0) {
      console.log("✅ Navigation structure already exists");
      return;
    }

    // Define the navigation structure matching the current website header
    const navItems = [
      // Main navigation items
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
        label: "For Business",
        href: "/corporates", 
        target: "_self",
        displayOrder: 4,
        parentId: null,
        isVisible: true
      },
      {
        label: "About",
        href: "/about",
        target: "_self",
        displayOrder: 5,
        parentId: null,
        isVisible: true
      },
      {
        label: "Content Hub",
        href: "/blog",
        target: "_self",
        displayOrder: 6,
        parentId: null,
        isVisible: true
      },
      {
        label: "Careers",
        href: "/career",
        target: "_self", 
        displayOrder: 7,
        parentId: null,
        isVisible: true
      },
      {
        label: "Contact", 
        href: "/contact",
        target: "_self",
        displayOrder: 8,
        parentId: null,
        isVisible: true
      },
      {
        label: "Investors",
        href: "/investors",
        target: "_self",
        displayOrder: 9,
        parentId: null,
        isVisible: true
      }
    ];

    // Create main navigation items first
    const createdItems: { [key: string]: any } = {};
    
    for (const navItem of navItems) {
      const item = await navigationRepository.createNavigationItem(navItem);
      createdItems[navItem.label] = item;
      console.log(`   ✓ Created nav item: ${navItem.label}`);
    }
    
    // Create dropdown items for "For Healthcare Providers"
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
      },
      {
        label: "Emergency Services",
        href: "/emergency",
        target: "_self",
        displayOrder: 5,
        parentId: providersParentId,
        isVisible: true
      },
      {
        label: "Insurance Providers",
        href: "/insurance",
        target: "_self",
        displayOrder: 6,
        parentId: providersParentId,
        isVisible: true
      }
    ];

    for (const dropdownItem of dropdownItems) {
      await navigationRepository.createNavigationItem(dropdownItem);
      console.log(`     ✓ Created dropdown item: ${dropdownItem.label}`);
    }

    console.log(`✅ Created ${navItems.length} navigation items with ${dropdownItems.length} dropdown items successfully!`);
    
  } catch (error) {
    console.error("❌ Failed to initialize navigation:", error);
  }
}

async function initializeDefaultTeamMembers(adminUserId: string) {
  try {
    console.log("👥 Initializing team members...");
    
    // Check if team members already exist
    const existingMembers = await teamRepository.getAllTeamMembers();
    if (existingMembers.length > 0) {
      console.log("✅ Team members already exist");
      return;
    }

    // Define default team members
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
      await teamRepository.createTeamMember(member);
      console.log(`   ✓ Created team member: ${member.name}`);
    }

    console.log(`✅ Created ${teamMembers.length} team members successfully!`);
    
  } catch (error) {
    console.error("❌ Failed to initialize team members:", error);
  }
}

async function initializeDefaultMediaPositions(adminUserId: string) {
  try {
    console.log("🖼️  Initializing media positions...");
    
    // Get existing media positions to check which ones are missing
    const existingPositions = await mediaRepository.getAllMediaPositions();
    const existingKeys = new Set(existingPositions.map(p => p.positionKey));

    // Define all media positions for the website
    const mediaPositions = [
      // Hero Images
      { positionKey: "hero_home", label: "Home Page Hero Image", description: "Main hero image on homepage", category: "hero", displayOrder: 0 },
      { positionKey: "hero_about", label: "About Page Hero Image", description: "Hero image for about page", category: "hero", displayOrder: 1 },
      { positionKey: "hero_patients", label: "Patients Page Hero", description: "Hero image for patients page", category: "hero", displayOrder: 2 },
      { positionKey: "hero_physicians", label: "Physicians Page Hero", description: "Hero image for physicians page", category: "hero", displayOrder: 3 },
      { positionKey: "hero_hospitals", label: "Hospitals Page Hero", description: "Hero image for hospitals page", category: "hero", displayOrder: 4 },
      { positionKey: "hero_contact", label: "Contact Page Hero Image", description: "Hero image for contact page", category: "hero", displayOrder: 5 },
      
      // Logos
      { positionKey: "logo_header", label: "Header Logo", description: "Main logo in website header", category: "logo", displayOrder: 0 },
      { positionKey: "logo_footer", label: "Footer Logo", description: "Logo in website footer", category: "logo", displayOrder: 1 },
      { positionKey: "logo_admin", label: "Admin Logo", description: "Logo in admin dashboard", category: "logo", displayOrder: 2 },
      
      // About Page Images
      { positionKey: "about_mission", label: "About - Mission Image", description: "Image for mission section on about page", category: "about", displayOrder: 0 },
      { positionKey: "about_vision", label: "About - Vision Image", description: "Image for vision section on about page", category: "about", displayOrder: 1 },
      { positionKey: "about_values", label: "About - Values Image", description: "Image for values section on about page", category: "about", displayOrder: 2 },
      
      // Service Page Images
      { positionKey: "service_telemedicine", label: "Telemedicine Feature Image", description: "Image for telemedicine service", category: "services", displayOrder: 0 },
      { positionKey: "service_records", label: "Health Records Feature Image", description: "Image for health records service", category: "services", displayOrder: 1 },
      { positionKey: "service_pharmacy", label: "Pharmacy Feature Image", description: "Image for pharmacy service", category: "services", displayOrder: 2 },
      { positionKey: "service_emergency", label: "Emergency Services Image", description: "Image for emergency services", category: "services", displayOrder: 3 },
      
      // Feature Icons/Images
      { positionKey: "feature_ai", label: "AI Features Icon", description: "Icon/image for AI-powered features", category: "features", displayOrder: 0 },
      { positionKey: "feature_secure", label: "Security Icon", description: "Icon/image for security features", category: "features", displayOrder: 1 },
      { positionKey: "feature_247", label: "24/7 Availability Icon", description: "Icon/image for 24/7 service", category: "features", displayOrder: 2 },
      
      // Background Images
      { positionKey: "bg_cta", label: "CTA Section Background", description: "Background image for call-to-action sections", category: "backgrounds", displayOrder: 0 },
      { positionKey: "bg_testimonials", label: "Testimonials Background", description: "Background for testimonials section", category: "backgrounds", displayOrder: 1 },
      
      // Social/Marketing
      { positionKey: "og_default", label: "Default OG Image", description: "Default Open Graph image for social sharing", category: "social", displayOrder: 0 },
      
      // Trust & Credibility Section
      { positionKey: "trust_section_bg", label: "Trust Section Background", description: "Background image for trust/credibility section", category: "trust", displayOrder: 0 },
      { positionKey: "trust_patients_photo", label: "Trust - Happy Patients Photo", description: "Image showing happy satisfied patients using the platform", category: "trust", displayOrder: 1 },
      { positionKey: "trust_team_photo", label: "Trust - Medical Team Photo", description: "Image showing professional medical team celebrating success", category: "trust", displayOrder: 2 },
      { positionKey: "trust_badge_hipaa", label: "HIPAA Compliance Badge", description: "HIPAA compliance certification badge", category: "trust", displayOrder: 3 },
      { positionKey: "trust_badge_iso", label: "ISO 27001 Badge", description: "ISO 27001 security certification badge", category: "trust", displayOrder: 4 },
      { positionKey: "trust_badge_gdpr", label: "GDPR Compliance Badge", description: "GDPR compliance certification badge", category: "trust", displayOrder: 5 },
      
      // How It Works Visual Journey
      { positionKey: "how_it_works_step_1", label: "How It Works - Step 1", description: "Image for step 1: Patient registration on phone", category: "how_it_works", displayOrder: 0 },
      { positionKey: "how_it_works_step_2", label: "How It Works - Step 2", description: "Image for step 2: Booking/scheduling appointment", category: "how_it_works", displayOrder: 1 },
      { positionKey: "how_it_works_step_3", label: "How It Works - Step 3", description: "Image for step 3: Video consultation", category: "how_it_works", displayOrder: 2 },
      { positionKey: "how_it_works_step_4", label: "How It Works - Step 4", description: "Image for step 4: Prescription & delivery", category: "how_it_works", displayOrder: 3 },
      
      // Testimonials with Faces
      { positionKey: "testimonial_patient", label: "Testimonial - Patient Photo", description: "Professional headshot for patient testimonial", category: "testimonials", displayOrder: 0 },
      { positionKey: "testimonial_provider", label: "Testimonial - Healthcare Provider Photo", description: "Professional headshot for healthcare provider testimonial", category: "testimonials", displayOrder: 1 },
      { positionKey: "testimonial_admin", label: "Testimonial - Hospital Admin Photo", description: "Professional headshot for hospital administrator testimonial", category: "testimonials", displayOrder: 2 },
      
      // Service Benefit Sections (for alternating image/text layouts)
      { positionKey: "benefit_telemedicine", label: "Telemedicine Benefit Image", description: "Image showing doctor-patient video consultation", category: "benefits", displayOrder: 0 },
      { positionKey: "benefit_health_records", label: "Health Records Benefit Image", description: "Image showing digital health records dashboard", category: "benefits", displayOrder: 1 },
      { positionKey: "benefit_emergency", label: "Emergency Services Benefit Image", description: "Image showing emergency medical response", category: "benefits", displayOrder: 2 },
      { positionKey: "benefit_pharmacy", label: "Pharmacy Benefit Image", description: "Image showing medication delivery to home", category: "benefits", displayOrder: 3 },
      { positionKey: "benefit_lab_diagnostics", label: "Laboratory Diagnostics Benefit Image", description: "Image showing laboratory technician conducting diagnostic tests", category: "benefits", displayOrder: 4 },
      { positionKey: "benefit_insurance", label: "Insurance Processing Benefit Image", description: "Image showing seamless insurance claims processing", category: "benefits", displayOrder: 5 },
      
      // Extended Hero Images for Service Provider Pages
      { positionKey: "hero_laboratories", label: "Medical Laboratories Hero", description: "Hero image for medical laboratories page", category: "hero", displayOrder: 6 },
      { positionKey: "hero_pharmacies", label: "Pharmacies Hero", description: "Hero image for pharmacies page", category: "hero", displayOrder: 7 },
      { positionKey: "hero_emergency", label: "Emergency Services Hero", description: "Hero image for emergency services page", category: "hero", displayOrder: 8 },
      { positionKey: "hero_insurance", label: "Insurance Providers Hero", description: "Hero image for insurance providers page", category: "hero", displayOrder: 9 },
      { positionKey: "hero_corporates", label: "Corporates Page Hero", description: "Hero image for corporates/business page", category: "hero", displayOrder: 10 },
      { positionKey: "hero_investors", label: "Investors Page Hero", description: "Hero image for investors page", category: "hero", displayOrder: 11 },
      { positionKey: "hero_contact", label: "Contact Page Hero", description: "Hero image for contact page", category: "hero", displayOrder: 12 },
      { positionKey: "hero_careers", label: "Careers Page Hero", description: "Hero image for careers page showing diverse team", category: "hero", displayOrder: 13 },
      { positionKey: "hero_blog", label: "Blog/Content Hub Hero", description: "Hero image for blog/content hub page", category: "hero", displayOrder: 14 },
    ];

    // Only create positions that don't already exist
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const position of mediaPositions) {
      if (existingKeys.has(position.positionKey)) {
        skippedCount++;
        continue;
      }
      
      await mediaRepository.createMediaPosition({
        ...position,
        isActive: true,
        mediaUrl: null,
        mediaAlt: null,
        mediaAssetId: null,
      });
      console.log(`   ✓ Created media position: ${position.label}`);
      createdCount++;
    }

    if (createdCount > 0) {
      console.log(`✅ Created ${createdCount} new media positions successfully!`);
    }
    if (skippedCount > 0) {
      console.log(`ℹ️  Skipped ${skippedCount} existing media positions`);
    }
    
  } catch (error) {
    console.error("❌ Failed to initialize media positions:", error);
  }
}