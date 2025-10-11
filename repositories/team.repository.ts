import type { TeamMember, InsertTeamMember } from "@myhealthintegral/shared";

/**
 * Team Repository Interface
 * Handles all team member-related data operations
 */
export interface ITeamRepository {
  findTeamMemberById(id: string): Promise<TeamMember | null>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  getVisibleTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(data: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<{ success: boolean; message: string }>;
}
