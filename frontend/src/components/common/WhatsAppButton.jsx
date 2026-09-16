import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const WhatsAppButton = ({
  className,
  url,
  text = 'Chat with Kush on WhatsApp',
  variant = 'default', // 'default', 'floating', 'compact'
}) => {
  const whatsappUrl =
    url ||
    import.meta.env.VITE_WHATSAPP_CONTACT_URL ||
    'https://wa.me/919999999999';

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Kush on WhatsApp"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group font-medium',
          className
        )}
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-sm font-semibold">
          {text}
        </span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-6 py-3.5 rounded-lg shadow-lg transition-all duration-200 hover:shadow-[#25D366]/20 active:scale-[0.98] text-sm',
        className
      )}
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span>{text}</span>
    </a>
  );
};
