"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Eye, Share2 } from "lucide-react";
import Link from "next/link";
import Modal from '@/components/ui/Modal';

interface ListFormCelebrationProps {
  show: boolean;
  listId: string;
  listName: string;
  onClose: () => void;
}

export default function ListFormCelebration({ show, listId, listName, onClose }: ListFormCelebrationProps) {
  return (
    <Modal isOpen={show} onClose={onClose} size="sm" ariaLabel="Celebração">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-purple-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-pink-500/[0.06] rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-md w-full p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] text-center"
      >
        {/* Sparkle animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/20"
        >
          <Sparkles className="h-10 w-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
            Lista Criada!
          </h2>
          <p className="text-white/40 mb-8">
            A sua lista <span className="text-purple-400 font-semibold">"{listName}"</span> foi criada com sucesso.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href={`/lists/${listId}`}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Eye className="h-4 w-4" />
            Ver Lista
          </Link>
          <button
            onClick={onClose}
            className="py-3.5 px-5 bg-white/[0.06] border border-white/[0.08] text-white/60 font-semibold rounded-2xl hover:bg-white/[0.1] transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4" />
            Fechar
          </button>
        </motion.div>
      </motion.div>
    </Modal>
  );
}