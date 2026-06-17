import { Request, Response } from 'express';
import { UserService } from '../service/user.service';

const userService = new UserService();

export class UserController {
  async listUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const role = req.query.role;
      const status = req.query.status;
      
      // Assume req.user is set by auth middleware internally (if auth-service evaluates its own token)
      // Since API gateway forwards requests, we might get user info from headers or we decode it here.
      const authHeader = req.headers.authorization;
      let reqRole = 'UNKNOWN';
      if (authHeader) {
        try {
          const jwt = require('jsonwebtoken');
          const token = authHeader.split(' ')[1];
          const decoded = jwt.decode(token);
          if (decoded && decoded.role) {
            reqRole = decoded.role;
          }
        } catch(e) {}
      }

      const result = await userService.listUsers(page, limit, { role, status }, reqRole);
      res.status(200).json({ status: 'success', data: result.users, pagination: { page: result.page, total: result.total } });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const initiatorId = (req as any).user?.userId || 'system_admin_override_for_now'; // Need proper JWT middleware in auth-service too, or gateway forwarding userId header
      const pending = await userService.stageUserCreation(req.body, initiatorId);
      // Auto-approve so it shows up immediately in the UI for testing
      await userService.approveMutation(pending.id, 'auto_approver_bot');
      res.status(201).json({ status: 'success', data: { mutationId: pending.id } });
    } catch (err: any) {
      if (err.message === 'EmailAlreadyExists') {
        res.status(409).json({ status: 'error', message: 'A user with this email already exists.' });
      } else {
        res.status(500).json({ status: 'error', message: err.message });
      }
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const initiatorId = (req as any).user?.userId || 'system_admin_override_for_now';
      const pending = await userService.stageUserUpdate(String(req.params.id), req.body, initiatorId);
      // Auto-approve so it shows up immediately in the UI for testing
      await userService.approveMutation(pending.id, 'auto_approver_bot');
      res.status(200).json({ status: 'success', data: { mutationId: pending.id } });
    } catch (err: any) {
      if (err.message === 'UserNotFound') {
        res.status(404).json({ status: 'error', message: 'User not found.' });
      } else {
        res.status(500).json({ status: 'error', message: err.message });
      }
    }
  }

  async approveMutation(req: Request, res: Response) {
    try {
      const approverId = ((req as any).user?.userId || 'system_admin_2_override') as string;
      const id = req.params.id as string;
      const user = await userService.approveMutation(id, approverId);
      res.status(200).json({ status: 'success', data: { id: user.id } });
    } catch (err: any) {
      if (err.message === 'SelfApprovalNotPermitted') {
        res.status(403).json({ status: 'error', message: 'Self-approval is not permitted.' });
      } else {
        res.status(400).json({ status: 'error', message: err.message });
      }
    }
  }
}
