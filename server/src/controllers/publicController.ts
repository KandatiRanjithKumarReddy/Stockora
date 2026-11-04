import { Request, Response } from 'express';
import { z } from 'zod';
import { Contact } from '../models/Contact.js';
import { Feedback } from '../models/Feedback.js';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const feedbackSchema = z.object({
  category: z.enum(['GENERAL', 'BUG', 'ORDER_ISSUE', 'AI_ACCURACY', 'FEATURE_REQUEST']),
  message: z.string().min(5, 'Feedback message must be at least 5 characters'),
  pageUrl: z.string().optional(),
  browserInfo: z.string().optional(),
  userId: z.string().optional(),
  role: z.string().optional(),
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

