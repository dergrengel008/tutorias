import { useState, useEffect, useRef } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import DefaultLayout from '@/Layouts/DefaultLayout';
import {
    MessageSquare,
    Send,
    ArrowLeft,
    Search,
    Circle,
} from 'lucide-react';

interface Conversation {
    id: number;
    other_user: {
        id: number;
        name: string;
        avatar?: string;
    };
    last_message?: {
        content: string;
        created_at: string;
    };
    unread_count: number;
    updated_at: string;
}

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    created_at: string;
}

interface PageProps {
    conversations?: Conversation[];
    messages?: Message[];
    activeConversationId?: number | null;
    auth?: any;
}

export default function MessagesIndex({
    conversations = [],
    messages = [],
    activeConversationId = null,
}: PageProps) {
    const { props } = usePage();
    const auth = props.auth as any;
    const currentUser = auth?.user;
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
    });

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId
    );

    const totalUnread = conversations.reduce(
        (sum, c) => sum + c.unread_count,
        0
    );

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for new messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeConversationId) {
                router.reload({ only: ['messages', 'conversations'] });
            } else {
                router.reload({ only: ['conversations'] });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [activeConversationId]);

    const selectConversation = (conversationId: number) => {
        setMobileShowChat(true);
        router.get(
            `/messages/${conversationId}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.content.trim() || !activeConversationId) return;

        post(`/messages/${activeConversationId}`, {
            onSuccess: () => {
                reset('content');
                router.reload({ only: ['messages', 'conversations'] });
            },
        });
    };

    const handleBackToList = () => {
        setMobileShowChat(false);
        router.get(
            '/messages',
            {},
            { preserveState: true, preserveScroll: true }
        );
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday =
            date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
        });
    };

    const filteredConversations = searchQuery
        ? conversations.filter((c) =>
              c.other_user.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
          )
        : conversations;

    const renderAvatar = (user: { name: string; avatar?: string }, size = 'md') => {
        const sizeClasses =
            size === 'lg'
                ? 'h-12 w-12 text-lg'
                : 'h-10 w-10 text-sm';
        if (user.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.name}
                    className={`${sizeClasses} rounded-full object-cover shrink-0`}
                />
            );
        }
        return (
            <div
                className={`${sizeClasses} rounded-full bg-indigo-100 flex items-center justify-center shrink-0`}
            >
                <span className="font-semibold text-indigo-600">
                    {user.name.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    };

    return (
        <DefaultLayout>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                        <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Mensajes
                        </h1>
                        {totalUnread > 0 && (
                            <p className="text-sm text-gray-500">
                                {totalUnread} mensaje
                                {totalUnread !== 1 ? 's' : ''} sin leer
                            </p>
                        )}
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                    <div className="flex h-[calc(100vh-16rem)] min-h-[500px]">
                        {/* Conversation list - left column */}
                        <div
                            className={`w-full border-r border-gray-200 flex flex-col ${
                                mobileShowChat
                                    ? 'hidden md:flex'
                                    : 'flex'
                            } md:w-80 lg:w-96 shrink-0`}
                        >
                            {/* Search */}
                            <div className="p-3 border-b border-gray-100">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder="Buscar conversación..."
                                        className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            {/* Conversation list */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                        <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-sm font-medium text-gray-500">
                                            No hay conversaciones
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Las conversaciones se crearán
                                            automáticamente cuando reserves una
                                            tutoría.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredConversations.map(
                                            (conversation) => (
                                                <button
                                                    key={conversation.id}
                                                    onClick={() =>
                                                        selectConversation(
                                                            conversation.id
                                                        )
                                                    }
                                                    className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-indigo-50/50 ${
                                                        activeConversationId ===
                                                        conversation.id
                                                            ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                                                            : ''
                                                    }`}
                                                >
                                                    {renderAvatar(
                                                        conversation.other_user
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p
                                                                className={`text-sm font-semibold truncate ${
                                                                    activeConversationId ===
                                                                    conversation.id
                                                                        ? 'text-indigo-700'
                                                                        : 'text-gray-900'
                                                                }`}
                                                            >
                                                                {
                                                                    conversation
                                                                        .other_user
                                                                        .name
                                                                }
                                                            </p>
                                                            {conversation.last_message && (
                                                                <span className="text-xs text-gray-400 shrink-0">
                                                                    {formatTime(
                                                                        conversation
                                                                            .last_message
                                                                            .created_at
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {conversation
                                                                    .last_message
                                                                    ?.content ||
                                                                    'Sin mensajes aún'}
                                                            </p>
                                                            {conversation.unread_count >
                                                                0 && (
                                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white shrink-0">
                                                                    {
                                                                        conversation.unread_count
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat area - right column */}
                        <div
                            className={`flex-1 flex flex-col ${
                                mobileShowChat
                                    ? 'flex'
                                    : 'hidden md:flex'
                            }`}
                        >
                            {activeConversationId &&
                            activeConversation ? (
                                <>
                                    {/* Chat header */}
                                    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                                        <button
                                            onClick={handleBackToList}
                                            className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                        {renderAvatar(
                                            activeConversation.other_user,
                                            'lg'
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {
                                                    activeConversation
                                                        .other_user.name
                                                }
                                            </p>
                                            <p className="text-xs text-emerald-500 flex items-center gap-1">
                                                <Circle className="h-2 w-2 fill-emerald-400" />
                                                En línea
                                            </p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                                                <p className="text-sm font-medium text-gray-500">
                                                    Inicia la conversación
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Envía un mensaje para
                                                    comenzar a chatear con{' '}
                                                    {
                                                        activeConversation
                                                            .other_user.name
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((message) => {
                                                    const isSender =
                                                        message.sender_id ===
                                                        currentUser?.id;
                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`flex ${
                                                                isSender
                                                                    ? 'justify-end'
                                                                    : 'justify-start'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                                                    isSender
                                                                        ? 'bg-indigo-600 text-white rounded-br-md'
                                                                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                                                                }`}
                                                            >
                                                                <p className="text-sm leading-relaxed">
                                                                    {
                                                                        message.content
                                                                    }
                                                                </p>
                                                                <p
                                                                    className={`text-[10px] mt-1 ${
                                                                        isSender
                                                                            ? 'text-indigo-200'
                                                                            : 'text-gray-400'
                                                                    }`}
                                                                >
                                                                    {formatTime(
                                                                        message.created_at
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={messagesEndRef} />
                                            </>
                                        )}
                                    </div>

                                    {/* Message input */}
                                    <form
                                        onSubmit={handleSendMessage}
                                        className="border-t border-gray-100 p-3"
                                    >
                                        {errors.content && (
                                            <p className="text-xs text-red-600 mb-2 px-2">
                                                {errors.content}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={data.content}
                                                onChange={(e) =>
                                                    setData(
                                                        'content',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Escribe un mensaje..."
                                                disabled={processing}
                                                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' &&
                                                        !e.shiftKey
                                                    ) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    !data.content.trim()
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                                            >
                                                {processing ? (
                                                    <svg
                                                        className="h-4 w-4 animate-spin"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                /* Empty state - no conversation selected */
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                    <div className="h-20 w-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                        <MessageSquare className="h-10 w-10 text-indigo-300" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700">
                                        Selecciona una conversación
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1 max-w-sm">
                                        Elige una conversación de la lista para
                                        comenzar a chatear, o inicia una nueva
                                        reservando una tutoría.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}
