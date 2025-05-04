import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Trash2, Clock } from 'lucide-react';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useChatStore, ChatSession } from '../stores/chatStore';

const History = () => {
  const navigate = useNavigate();
  const { sessions, fetchHistory, setCurrentSession } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        await fetchHistory();
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [fetchHistory]);

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(message => 
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const goToChat = (sessionId: string) => {
    setCurrentSession(sessionId);
    navigate(`/chat/${sessionId}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chat History</h1>
        <p className="text-muted-foreground">
          Browse and search your past conversations
        </p>
      </header>

      <div className="mb-6">
        <Input
          icon={<Search size={18} />}
          placeholder="Search in conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Clock size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No conversations found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchTerm 
              ? `No results matching "${searchTerm}". Try a different search term.` 
              : "You haven't had any conversations yet. Start a new chat to begin."}
          </p>
        </div>
      ) : (
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredSessions.map((session) => (
            <HistoryCard
              key={session.id}
              session={session}
              onClick={() => goToChat(session.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

interface HistoryCardProps {
  session: ChatSession;
  onClick: () => void;
}

const HistoryCard = ({ session, onClick }: HistoryCardProps) => {
  const firstUserMessage = session.messages.find(m => m.role === 'user');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate">{session.title}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1 text-muted-foreground">
            <Trash2 size={16} />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {firstUserMessage?.content || 'No messages'}
        </p>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <MessageSquare size={14} className="mr-1" />
          <span>
            {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
          </span>
          <span className="mx-2">•</span>
          <time dateTime={session.updatedAt.toISOString()}>
            {format(new Date(session.updatedAt), 'MMM d, yyyy')}
          </time>
        </div>
      </div>
    </motion.div>
  );
};

export default History;