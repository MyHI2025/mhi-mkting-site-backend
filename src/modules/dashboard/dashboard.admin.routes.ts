import { Router } from "express";
import { storage } from "../../storage";
import { asyncHandler } from "../common/errorHandlers";
import { authenticateToken } from "../common";

const router = Router();

// Get dashboard statistics
router.get("/stats", authenticateToken, asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get counts for all content types
  const [
    allPages,
    videos,
    contacts,
    teamMembers,
    mediaPositions,
    navigationItems
  ] = await Promise.all([
    storage.getAllPages(),
    storage.getAllVideos(),
    storage.getAllContacts(),
    storage.getAllTeamMembers(),
    storage.getAllMediaPositions(),
    storage.getAllNavigationItems()
  ]);

  // Filter pages by type
  const marketingPages = allPages.filter(p => p.pageType === 'marketing');
  const articles = allPages.filter(p => p.pageType === 'blog');
  const jobs = allPages.filter(p => p.pageType === 'job');

  // Debug: log pageTypes
  console.log('📊 Dashboard Stats Debug:');
  console.log(`   Total pages: ${allPages.length}`);
  console.log(`   Page types: ${allPages.map(p => p.pageType).join(', ')}`);
  console.log(`   Marketing: ${marketingPages.length}, Articles: ${articles.length}, Jobs: ${jobs.length}`);

  const stats = {
    pages: marketingPages.length,
    articles: articles.length,
    videos: videos.length,
    jobs: jobs.length,
    contacts: contacts.length,
    teamMembers: teamMembers.length,
    mediaPositions: mediaPositions.length,
    navigationItems: navigationItems.length,
    totalContent: marketingPages.length + articles.length + videos.length + jobs.length
  };

  res.json(stats);
}));

export default router;