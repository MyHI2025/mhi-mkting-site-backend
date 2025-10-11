import { teamRepository } from '../../repositories/implementations';
import { logUserAction } from '../../auth';
import { Request } from 'express';
import type { InsertTeamMember } from '@myhealthintegral/shared';
import { notFound } from '../common/errorHandlers';

export class TeamService {
  async getAllTeamMembers() {
    return await teamRepository.getAllTeamMembers();
  }

  async getVisibleTeamMembers() {
    return await teamRepository.getVisibleTeamMembers();
  }

  async getTeamMember(id: string) {
    const member = await teamRepository.findTeamMemberById(id);
    if (!member) {
      throw notFound("Team member", id);
    }
    return member;
  }

  async createTeamMember(data: InsertTeamMember, currentUserId: string, req: Request) {
    const newMember = await teamRepository.createTeamMember(data);
    
    const memberName = `${newMember.title ? newMember.title + ' ' : ''}${newMember.firstName} ${newMember.lastName}`;
    await logUserAction(currentUserId, "create", "team", newMember.id, { 
      member_name: memberName,
      role: newMember.role
    }, req);
    
    return newMember;
  }

  async updateTeamMember(id: string, data: Partial<InsertTeamMember>, currentUserId: string, req: Request) {
    const updatedMember = await teamRepository.updateTeamMember(id, data);
    
    const memberName = `${updatedMember.title ? updatedMember.title + ' ' : ''}${updatedMember.firstName} ${updatedMember.lastName}`;
    await logUserAction(currentUserId, "update", "team", id, { 
      member_name: memberName
    }, req);
    
    return updatedMember;
  }

  async deleteTeamMember(id: string, currentUserId: string, req: Request) {
    const member = await teamRepository.findTeamMemberById(id);
    if (!member) {
      throw notFound("Team member", id);
    }
    
    await teamRepository.deleteTeamMember(id);
    
    const memberName = `${member.title ? member.title + ' ' : ''}${member.firstName} ${member.lastName}`;
    await logUserAction(currentUserId, "delete", "team", id, { 
      member_name: memberName
    }, req);
    
    return { message: "Team member deleted successfully" };
  }
}

export const teamService = new TeamService();
