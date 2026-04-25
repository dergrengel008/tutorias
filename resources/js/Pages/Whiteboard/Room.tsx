import { useState, useEffect, useCallback, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Tldraw,
    Editor,
} from 'tldraw';
import 'tldraw/tldraw.css';
import {
    X,
    Square,
    Clock,
    Send,
    MessageSquare,
    Save,
    Users,
    Timer,
} from 'lucide-react';
import { useRemainingTime } from '@/Hooks/useCountdown';
import type { TutoringSession } from '@/types';

interface PageProps {
    session: TutoringSession;
    isTutor: boolean;
}

interface ChatMessage {
    id: number;
    user_name: string;
    message: string;
    created_at: string;
    is_tutor: boolean;
}

// ─── Simple hash for change detection ─────────────────────────────────
function simpleHash(obj: unknown): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return String(hash);
}

// ─── Sanitize snapshot to fix tldraw bug: document.name can be null ───
// tldraw's getSnapshot() returns document.name as null, but loadSnapshot()
// validates strictly that it must be a string. This fixes that.
function sanitizeSnapshot(snapshot: unknown): Record<string, unknown> | null {
    if (!snapshot || typeof snapshot !== 'object') return null;

    // Deep clone to avoid mutating the original data
    const data = JSON.parse(JSON.stringify(snapshot));

    // Fix: ensure document.name is a string, not null
    try {
        const docStore = data?.document?.store;
        if (docStore && docStore['document:document']) {
            if (docStore['document:document'].name === null || docStore['document:document'].name === undefined) {
                docStore['document:document'].name = '';
            }
        }
    } catch {
        // If structure is unexpected, just return as-is
    }

    return data;
}

