import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

function getElementPath(el: Element | null): string {
  if (!el) return "";
  const parts: string[] = [];
  while (el && el.nodeType === 1 && el instanceof Element && el.tagName.toLowerCase() !== "html") {
    let selector = el.tagName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
      parts.unshift(selector);
      break;
    } else {
      const siblingIndex = Array.from(el.parentElement?.children || []).filter(
        (s) => s.tagName === el.tagName
      ).indexOf(el) + 1;
      selector += siblingIndex > 0 ? `:nth-of-type(${siblingIndex})` : "";
    }
    parts.unshift(selector);
    el = el.parentElement as Element;
  }
  parts.unshift("html");
  return parts.join(" > ");
}

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exemplo de Template</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; margin: 0; padding: 2rem; }
    .hero { padding: 2rem; border-radius: 12px; background: linear-gradient(135deg, hsl(210 40% 98%), hsl(210 40% 96.1%)); border: 1px solid hsl(214.3 31.8% 91.4%); }
    .btn { display: inline-block; padding: 0.6rem 1rem; border-radius: 8px; background: hsl(222.2 47.4% 11.2%); color: white; text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <h1>Bem-vindo</h1>
  </header>
  <main>
    <section class="hero">
      <h2>Seção Hero</h2>
      <p>Este é um exemplo inicial. Passe o mouse para editar.</p>
      <a class="btn" href="#">Chamada para Ação</a>
    </section>
  </main>
  <footer>
    <small>© 2025</small>
  </footer>
</body>
</html>`;

const HtmlEditor = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [srcDoc, setSrcDoc] = useState<string>(SAMPLE_HTML);
  const [docRef, setDocRef] = useState<Document | null>(null);
  const [hoverEl, setHoverEl] = useState<Element | null>(null);
  const [locked, setLocked] = useState(false);

  // Editable properties
  const [elId, setElId] = useState("");
  const [elClass, setElClass] = useState("");
  const [elStyle, setElStyle] = useState("");
  const [elText, setElText] = useState("");

  const selectedPath = useMemo(() => getElementPath(hoverEl), [hoverEl]);

  useEffect(() => {
    document.title = "Editor de Templates HTML";
    // Meta description for SEO
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Edite arquivos HTML visualmente: passe o mouse, ajuste propriedades e salve o template.");
  }, []);

  const loadIntoForm = (el: Element | null) => {
    if (!el) return;
    setElId(el.getAttribute("id") || "");
    setElClass(el.getAttribute("class") || "");
    setElStyle(el.getAttribute("style") || "");
    setElText(el.textContent || "");
  };

  // Attach listeners inside the iframe
  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    setDocRef(doc);

    // Clean previous listeners if needed
    doc.addEventListener("mouseover", onMouseOver, true);
    doc.addEventListener("click", onClickEl, true);

    // Ensure a base CSS for highlighting
    const styleTag = doc.createElement("style");
    styleTag.innerHTML = `
      .__lov-hover-highlight { outline: 2px solid hsl(217.2 91.2% 59.8%); outline-offset: 2px; cursor: pointer; }
      .__lov-selection-locked { outline: 2px solid hsl(222.2 47.4% 11.2%); outline-offset: 2px; }
    `;
    doc.head.appendChild(styleTag);
  };

  const clearHighlight = (el: Element | null) => {
    if (!el) return;
    el.classList.remove("__lov-hover-highlight");
    el.classList.remove("__lov-selection-locked");
  };

  const onMouseOver = (e: Event) => {
    const targetNode = e.target as Node | null;
    if (!targetNode || (targetNode as Node).nodeType !== 1) return; // cross-iframe safe
    if (locked) return; // do not change while locked

    if (hoverEl && hoverEl !== (targetNode as Element)) clearHighlight(hoverEl);

    const target = targetNode as Element;
    target.classList.add("__lov-hover-highlight");
    setHoverEl(target);
    loadIntoForm(target);
  };

  const onClickEl = (e: Event) => {
    const targetNode = e.target as Node | null;
    if (!targetNode || targetNode.nodeType !== 1) return; // cross-iframe safe
    e.preventDefault();
    e.stopPropagation();
    // Toggle lock
    const target = targetNode as Element;
    setLocked((prev) => {
      const next = !prev;
      clearHighlight(hoverEl);
      if (next) {
        target.classList.add("__lov-selection-locked");
      } else {
        target.classList.add("__lov-hover-highlight");
      }
      setHoverEl(target);
      loadIntoForm(target);
      return next;
    });
  };

  const handleApplyChanges = () => {
    if (!hoverEl) return;
    if (elId.trim()) hoverEl.setAttribute("id", elId.trim());
    else hoverEl.removeAttribute("id");

    if (elClass.trim()) hoverEl.setAttribute("class", elClass.trim());
    else hoverEl.removeAttribute("class");

    if (elStyle.trim()) hoverEl.setAttribute("style", elStyle.trim());
    else hoverEl.removeAttribute("style");

    hoverEl.textContent = elText;
  };

  const handleSave = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const html = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "template-editado.html";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setSrcDoc(text);
    setHoverEl(null);
    setLocked(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.includes("html")) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur border-b">
        <div className="container mx-auto py-4 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Editor de Templates HTML</h1>
          <div className="ml-auto flex items-center gap-2">
            <Input type="file" accept=".html,text/html" onChange={onFileChange} />
            <Button onClick={handleSave}>Salvar HTML</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 py-4">
        <section className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Visualização e Edição</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-md overflow-hidden"
                onDrop={onDrop}
                onDragOver={onDragOver}
                aria-label="Área de visualização do HTML"
              >
                <iframe
                  ref={iframeRef}
                  title="Editor de HTML"
                  srcDoc={srcDoc}
                  onLoad={handleIframeLoad}
                  className="w-full h-[70vh] bg-white"
                  sandbox="allow-same-origin allow-forms allow-scripts"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Dica: clique em um elemento para bloquear a seleção e editar com segurança.
              </p>
            </CardContent>
          </Card>
        </section>

        <aside className="lg:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Propriedades</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="lock">Bloquear</Label>
                  <Switch id="lock" checked={locked} onCheckedChange={setLocked} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Elemento selecionado</Label>
                  <div className="text-xs text-muted-foreground truncate" title={selectedPath}>
                    {hoverEl ? selectedPath : "Passe o mouse sobre um elemento"}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="elId">id</Label>
                  <Input id="elId" value={elId} onChange={(e) => setElId(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="elClass">class</Label>
                  <Input id="elClass" value={elClass} onChange={(e) => setElClass(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="elStyle">style (inline)</Label>
                  <Textarea id="elStyle" value={elStyle} onChange={(e) => setElStyle(e.target.value)} rows={3} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="elText">conteúdo (texto)</Label>
                  <Textarea id="elText" value={elText} onChange={(e) => setElText(e.target.value)} rows={6} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleApplyChanges} disabled={!hoverEl}>Aplicar alterações</Button>
                  <Button variant="secondary" onClick={() => hoverEl && loadIntoForm(hoverEl)} disabled={!hoverEl}>
                    Recarregar do elemento
                  </Button>
                </div>

                <Separator className="my-4" />

                <ScrollArea className="h-40">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Como usar:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Arraste um arquivo .html para a área de visualização ou use o input acima.</li>
                      <li>Passe o mouse sobre elementos para ver e editar propriedades.</li>
                      <li>Clique para bloquear a seleção enquanto edita.</li>
                      <li>Use “Salvar HTML” para baixar o template editado.</li>
                    </ul>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default HtmlEditor;
