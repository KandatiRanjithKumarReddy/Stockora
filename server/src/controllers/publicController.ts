import { Request, Response } from 'express';
import { z } from 'zod';
import { Contact } from '../models/Contact.js';
import { Feedback } from '../models/Feedback.js';

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100, 'Name is too long'),
  email: z.string().trim().email('Valid email address is required').max(150, 'Email is too long'),
  phone: z.string().trim().max(20, 'Phone number is too long').optional(),
  subject: z.string().trim().min(3, 'Subject is required').max(160, 'Subject is too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
});

const feedbackSchema = z.object({
  category: z.enum(['GENERAL', 'BUG', 'ORDER_ISSUE', 'AI_ACCURACY', 'FEATURE_REQUEST']),
  message: z.string().trim().min(5, 'Feedback message must be at least 5 characters').max(2000, 'Feedback message is too long'),
  pageUrl: z.string().trim().max(300).optional(),
  browserInfo: z.string().trim().max(300).optional(),
  userId: z.string().trim().max(64).optional(),
  role: z.string().trim().max(32).optional(),
});

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const contact = await Contact.create(result.data);

  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! The Stockora distributor team in Jabalpur will contact you shortly.',
    contactId: contact._id,
  });
};

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  const result = feedbackSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const feedback = await Feedback.create(result.data);

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback! Your insights help us make Stockora better.',
    feedbackId: feedback._id,
  });
};

