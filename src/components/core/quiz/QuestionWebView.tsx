import { KATEX_CSS } from "@/components/common/katexCss";
import { toHtml } from "@/components/common/RichText";
import { useTheme } from "@/theme/use-theme";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

type Colors = ReturnType<typeof useTheme>["colors"];

export type QuestionWebViewOption = {
  id: string;
  text?: string | null;
  imageUrl?: string | null;
};

type Props = {
  question: string;
  imageUrl?: string | null;
  options: QuestionWebViewOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  onClear: () => void;
  /** Image URLs of upcoming questions, downloaded ahead into the WebView cache. */
  preloadUrls?: string[];
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const buildShell = (c: Colors) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>${KATEX_CSS}</style>
<style>
  :root{--text:${c.text};--primary:${c.primary};--border:${c.border};--surface:${c.surface};
    --bg:${c.background};--on-primary:${c.onPrimary};--error:${c.error};}
  html,body{margin:0;padding:0;background:transparent;}
  body{color:var(--text);font-family:-apple-system,system-ui,Roboto,sans-serif;
    font-size:16px;line-height:24px;-webkit-user-select:none;user-select:none;
    -webkit-tap-highlight-color:transparent;overflow:hidden;word-wrap:break-word;}
  p{margin:0 0 6px;} p:last-child{margin-bottom:0;}
  ul,ol{margin:0 0 6px;padding-left:20px;}
  .katex{font-size:1.05em;} .katex-display{margin:6px 0;overflow-x:auto;overflow-y:hidden;}
  table{border-collapse:collapse;} td,th{border:1px solid var(--border);padding:4px 6px;}
  .q{margin-bottom:20px;}
  .qimg{width:100%;height:200px;object-fit:contain;object-position:top;border-radius:8px;
    background:var(--surface);margin-bottom:20px;display:block;}
  .row{display:flex;justify-content:space-between;align-items:center;}
  .label{color:var(--primary);font-size:14px;line-height:20px;font-weight:700;}
  .clear{color:var(--error);font-size:12px;line-height:16px;padding:8px 0 8px 8px;}
  .opts{display:flex;flex-direction:column;gap:12px;margin-top:12px;}
  .opt{display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:12px;
    border:1px solid var(--border);background:var(--bg);font-size:17px;line-height:26px;}
  .opt:active{opacity:.7;}
  .opt.sel{border-color:var(--primary);background:var(--surface);color:var(--primary);font-weight:600;}
  .letter{flex:none;width:25px;height:25px;border-radius:999px;border:1.5px solid var(--border);
    display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--text);}
  .opt.sel .letter{background:var(--primary);border-color:var(--primary);color:var(--on-primary);}
  .body{flex:1;min-width:0;padding-top:4px;display:flex;flex-direction:column;gap:8px;}
  .oimg{width:70%;height:120px;object-fit:contain;border-radius:8px;background:#fff;}
</style></head><body><div id="c"></div>
<script>
  (function(){
    var c=document.getElementById('c'),last=0;
    function send(m){window.ReactNativeWebView.postMessage(JSON.stringify(m));}
    function post(){var h=Math.ceil(c.getBoundingClientRect().height);
      if(h!==last){last=h;send({t:'h',h:h});}}
    new ResizeObserver(post).observe(c);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(post);
    c.addEventListener('click',function(e){
      var el=e.target.closest('[data-id],.clear');
      if(!el)return;
      if(el.classList.contains('clear'))send({t:'clear'});
      else send({t:'sel',id:el.getAttribute('data-id')});
    });
    window.renderQ=function(html){c.innerHTML=html;post();};
    var seen={},keep=[];
    window.preload=function(urls){urls.forEach(function(u){
      if(seen[u])return;seen[u]=1;var i=new Image();i.src=u;keep.push(i);});};
    window.setSel=function(id){
      var sel=!!id;
      document.querySelectorAll('.opt').forEach(function(o){
        var on=o.getAttribute('data-id')===id;
        o.classList.toggle('sel',on);o.setAttribute('aria-checked',on);});
      var cl=document.querySelector('.clear');if(cl)cl.style.visibility=sel?'visible':'hidden';
    };
    send({t:'ready'});
  })();
</script></body></html>`;

const buildBody = (p: Pick<Props, "question" | "imageUrl" | "options">) => {
  const opts = p.options
    .map(
      (o, i) => `<div class="opt" role="radio" data-id="${esc(o.id)}">
  <div class="letter">${String.fromCharCode(65 + i)}</div>
  <div class="body">${o.text ? toHtml(o.text) : ""}${
    o.imageUrl ? `<img class="oimg" decoding="async" src="${esc(o.imageUrl)}">` : ""
  }</div></div>`,
    )
    .join("");
  return `<div class="q">${toHtml(p.question)}</div>${
    p.imageUrl ? `<img class="qimg" decoding="async" src="${esc(p.imageUrl)}">` : ""
  }<div class="row"><span class="label">Select one option</span>
<span class="clear" style="visibility:hidden">Clear response</span></div>
<div class="opts">${opts}</div>`;
};

/**
 * Renders a question + its options in ONE persistent WebView. The page loads
 * once; later questions and selection changes are injected, so moving between
 * questions doesn't pay WebView start-up cost.
 */
export default function QuestionWebView({
  question,
  imageUrl,
  options,
  selectedOptionId,
  onSelect,
  onClear,
  preloadUrls,
}: Props) {
  const { colors } = useTheme();
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(0);

  // Shell only depends on theme; rebuilding it reloads the page.
  const shell = useMemo(() => buildShell(colors), [colors]);

  const body = useMemo(
    () => buildBody({ question, imageUrl, options }),
    [question, imageUrl, options],
  );

  // Re-render the page only when the question changes; selection changes
  // just toggle classes. lastBody resets when the shell reloads.
  const lastBody = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) {
      lastBody.current = null;
      return;
    }
    const render =
      lastBody.current !== body ? `renderQ(${JSON.stringify(body)});` : "";
    lastBody.current = body;
    ref.current?.injectJavaScript(
      `${render}setSel(${JSON.stringify(selectedOptionId)});true;`,
    );
  }, [ready, body, selectedOptionId]);

  const preloadKey = preloadUrls?.join("|") ?? "";
  useEffect(() => {
    if (!ready || !preloadKey) return;
    ref.current?.injectJavaScript(
      `preload(${JSON.stringify(preloadKey.split("|"))});true;`,
    );
  }, [ready, preloadKey]);

  const onMessage = (e: WebViewMessageEvent) => {
    let m: { t: string; h?: number; id?: string };
    try {
      m = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (m.t === "ready") setReady(true);
    else if (m.t === "h" && m.h) setHeight(m.h);
    else if (m.t === "sel" && m.id) onSelect(m.id);
    else if (m.t === "clear") onClear();
  };

  return (
    <View style={{ height: height || 300, opacity: height ? 1 : 0 }}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html: shell }}
        onMessage={onMessage}
        onLoadStart={() => setReady(false)}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.webview}
        javaScriptEnabled
        androidLayerType="hardware"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: "transparent" },
});
