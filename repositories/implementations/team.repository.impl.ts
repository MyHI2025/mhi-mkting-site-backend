import { ITeamRepository } from "../team.repository";
import { NotFoundError } from "../base.repository";
import type { TeamMember, InsertTeamMember } from "@myhi2025/shared";
import { teamMembers } from "@myhi2025/shared";
import { db } from "../../db";
import { eq, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export class TeamRepositoryImpl implements ITeamRepository {
  async findTeamMemberById(id: string): Promise<TeamMember | null> {
    const result = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .orderBy(asc(teamMembers.displayOrder));
  }

  async getVisibleTeamMembers(): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.isVisible, true))
      .orderBy(asc(teamMembers.displayOrder));
  }

  async createTeamMember(data: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const now = new Date();

    const [member] = await db
      .insert(teamMembers)
      .values({
        id,
        title: data.title ?? null,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        bio: data.bio ?? null,
        photoUrl: data.photoUrl ?? null,
        photoAlt: data.photoAlt ?? null,
        linkedin: data.linkedin ?? null,
        achievements: data.achievements || [],
        displayOrder: data.displayOrder ?? 0,
        isVisible: data.isVisible ?? true,
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        updatedBy: null,
      })
      .returning();

    return member;
  }

  async updateTeamMember(
    id: string,
    data: Partial<TeamMember>
  ): Promise<TeamMember> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, id))
      .returning();

    if (!updatedMember) {
      throw new NotFoundError("TeamMember", id);
    }

    return updatedMember;
  }

  async deleteTeamMember(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const result = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError("TeamMember", id);
    }

    return { success: true, message: "Team member deleted successfully" };
  }
}

export const teamRepository = new TeamRepositoryImpl();
