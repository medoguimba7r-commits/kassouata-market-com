import Navbar from "@/components/Navbar";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";

const Messages = () => {
  const { user } = useAuth();
  const { t, language } = useSettings();
  const queryClient = useQueryClient();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, profiles_p1:profiles!conversations_participant_1_fkey(display_name), profiles_p2:profiles!conversations_participant_2_fkey(display_name)")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("updated_at", { ascending: false });
      if (error) {
        // Fallback without joins if FK names differ
        const { data: d2, error: e2 } = await supabase
          .from("conversations")
          .select("*")
          .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
          .order("updated_at", { ascending: false });
        if (e2) throw e2;
        return d2 || [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConvo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConvo!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedConvo,
    refetchInterval: 3000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!selectedConvo || !user) return;
    supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", selectedConvo)
      .neq("sender_id", user.id)
      .eq("is_read", false)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
      });
  }, [selectedConvo, messages, user, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConvo!,
        sender_id: user!.id,
        content,
      });
      if (error) throw error;
      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConvo!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConvo] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setNewMessage("");
    },
  });

  const getOtherParticipantName = (convo: any) => {
    if (!user) return "Utilisateur";
    if (convo.participant_1 === user.id) {
      return convo.profiles_p2?.display_name || "Utilisateur";
    }
    return convo.profiles_p1?.display_name || "Utilisateur";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 h-screen flex flex-col">
        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-foreground mb-2">{t("noConversation")}</h2>
              <p className="text-muted-foreground">{t("contactSellerStart")}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Conversation list */}
            <div className={`w-full md:w-80 border-r border-border overflow-y-auto ${selectedConvo ? "hidden md:block" : ""}`}>
              <div className="p-4">
                <h1 className="font-heading font-bold text-xl text-foreground mb-4">{t("messages")}</h1>
                <div className="space-y-1">
                  {conversations.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConvo(convo.id)}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        selectedConvo === convo.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <p className="font-medium text-foreground truncate">{getOtherParticipantName(convo)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(convo.updated_at).toLocaleDateString(language)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages area */}
            {selectedConvo ? (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <button
                    onClick={() => setSelectedConvo(null)}
                    className="md:hidden text-sm text-primary"
                  >
                    ← {t("back")}
                  </button>
                  <h2 className="font-heading font-semibold text-foreground">
                    {getOtherParticipantName(conversations.find((c) => c.id === selectedConvo))}
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                          msg.sender_id === user?.id
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                        <div className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newMessage.trim()) sendMutation.mutate(newMessage.trim());
                  }}
                  className="p-4 border-t border-border flex gap-2"
                >
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("writeMessage")}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendMutation.isPending}
                    className="gradient-primary p-2.5 rounded-xl text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
                {t("selectConversation")}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
