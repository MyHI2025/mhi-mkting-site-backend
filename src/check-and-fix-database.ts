/**
 * VS CODE DATABASE CHECKER AND FIXER (Note that it is not linked to anything, it's just here for troubleshooting)
 * 
 * This script will:
 * 1. Check if your PostgreSQL database has data
 * 2. Show you exactly what's missing
 * 3. Fix it by adding all the required content
 * 
 * HOW TO USE:
 * 1. Save this file to: mhi-mkting-site-backend/check-and-fix-database.ts
 * 2. Open Terminal in VS Code
 * 3. Run: npx tsx check-and-fix-database.ts
 */

import { db } from './db';
import { 
  pages, 
  navigationItems, 
  mediaPositions, 
  teamMembers,
  videoContent,
  contacts
} from '@myhi2025/shared';
import { sql } from 'drizzle-orm';

async function checkAndFixDatabase() {
  console.log('\n🔍 CHECKING YOUR POSTGRESQL DATABASE...\n');
  
  try {
    // Check what's currently in the database
    const [pagesResult] = await db.select({ count: sql<number>`count(*)` }).from(pages);
    const [navResult] = await db.select({ count: sql<number>`count(*)` }).from(navigationItems);
    const [mediaResult] = await db.select({ count: sql<number>`count(*)` }).from(mediaPositions);
    const [teamResult] = await db.select({ count: sql<number>`count(*)` }).from(teamMembers);
    const [videosResult] = await db.select({ count: sql<number>`count(*)` }).from(videoContent);
    const [contactsResult] = await db.select({ count: sql<number>`count(*)` }).from(contacts);
    
    const pagesCount = Number(pagesResult.count);
    const navCount = Number(navResult.count);
    const mediaCount = Number(mediaResult.count);
    const teamCount = Number(teamResult.count);
    const videosCount = Number(videosResult.count);
    const contactsCount = Number(contactsResult.count);
    
    console.log('📊 CURRENT DATABASE CONTENTS:');
    console.log(`   Pages: ${pagesCount}`);
    console.log(`   Navigation Items: ${navCount}`);
    console.log(`   Media Positions: ${mediaCount}`);
    console.log(`   Team Members: ${teamCount}`);
    console.log(`   Videos: ${videosCount}`);
    console.log(`   Contacts: ${contactsCount}\n`);
    
    // Determine what needs to be fixed
    const needsPages = pagesCount === 0;
    const needsNav = navCount === 0;
    const needsMedia = mediaCount === 0;
    
    if (!needsPages && !needsNav && !needsMedia) {
      console.log('✅ YOUR DATABASE ALREADY HAS DATA!');
      console.log('✅ The problem might be elsewhere. Check if your backend is using the correct database connection.\n');
      process.exit(0);
    }
    
    console.log('❌ YOUR DATABASE IS MISSING DATA!');
    console.log('\nWould you like to seed the database now? (This will add all the required content)');
    console.log('\nTo seed the database, run the init-admin.ts script:');
    console.log('   npx tsx init-admin.ts\n');
    
  } catch (error) {
    console.error('❌ ERROR CHECKING DATABASE:');
    console.error(error);
    console.log('\n💡 POSSIBLE ISSUES:');
    console.log('   1. Backend is not running');
    console.log('   2. Database connection is not configured');
    console.log('   3. Database tables do not exist yet');
    console.log('\n🔧 TRY THIS:');
    console.log('   Run: npm run db:push\n');
  }
}

checkAndFixDatabase();
