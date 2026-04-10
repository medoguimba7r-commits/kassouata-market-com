import Navbar from "@/components/Navbar";
import { MessageCircle } from "lucide-react";

const Messages = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container max-w-2xl">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-6">Messages</h1>
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-heading font-semibold text-xl text-card-foreground mb-2">
              Aucune conversation
            </h2>
            <p className="text-muted-foreground">
              Contactez un vendeur sur le marketplace pour démarrer une conversation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
