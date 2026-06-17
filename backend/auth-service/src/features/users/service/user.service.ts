import { UserModel, UserRole, UserStatus } from '../../auth/model/User.model';
import { PendingMutationModel, MutationStatus } from '../../auth/model/PendingMutation.model';
import { RolePermissionModel } from '../../auth/model/RolePermission.model';
import { createClient } from 'redis';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.connect().catch(console.error);

export class UserService {
  
  // List Users (with basic pagination and optional PII masking)
  async listUsers(page: number, limit: number, queryParams: any, reqRole: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (queryParams.role) query.role = queryParams.role;
    if (queryParams.status) query.status = queryParams.status;

    const [users, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(limit).select('-passwordHash').lean(),
      UserModel.countDocuments(query)
    ]);

    // PII Masking: If not ADMIN, mask email and name
    if (reqRole !== UserRole.ADMIN) {
      users.forEach(user => {
        if (user.email) user.email = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
        if (user.name) user.name = user.name.replace(/(.{1})(.*)/, '$1***');
      });
    }

    return { users, total, page };
  }

  // Create User (Staged as Pending)
  async stageUserCreation(payload: any, initiatedBy: string) {
    // Check if email exists
    const existing = await UserModel.findOne({ email: payload.email });
    if (existing) {
      throw new Error('EmailAlreadyExists');
    }

    const pending = new PendingMutationModel({
      initiatedBy,
      proposedChanges: payload,
      status: MutationStatus.PENDING
    });

    await pending.save();
    return pending;
  }

  // Update User (Staged as Pending)
  async stageUserUpdate(targetUserId: string, payload: any, initiatedBy: string) {
    const user = await UserModel.findById(targetUserId);
    if (!user) throw new Error('UserNotFound');

    const pending = new PendingMutationModel({
      targetUserId,
      initiatedBy,
      proposedChanges: payload,
      status: MutationStatus.PENDING
    });

    await pending.save();
    return pending;
  }

  // Approve Pending Mutation
  async approveMutation(mutationId: string, approvedBy: string) {
    const mutation = await PendingMutationModel.findById(mutationId);
    if (!mutation) throw new Error('MutationNotFound');
    if (mutation.status !== MutationStatus.PENDING) throw new Error('MutationNotPending');
    if (mutation.initiatedBy === approvedBy) throw new Error('SelfApprovalNotPermitted');

    // Process Mutation
    let targetUser;
    if (mutation.targetUserId) {
      // It's an update
      targetUser = await UserModel.findById(mutation.targetUserId);
      if (!targetUser) throw new Error('UserNotFound');
      
      const changes = mutation.proposedChanges;
      if (changes.role) targetUser.role = changes.role;
      if (changes.status) targetUser.status = changes.status;
      if (changes.permissions) targetUser.permissions = changes.permissions;
      
      targetUser.approvedBy = approvedBy;
      await targetUser.save();
    } else {
      // It's a create
      const changes = mutation.proposedChanges;
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
      targetUser = new UserModel({
        name: changes.name,
        email: changes.email,
        role: changes.role,
        permissions: changes.permissions || [],
        passwordHash,
        createdBy: mutation.initiatedBy,
        approvedBy
      });
      await targetUser.save();
      // In real life, send tempPassword to user via email/secure channel
    }

    mutation.status = MutationStatus.APPROVED;
    mutation.approvedBy = approvedBy;
    await mutation.save();

    // Invalidate / Push Role Matrix to Redis if role changes occurred
    await this.pushRoleMatrixToRedis(targetUser.role);

    return targetUser;
  }

  // Push Role Matrix to Redis (Max 30s TTL per spec, but we can just update it immediately)
  async pushRoleMatrixToRedis(role: string) {
    try {
      const rolePerm = await RolePermissionModel.findOne({ role: role as UserRole });
      if (rolePerm) {
        await redisClient.setEx(`role_permissions:${role}`, 30, JSON.stringify(rolePerm.allowedEndpoints));
      }
    } catch (e) {
      console.error('Failed to push to Redis', e);
    }
  }

}
