import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "Gerador e Editor de Templates HTML";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Crie e edite templates HTML visualmente. Faça upload, ajuste propriedades e salve seu HTML prontinho.");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold">Gerador e Editor de Templates HTML</h1>
          <p className="text-lg text-muted-foreground">Carregue um arquivo, identifique componentes ao passar o mouse, edite propriedades e baixe o HTML final.</p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link to="/editor">Abrir Editor</Link>
            </Button>
            <Button asChild variant="secondary">
              <a href="#como-funciona">Como funciona</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto pb-16">
        <section id="como-funciona" className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-1">1. Faça upload</h3>
              <p className="text-sm text-muted-foreground">Carregue um arquivo .html ou use o exemplo inicial.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-1">2. Passe o mouse</h3>
              <p className="text-sm text-muted-foreground">Identifique elementos visualmente e veja suas propriedades.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-1">3. Edite e salve</h3>
              <p className="text-sm text-muted-foreground">Aplique alterações e baixe o HTML editado em um clique.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
