import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

router.get('/', notificationController.getNotifications.bind(notificationController));
router.put('/:notificationId/read', notificationController.markAsRead.bind(notificationController));
router.get('/preferences', notificationController.getPreferences.bind(notificationController));
router.put('/preferences', notificationController.updatePreferences.bind(notificationController));
router.post('/send', notificationController.sendNotification.bind(notificationController));

export default router;
