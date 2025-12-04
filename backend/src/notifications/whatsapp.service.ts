import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendOrderNotification(phoneNumber: string, message: string) {
    // --- SIMULATED SEND ---
    // In a real implementation, this would call the WhatsApp Business API.
    // For now, we just log it to the console.

    this.logger.log(`--- Sending WhatsApp Notification ---`);
    this.logger.log(`Recipient: ${phoneNumber}`);
    this.logger.log(`Message: ${message}`);
    this.logger.log(`-----------------------------------`);

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, messageId: `simulated_${Date.now()}` };
  }
}
