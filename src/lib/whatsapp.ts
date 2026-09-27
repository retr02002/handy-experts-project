import { prisma } from "@/lib/prisma";
import { formatTicketNumber } from "@/lib/ticketNumber";
import { sendTextMessage } from "@/lib/apitxt";

export async function sendWhatsAppMessage(phone: string, message: string) {
  const res = await sendTextMessage({
    phone,
    channel: "WHATSAPP",
    message,
  });
  
  if (!res.ok) {
    console.error(`[WhatsApp to ${phone} Failed]:`, res.error);
  } else {
    console.log(`[WhatsApp to ${phone} Sent Successfully]`);
  }
}

export async function notifyOrderPlaced(phone: string, orderId: string, totalAmount: number) {
  const trackingUrl = `https://handyzo.com/customer/dashboard/orders/${orderId}`;
  const message = `Hello! Your order *${orderId}* has been successfully placed. \nTotal Amount: ₹${totalAmount}\n\nYou can track your order details here:\n${trackingUrl}\n\nThank you for choosing Handy Experts!`;
  
  await sendWhatsAppMessage(phone, message);
}

export async function notifyJobCompletedByLiveCallId(liveCallId: string) {
  try {
    const liveCall = await prisma.liveCall.findUnique({ where: { id: liveCallId } });
    if (!liveCall) return;
    
    const ticket = formatTicketNumber(liveCall);
    const message = `Hello! We're glad to inform you that your job for order *${ticket}* has been successfully completed. \n\nThank you for choosing Handy Experts! We'd love to hear your feedback.`;
    
    await sendWhatsAppMessage(liveCall.customerPhone, message);
  } catch(e) {
    console.error("Failed to send WhatsApp completion message:", e);
  }
}
