import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Send,
  Mail,
  Check,
  Copy,
  AlertCircle,
  Github,
  Linkedin,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useContactMutation } from '../../hooks/usePortfolioData';
import { useToast } from '../../context/ToastContext';
import { ProfileDTO } from '../../types';

interface ContactSectionProps {
  profile: ProfileDTO;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successResponse, setSuccessResponse] = useState<string | null>(null);

  const contactMutation = useContactMutation();
  const { showError } = useToast();

  const handleCopyEmail = () => {
    if (profile?.email) {
      navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const validateAndSanitize = () => {
    const errors: Record<string, string> = {};

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanSubject = formData.subject.trim();
    const cleanMessage = formData.message.trim();

    // CRLF Injection Guard
    if (/[\r\n]/.test(cleanName)) {
      errors.name = 'Name cannot contain carriage return or newline characters.';
    }
    if (/[\r\n]/.test(cleanEmail)) {
      errors.email = 'Email cannot contain carriage return or newline characters.';
    }
    if (/[\r\n]/.test(cleanSubject)) {
      errors.subject = 'Subject cannot contain carriage return or newline characters.';
    }

    if (!cleanName || cleanName.length < 2) {
      errors.name = errors.name || 'What should I call you? (Please enter your name)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      errors.email = errors.email || 'Please provide a valid email so I can write back.';
    }

    if (!cleanSubject) {
      errors.subject = errors.subject || 'A quick subject helps me know what this is about.';
    }

    if (!cleanMessage || cleanMessage.length < 5) {
      errors.message = 'Please share a few details about what you have in mind.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      return {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessResponse(null);

    const sanitizedData = validateAndSanitize();
    if (!sanitizedData) return;

    try {
      const res = await contactMutation.mutateAsync(sanitizedData);
      setSuccessResponse(
        res?.message || 'Thanks for reaching out! Your message landed right in my inbox.'
      );
      setFormData({ name: '', email: '', subject: '', message: '' });
      setFieldErrors({});

      try {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Fallback if canvas-confetti fails
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Please try again or email me directly.';
      showError('Unable to send message', message);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-[#090909] relative transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mb-10">
          <span className="text-[10px] tracking-[0.2em] text-slate-500 dark:text-zinc-500 uppercase block mb-2 font-sans">
            Get in Touch
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-['Syne',sans-serif]">
            Let&apos;s build something great together
          </h2>
          <p className="mt-2 text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-light">
            Whether you have an open backend engineering role, a distributed systems challenge to untangle, or just want to chat about Spring Boot &amp; Java, I&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="md:col-span-7 bg-slate-50 dark:bg-[#0e0e0e] border border-slate-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs">
            {successResponse ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Syne',sans-serif] mb-1">
                  Message on its way!
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto mb-5 font-light leading-relaxed">
                  {successResponse}
                </p>
                <button
                  onClick={() => setSuccessResponse(null)}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs uppercase tracking-wider font-bold shadow-xs cursor-pointer"
                >
                  Send another note
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {contactMutation.isError && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-800/60 text-rose-700 dark:text-red-300 text-xs flex items-center gap-2 font-sans">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-red-400" />
                    <span>
                      {contactMutation.error?.message || 'Oops, something went wrong. Please try again or email me directly.'}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="contact-input-name"
                      className="block text-[11px] font-sans text-slate-700 dark:text-zinc-400 uppercase tracking-wider mb-1 font-medium"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="contact-input-name"
                      maxLength={100}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Alex Johnson"
                      className={`w-full bg-white dark:bg-[#121212] border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors font-sans ${
                        fieldErrors.name
                          ? 'border-rose-400 dark:border-red-500/70 focus:border-rose-500'
                          : 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[10px] font-sans text-rose-600 dark:text-red-400 mt-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-input-email"
                      className="block text-[11px] font-sans text-slate-700 dark:text-zinc-400 uppercase tracking-wider mb-1 font-medium"
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="contact-input-email"
                      maxLength={120}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className={`w-full bg-white dark:bg-[#121212] border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors font-sans ${
                        fieldErrors.email
                          ? 'border-rose-400 dark:border-red-500/70 focus:border-rose-500'
                          : 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[10px] font-sans text-rose-600 dark:text-red-400 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-input-subject"
                    className="block text-[11px] font-sans text-slate-700 dark:text-zinc-400 uppercase tracking-wider mb-1 font-medium"
                  >
                    What&apos;s on your mind? (Subject)
                  </label>
                  <input
                    type="text"
                    id="contact-input-subject"
                    maxLength={150}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Backend Role / Microservices Project"
                    className={`w-full bg-white dark:bg-[#121212] border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors font-sans ${
                      fieldErrors.subject
                        ? 'border-rose-400 dark:border-red-500/70 focus:border-rose-500'
                        : 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600'
                    }`}
                  />
                  {fieldErrors.subject && (
                    <p className="text-[10px] font-sans text-rose-600 dark:text-red-400 mt-1">{fieldErrors.subject}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-input-message"
                    className="block text-[11px] font-sans text-slate-700 dark:text-zinc-400 uppercase tracking-wider mb-1 font-medium"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-input-message"
                    rows={4}
                    maxLength={2000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me a bit about what you're working on or how I might help..."
                    className={`w-full bg-white dark:bg-[#121212] border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none transition-colors resize-none font-sans ${
                      fieldErrors.message
                        ? 'border-rose-400 dark:border-red-500/70 focus:border-rose-500'
                        : 'border-slate-200 dark:border-zinc-800 focus:border-slate-400 dark:focus:border-zinc-600'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="text-[10px] font-sans text-rose-600 dark:text-red-400 mt-1">{fieldErrors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="contact-submit-btn"
                  disabled={contactMutation.isPending}
                  className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white dark:bg-white dark:hover:bg-zinc-100 dark:disabled:bg-zinc-700 dark:text-black text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  {contactMutation.isPending ? (
                    <span>Sending your note...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Note</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-50 dark:bg-[#0e0e0e] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Syne',sans-serif]">
                Direct Contact &amp; Profiles
              </h3>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#181818] flex items-center justify-center text-slate-700 dark:text-zinc-300">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans uppercase">Direct Email</div>
                    <div className="text-xs font-sans text-slate-900 dark:text-zinc-200 font-medium">{profile?.email || 'contact@example.com'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-md bg-slate-50 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:bg-[#181818] dark:hover:bg-[#202020] border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-white dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#181818] flex items-center justify-center text-slate-700 dark:text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans uppercase">Based In</div>
                  <div className="text-xs font-sans text-slate-900 dark:text-zinc-200 font-medium">{profile?.location || 'India'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={profile?.githubUrl || 'https://github.com'}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 dark:bg-[#121212] dark:hover:bg-[#181818] dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800 text-xs uppercase tracking-wider font-semibold transition-colors shadow-2xs"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a
                  href={profile?.linkedinUrl || 'https://linkedin.com'}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 dark:bg-[#121212] dark:hover:bg-[#181818] dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800 text-xs uppercase tracking-wider font-semibold transition-colors shadow-2xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};