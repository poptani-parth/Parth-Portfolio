import React from 'react';
import {
  Server,
  Database,
  Code2,
  Sparkles,
  Bot,
  Layers,
  Cpu,
  ShieldCheck,
  Terminal,
  Workflow,
  Boxes,
  FileCode2,
  Binary,
  Flame,
  Globe,
  GitBranch,
  Rocket,
  Shield,
  Zap,
  LayoutGrid,
} from 'lucide-react';

interface TechIconProps {
  name?: string | null;
  className?: string;
  size?: number;
}

export const TechIcon: React.FC<TechIconProps> = ({
  name = '',
  className = 'w-5 h-5',
  size = 20,
}) => {
  // Defensive guard: ensure name is always a valid string
  const normalized = String(name || '').toLowerCase().trim();

  // Custom visual SVG/Icon handlers for distinct tech identities
  if (normalized.includes('spring')) {
    return (
      <span className={`inline-flex items-center justify-center text-emerald-500 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" />
        </svg>
      </span>
    );
  }

  if (normalized.includes('java') && !normalized.includes('script')) {
    return (
      <span className={`inline-flex items-center justify-center text-amber-500 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 19h16v2H4zm14-9c0-1.66-1.34-3-3-3h-2V5c0-.55-.45-1-1-1s-1 .45-1 1v2H9c-1.66 0-3 1.34-3 3v4c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4v-1h1c1.1 0 2-.9 2-2s-.9-2-2-2h-1v-1zm-4 4H8v-4c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v4zm4-2h-2v-1h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
        </svg>
      </span>
    );
  }

  if (normalized.includes('python')) {
    return (
      <span className={`inline-flex items-center justify-center text-sky-500 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a5 5 0 0 0-5 5v3h5v1H5a5 5 0 0 0-5 5 5 5 0 0 0 5 5h2v-3a3 3 0 0 1 3-3h4a3 3 0 0 0 3-3V7a5 5 0 0 0-5-5h-1zm-2 2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 22a5 5 0 0 0 5-5v-3h-5v-1h7a5 5 0 0 0 5-5 5 5 0 0 0-5-5h-2v3a3 3 0 0 1-3 3h-4a3 3 0 0 0-3 3v5a5 5 0 0 0 5 5h1zm2-2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </svg>
      </span>
    );
  }

  if (normalized.includes('supabase') || normalized.includes('postgres')) {
    return (
      <span className={`inline-flex items-center justify-center text-emerald-400 ${className}`}>
        <Database className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('mongo')) {
    return (
      <span className={`inline-flex items-center justify-center text-green-500 ${className}`}>
        <Flame className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('mysql') || normalized.includes('sql')) {
    return (
      <span className={`inline-flex items-center justify-center text-blue-500 ${className}`}>
        <Database className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('redis')) {
    return (
      <span className={`inline-flex items-center justify-center text-red-500 ${className}`}>
        <Layers className="w-full h-full" />
      </span>
    );
  }

  if (
    normalized.includes('claude') ||
    normalized.includes('chatgpt') ||
    normalized.includes('copilot') ||
    normalized.includes('ai')
  ) {
    return (
      <span className={`inline-flex items-center justify-center text-purple-400 ${className}`}>
        <Sparkles className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('postman')) {
    return (
      <span className={`inline-flex items-center justify-center text-orange-500 ${className}`}>
        <Rocket className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('intellij') || normalized.includes('vscode')) {
    return (
      <span className={`inline-flex items-center justify-center text-indigo-400 ${className}`}>
        <Terminal className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('git')) {
    return (
      <span className={`inline-flex items-center justify-center text-rose-500 ${className}`}>
        <GitBranch className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('maven') || normalized.includes('docker')) {
    return (
      <span className={`inline-flex items-center justify-center text-blue-400 ${className}`}>
        <Boxes className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('dsa') || normalized.includes('algorithm')) {
    return (
      <span className={`inline-flex items-center justify-center text-teal-400 ${className}`}>
        <Binary className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('oop') || normalized.includes('mvc')) {
    return (
      <span className={`inline-flex items-center justify-center text-cyan-400 ${className}`}>
        <Boxes className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('rbac') || normalized.includes('security')) {
    return (
      <span className={`inline-flex items-center justify-center text-emerald-400 ${className}`}>
        <ShieldCheck className="w-full h-full" />
      </span>
    );
  }

  if (
    normalized.includes('rest') ||
    normalized.includes('api') ||
    normalized.includes('jwt')
  ) {
    return (
      <span className={`inline-flex items-center justify-center text-violet-400 ${className}`}>
        <Zap className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('javascript') || normalized.includes('js')) {
    return (
      <span className={`inline-flex items-center justify-center text-amber-400 ${className}`}>
        <FileCode2 className="w-full h-full" />
      </span>
    );
  }

  if (normalized.includes('html') || normalized.includes('css')) {
    return (
      <span className={`inline-flex items-center justify-center text-sky-400 ${className}`}>
        <Globe className="w-full h-full" />
      </span>
    );
  }

  // Safe fallback icon
  return (
    <span className={`inline-flex items-center justify-center text-blue-400 ${className}`}>
      <Code2 className="w-full h-full" />
    </span>
  );
};