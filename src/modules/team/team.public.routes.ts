import { Router } from 'express';
import { teamService } from './team.service';
import { asyncHandler } from '../common/errorHandlers';

const router = Router();

router.get("/public/team", asyncHandler(async (req, res) => {
  const members = await teamService.getVisibleTeamMembers();
  res.json(members);
}));

export default router;
