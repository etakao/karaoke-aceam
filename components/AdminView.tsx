'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useScheduleStream } from '@/lib/useScheduleStream';
import type { Singer, ScheduleState } from '@/lib/store';

type FormValues = {
  numero: string;
  nome_cantor: string;
  nome_musica: string;
  cidade: string;
  categoria: string;
};
const emptyForm: FormValues = {
  numero: '',
  nome_cantor: '',
  nome_musica: '',
  cidade: '',
  categoria: '',
};

export default function AdminView({
  initialState,
}: {
  initialState: ScheduleState;
}) {
  const state = useScheduleStream(initialState);
  const singers = state.singers;

  const [uploadMessage, setUploadMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNumero, setEditingNumero] = useState<number | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadMessage({
          type: 'error',
          text: data.error ?? 'Não foi possível enviar a programação.',
        });
        return;
      }
      setUploadMessage({
        type: 'success',
        text: `Programação atualizada com ${data.singers.length} cantor(es).`,
      });
    } catch {
      setUploadMessage({
        type: 'error',
        text: 'O arquivo não é um JSON válido.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function openAddForm() {
    setEditingNumero(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(singer: Singer) {
    setEditingNumero(singer.numero);
    setForm({
      numero: String(singer.numero),
      nome_cantor: singer.nome_cantor,
      nome_musica: singer.nome_musica,
      cidade: singer.cidade,
      categoria: singer.categoria,
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingNumero(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numero = Number(form.numero);
    const payload = {
      numero: form.numero.trim() === '' ? undefined : numero,
      nome_cantor: form.nome_cantor.trim(),
      nome_musica: form.nome_musica.trim(),
      cidade: form.cidade.trim(),
      categoria: form.categoria.trim(),
    };
    if (
      !payload.nome_cantor ||
      !payload.nome_musica ||
      !payload.categoria ||
      (form.numero.trim() !== '' && Number.isNaN(numero))
    )
      return;

    if (editingNumero !== null) {
      await fetch(`/api/singers/${editingNumero}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/singers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    closeForm();
  }

  async function handleSetCurrent(numero: number) {
    const isLive = state.currentNumber === numero;
    await fetch('/api/current', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero: isLive ? null : numero }),
    });
  }

  async function handleDelete(numero: number) {
    await fetch(`/api/singers/${numero}`, { method: 'DELETE' });
  }

  return (
    <div className='app'>
      <header className='topbar'>
        <Image
          className='mark'
          src='/logo.jpg'
          alt='Karaoke ACEAM'
          width={576}
          height={160}
          priority
        />
        <h1 className='word'>
          Karaoke ACEAM
          <small>painel administrativo</small>
        </h1>
        <Link
          className='admin-link'
          href='/'
        >
          Ver página pública
        </Link>
      </header>
      <div className='brush' />

      <main id='adminView'>
        <div className='admin-section'>
          <div
            className='upload-box'
            hidden
          >
            <p>
              Envie um arquivo com uma lista de cantores. Cada item precisa de
              número, nome do cantor, música e categoria; a cidade é opcional.
            </p>
            <input
              ref={fileInputRef}
              type='file'
              accept='application/json,.json'
              onChange={handleFileChange}
            />
            {uploadMessage ? (
              <p
                className={
                  uploadMessage.type === 'error' ? 'form-error' : 'form-success'
                }
              >
                {uploadMessage.text}
              </p>
            ) : null}
          </div>
        </div>

        <div className='admin-section'>
          <h3>Cantores</h3>

          {!formOpen ? (
            <button
              className='admin-add'
              onClick={openAddForm}
            >
              + Adicionar cantor
            </button>
          ) : (
            <form
              className='activity-form'
              onSubmit={handleSubmit}
            >
              <div className='field-row'>
                <div className='field'>
                  <label htmlFor='nome_cantor'>Cantor</label>
                  <input
                    id='nome_cantor'
                    required
                    value={form.nome_cantor}
                    onChange={(e) =>
                      setForm({ ...form, nome_cantor: e.target.value })
                    }
                    placeholder='Nome do cantor'
                  />
                </div>
                <div className='field'>
                  <label htmlFor='categoria'>Categoria</label>
                  <input
                    id='categoria'
                    required
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value })
                    }
                    placeholder='MINYO'
                  />
                </div>
              </div>
              <div className='field-row'>
                <div className='field'>
                  <label htmlFor='numero'>Número (opcional)</label>
                  <input
                    id='numero'
                    type='number'
                    value={form.numero}
                    onChange={(e) =>
                      setForm({ ...form, numero: e.target.value })
                    }
                    placeholder='1'
                  />
                </div>
                <div className='field'>
                  <label htmlFor='cidade'>Cidade/Grupo (opcional)</label>
                  <input
                    id='cidade'
                    value={form.cidade}
                    onChange={(e) =>
                      setForm({ ...form, cidade: e.target.value })
                    }
                    placeholder='ACEVI'
                  />
                </div>
              </div>
              <div className='field-row'>
                <div className='field'>
                  <label htmlFor='nome_musica'>Música</label>
                  <input
                    id='nome_musica'
                    required
                    value={form.nome_musica}
                    onChange={(e) =>
                      setForm({ ...form, nome_musica: e.target.value })
                    }
                    placeholder='Nome da música'
                  />
                </div>
              </div>
              <div className='form-actions'>
                <button
                  type='button'
                  className='btn btn-ghost'
                  onClick={closeForm}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='btn btn-primary'
                >
                  Salvar cantor
                </button>
              </div>
            </form>
          )}

          <div className='admin-list'>
            {singers.map((s) => {
              const isLive = state.currentNumber === s.numero;
              return (
                <motion.div
                  key={s.numero}
                  layout
                  className={`admin-row${isLive ? ' live' : ''}`}
                >
                  <button
                    className={`disc${isLive ? ' on' : ''}`}
                    title='Definir como cantor atual'
                    aria-pressed={isLive}
                    onClick={() => handleSetCurrent(s.numero)}
                  />
                  <div className='admin-row-body'>
                    <div className='admin-row-top'>
                      <span className='admin-row-order'>#{s.numero}</span>
                      <span className='admin-row-name'>{s.nome_cantor}</span>
                    </div>
                    <div className='admin-row-meta'>
                      <span>{s.nome_musica}</span>
                      <span>{s.categoria}</span>
                      {s.cidade ? <span>{s.cidade}</span> : null}
                    </div>
                  </div>
                  <div className='admin-row-actions'>
                    <button
                      className='icon-btn'
                      onClick={() => openEditForm(s)}
                    >
                      Editar
                    </button>
                    <button
                      className='icon-btn danger'
                      onClick={() => handleDelete(s.numero)}
                    >
                      Excluir
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {singers.length === 0 ? (
              <p className='hero-empty'>Nenhum cantor cadastrado ainda.</p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

