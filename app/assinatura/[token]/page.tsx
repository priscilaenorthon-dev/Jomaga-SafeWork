'use client';

import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PenLine, Check, RotateCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';

interface CollaboratorView {
  id: string;
  name: string;
  signature_invite_expires_at?: string;
}

function SignatureCanvas({ value, onChange }: { value?: string; onChange: (sig: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawing.current = true;
    const pos = getPos(e.nativeEvent as MouseEvent | TouchEvent, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e.nativeEvent as MouseEvent | TouchEvent, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A237E';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  }, []);

  const endDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  }, [onChange]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={420}
          height={120}
          className="w-full cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <p className="absolute bottom-1 right-2 text-[10px] text-slate-300 select-none pointer-events-none">Desenhe aqui</p>
      </div>
      <button type="button" onClick={clearCanvas} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors">
        <RotateCcw size={12} /> Limpar assinatura
      </button>
    </div>
  );
}

export default function AssinaturaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collaborator, setCollaborator] = useState<CollaboratorView | null>(null);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [consent, setConsent] = useState(true);

  useEffect(() => {
    const fetchCollaborator = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborators')
        .select('id, name, signature_invite_expires_at')
        .eq('signature_invite_token', token)
        .maybeSingle();

      if (error || !data) {
        toast.error('Link inválido ou expirado.');
        setLoading(false);
        return;
      }

      const expired = data.signature_invite_expires_at
        ? new Date(data.signature_invite_expires_at).getTime() < Date.now()
        : true;

      if (expired) {
        toast.error('Este link já expirou. Solicite um novo link ao administrador.');
        setLoading(false);
        return;
      }

      setCollaborator(data as CollaboratorView);
      setLoading(false);
    };

    fetchCollaborator();
  }, [token]);

  const handleSave = async () => {
    if (!collaborator) return;
    if (!digitalSignature) {
      toast.error('Assinatura obrigatória.');
      return;
    }
    if (!consent) {
      toast.error('É necessário consentimento LGPD para continuar.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('collaborators')
      .update({
        digital_signature: digitalSignature,
        lgpd_consent: true,
        lgpd_consent_date: new Date().toISOString(),
        signature_invite_token: null,
        signature_invite_expires_at: null,
      })
      .eq('id', collaborator.id);

    setSaving(false);
    if (error) {
      toast.error('Não foi possível salvar sua assinatura.');
      return;
    }

    toast.success('Assinatura confirmada! Você já pode acessar o sistema.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!collaborator) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200 text-center">
          <p className="text-slate-700 font-medium">Link inválido ou expirado.</p>
          <p className="text-slate-500 text-sm mt-1">Solicite um novo convite de assinatura.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200"
      >
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PenLine size={20} className="text-primary" /> Assinatura de Cadastro
          </h1>
          <p className="text-sm text-slate-500 mt-1">Colaborador: <strong>{collaborator.name}</strong></p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Assinatura Digital *</label>
            <SignatureCanvas value={digitalSignature} onChange={setDigitalSignature} />
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            <span>Autorizo o tratamento de meus dados pessoais para fins de gestão de segurança, conforme LGPD.</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Confirmar assinatura
            </button>
            <Link href="/login" className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 text-center">
              Ir para o sistema
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