// ─── Remaining time display component ────────────────────────────────────
function RemainingTimer({ durationMinutes, startedAt }: { durationMinutes?: number | null; startedAt?: string | null }) {
    const { text, expired } = useRemainingTime(durationMinutes, startedAt);

    if (!durationMinutes || !startedAt) return null;

    return (
        <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            expired
                ? 'bg-red-500/20 text-red-400'
                : 'bg-amber-500/20 text-amber-400'
        }`}>
            <Timer className="h-3.5 w-3.5" />
            <span className="font-mono font-bold tabular-nums">{expired ? '00:00:00' : text}</span>
            {expired && (
                <span className="hidden sm:inline text-red-400 font-semibold animate-pulse ml-1">!</span>
            )}
        </div>
    );
}

export default function WhiteboardRoom({ session, isTutor }: PageProps) {
    const { props } = usePage();
    const auth = props.auth as { user: { name: string; id: number } };

    const [editor, setEditor] = useState<Editor | null>(null);
    const [, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const [showEndModal, setShowEndModal] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(true);
    const [syncStatus, setSyncStatus] = useState<string>('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Refs for sync logic
    const isDrawingRef = useRef(false);
    const drawingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedHashRef = useRef<string>('');
    const lastLoadedHashRef = useRef<string>('');
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Timer
    useEffect(() => {
        if (session.status !== 'in_progress') return;

        if (session.started_at) {
            const started = new Date(session.started_at).getTime();
            const elapsed = Math.floor((Date.now() - started) / 1000);
            setElapsedTime(elapsed);
        }

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [session.started_at, session.status]);

    // Format timer
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Save whiteboard to server
    const saveWhiteboard = useCallback(async (editorInstance: Editor) => {
        if (!editorInstance) return;
        try {
            const snapshot = editorInstance.getSnapshot();
            const hash = simpleHash(snapshot);

            // Skip if nothing changed
            if (hash === lastSavedHashRef.current) return;
            lastSavedHashRef.current = hash;
            lastLoadedHashRef.current = hash;
            lastLoadedHashRef.current = hash;

            setIsSaving(true);
            setSaveStatus('saving');

            // Send as JSON string (controller validates 'required|string')
            await axios.post(`/api/whiteboard/${session.id}`, {
                whiteboard_data: JSON.stringify(snapshot),
            });

            setSaveStatus('saved');
        } catch (err) {
            console.error('Error saving whiteboard:', err);
            setSaveStatus('unsaved');
        } finally {
            setIsSaving(false);
        }
    }, [session.id]);

    // Load whiteboard from server (for polling sync)
    const loadWhiteboard = useCallback(async (editorInstance: Editor) => {
        if (!editorInstance || isDrawingRef.current) return;

        try {
            const response = await axios.get(`/api/whiteboard/${session.id}`);
            const serverData = response.data?.whiteboard_data;

            if (!serverData) return;

            // Parse if it's a string (MySQL JSON column may return string)
            const parsed = typeof serverData === 'string'
                ? JSON.parse(serverData)
                : serverData;

            const serverHash = simpleHash(parsed);

            // Skip if already loaded this version
            if (serverHash === lastLoadedHashRef.current) return;
            if (serverHash === lastSavedHashRef.current) return;

            // Sanitize: fix document.name null → ""
            const sanitized = sanitizeSnapshot(parsed);
            if (!sanitized) return;

            editorInstance.loadSnapshot(sanitized);
            lastLoadedHashRef.current = serverHash;
            lastSavedHashRef.current = serverHash;
            setSyncStatus(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (err) {
            // Silent fail - polling should not break the app
        }
    }, [session.id]);

    // Handle editor mount
    const handleMount = useCallback(
        (editorInstance: Editor) => {
            setEditor(editorInstance);

            // Load existing whiteboard data if any
            if (session.whiteboard_data) {
                try {
                    const sanitized = sanitizeSnapshot(session.whiteboard_data);
                    if (sanitized) {
                        editorInstance.loadSnapshot(sanitized);
                        lastLoadedHashRef.current = simpleHash(session.whiteboard_data);
                        lastSavedHashRef.current = lastLoadedHashRef.current;
                    }
                } catch (e) {
                    console.warn('Could not load existing whiteboard data, starting fresh:', e);
                }
            }

            // ─── Drawing detection ───────────────────────────────
            // Detect when user is actively drawing to avoid sync conflicts
            const handlePointerDown = () => {
                isDrawingRef.current = true;
                if (drawingTimeoutRef.current) {
                    clearTimeout(drawingTimeoutRef.current);
                }
            };

            const handlePointerUp = () => {
                // Grace period: 2 seconds after last stroke
                drawingTimeoutRef.current = setTimeout(() => {
                    isDrawingRef.current = false;
                    drawingTimeoutRef.current = null;
                }, 2000);
            };

            const container = editorInstance.getContainerElement?.() || document.body;
            container.addEventListener('pointerdown', handlePointerDown);
            container.addEventListener('pointerup', handlePointerUp);

            // ─── Save on change (debounced 1.5s) ────────────────
            const handleChange = () => {
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }
                saveTimeoutRef.current = setTimeout(() => {
                    saveWhiteboard(editorInstance);
                }, 1500);
            };

            editorInstance.on('change', handleChange);

            // Store cleanup refs
            return () => {
                container.removeEventListener('pointerdown', handlePointerDown);
                container.removeEventListener('pointerup', handlePointerUp);
                if (drawingTimeoutRef.current) clearTimeout(drawingTimeoutRef.current);
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                editorInstance.off('change', handleChange);
            };
        },
        [session.whiteboard_data, saveWhiteboard]
    );

    // Auto-save every 5s (backup)
    useEffect(() => {
        if (!editor) return;

        const interval = setInterval(() => {
            saveWhiteboard(editor);
        }, 5000);

        return () => clearInterval(interval);
    }, [editor, saveWhiteboard]);

    // Polling: sync whiteboard every 3s (only when not drawing)
    useEffect(() => {
        if (!editor) return;

        const interval = setInterval(() => {
            loadWhiteboard(editor);
        }, 3000);

        return () => clearInterval(interval);
    }, [editor, loadWhiteboard]);

    // Load chat messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/whiteboard/${session.id}/chat`);
                if (response.data.messages) {
                    setChatMessages(response.data.messages);
                }
            } catch {
                // Chat not available yet
            }
        };
        fetchMessages();

        // Poll messages every 5s
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [session.id]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Send chat message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = newMessage.trim();
        setNewMessage('');

        try {
            await axios.post(`/api/whiteboard/${session.id}/chat`, {
                message: msg,
            });
            setChatMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    user_name: auth.user.name,
                    message: msg,
                    created_at: new Date().toISOString(),
                    is_tutor: isTutor,
                },
            ]);
        } catch {
            console.error('Error sending message');
        }
    };

    // End session
    const handleEndSession = async () => {
        if (editor) {
            await saveWhiteboard(editor);
        }
        setShowEndModal(false);
        router.post(`/sessions/${session.id}/end`);
    };

    // Manual save
    const handleManualSave = () => {
        if (editor) {
            saveWhiteboard(editor);
        }
    };

    const otherPerson = isTutor ? session.student?.name : session.tutor_profile?.user?.name;

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Top Toolbar */}
            <div className="h-14 bg-gray-900 text-white flex items-center justify-between px-4 shrink-0 shadow-lg z-50">
                {/* Left: Session Info */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold leading-tight">{session.title}</p>
                            <p className="text-xs text-gray-400">Sesión de tutoría</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{auth.user.name}</span>
                        {otherPerson && (
                            <>
                                <span className="text-gray-600">|</span>
                                <span>{otherPerson}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Center: Timer + Remaining Time */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-1.5">
                        <div className={`h-2 w-2 rounded-full ${session.status === 'in_progress' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-mono font-bold text-sm tabular-nums">{formatTime(elapsedTime)}</span>
                    </div>
                    <RemainingTimer durationMinutes={session.duration_minutes} startedAt={session.started_at} />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Sync status */}
                    {syncStatus && (
                        <div className="hidden sm:flex items-center gap-1 bg-gray-800 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-400">
                            <span>Sync: {syncStatus}</span>
                        </div>
                    )}

                    {/* Save Status */}
                    <button
                        onClick={handleManualSave}
                        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                        <Save className={`h-3.5 w-3.5 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">
                            {saveStatus === 'saved' ? 'Guardado' : saveStatus === 'saving' ? 'Guardando...' : 'Sin guardar'}
                        </span>
                    </button>

                    {/* Chat Toggle */}
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            showChat ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Chat</span>
                    </button>

                    {/* End Session (tutor only) */}
                    {isTutor && (
                        <button
                            onClick={() => setShowEndModal(true)}
                            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                            <Square className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Finalizar</span>
                        </button>
                    )}

                    {/* Exit */}
                    <a
                        href="/sessions"
                        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Salir</span>
                    </a>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Tldraw Canvas */}
                <div style={{ flex: 1, position: 'relative', height: 'calc(100vh - 56px)' }}>
                    <Tldraw onMount={handleMount} />

                    {/* Floating save indicator */}
                    {saveStatus === 'saving' && (
                        <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                            <Save className="h-3 w-3 animate-spin" />
                            Guardando...
                        </div>
                    )}
                    {saveStatus === 'saved' && syncStatus && (
                        <div className="absolute bottom-4 left-4 bg-emerald-900/80 backdrop-blur-sm text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                            <Save className="h-3 w-3" />
                            Guardado y sincronizado
                        </div>
                    )}
                </div>

                {/* Chat Sidebar */}
                {showChat && (
                    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 px-4 py-3">
                            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-indigo-500" />
                                Chat de la Sesión
                            </h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No hay mensajes aún</p>
                                    <p className="text-xs text-gray-300 mt-1">
                                        Envía un mensaje para comunicarte
                                    </p>
                                </div>
                            ) : (
                                chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${
                                            msg.user_name === auth.user.name ? 'items-end' : 'items-start'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span
                                                className={`text-xs font-medium ${
                                                    msg.is_tutor ? 'text-indigo-600' : 'text-emerald-600'
                                                }`}
                                            >
                                                {msg.user_name}
                                            </span>
                                            <span className="text-xs text-gray-300">
                                                {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                                                msg.user_name === auth.user.name
                                                    ? 'bg-indigo-600 text-white rounded-br-md'
                                                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                                            }`}
                                        >
                                            {msg.message}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="bg-white border-t border-gray-200 p-3"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* End Session Modal */}
            {showEndModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Square className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                ¿Finalizar la sesión?
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                La pizarra se guardará automáticamente. Esta acción no se puede deshacer.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Duración:</span>
                                    <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEndModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEndSession}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-medium transition-colors"
                                >
                                    Finalizar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
