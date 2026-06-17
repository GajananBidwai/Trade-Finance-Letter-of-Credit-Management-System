import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification.model';
import { NotificationPreferenceModel } from '../models/NotificationPreference.model';

export class NotificationController {
  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string || 'system_user';
      let prefs = await NotificationPreferenceModel.findOne({ userId });
      
      if (!prefs) {
        prefs = new NotificationPreferenceModel({ userId });
        await prefs.save();
      }
      
      res.status(200).json({ status: 'success', data: prefs });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string || 'system_user';
      const { channels, events } = req.body;

      const prefs = await NotificationPreferenceModel.findOneAndUpdate(
        { userId },
        { channels, events },
        { new: true, upsert: true }
      );

      res.status(200).json({ status: 'success', data: prefs });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string || 'system_user';
      const notifications = await NotificationModel.find({ recipientId: userId }).sort({ createdAt: -1 });
      
      res.status(200).json({ status: 'success', data: notifications });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = req.headers['x-user-id'] as string || 'system_user';
      
      const notification = await NotificationModel.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ status: 'error', message: 'Notification not found' });
      }

      res.status(200).json({ status: 'success', data: notification });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async sendNotification(req: Request, res: Response) {
    try {
      const { recipientId, eventType, message, channel } = req.body;
      
      if (!recipientId || !eventType || !message || !channel) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
      }

      const notification = await NotificationController.dispatchInternal(recipientId, eventType, message, channel);
      res.status(200).json({ status: 'success', data: notification });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  static async dispatchInternal(recipientId: string, eventType: string, message: string, channel: string) {
    const prefs = await NotificationPreferenceModel.findOne({ userId: recipientId });
    
    let finalChannel = channel;
    let status = 'SENT';
    
    if (prefs && prefs.channels) {
      const allowed = (prefs.channels as any)[channel];
      if (allowed === false) {
        if (channel === 'IN_APP') {
          status = 'FAILED';
        } else {
          finalChannel = 'IN_APP';
          console.log(`[Notification] Channel ${channel} disabled for user, falling back to IN_APP`);
        }
      }
    }

    const notification = new NotificationModel({
      recipientId,
      eventType,
      message,
      channel: finalChannel,
      status
    });

    await notification.save();
    console.log(`[Audit] NOTIFICATION_DISPATCHED to=${recipientId} channel=${finalChannel} event=${eventType}`);
    return notification;
  }
}
