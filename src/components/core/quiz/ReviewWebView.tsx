import { KATEX_CSS } from "@/components/common/katexCss";
import { toHtml } from "@/components/common/RichText";
import { useTheme } from "@/theme/use-theme";
import type { QuizResultQuestion } from "@/types";
import { memo, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

type Colors = ReturnType<typeof useTheme>["colors"];

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Measured heights survive FlatList recycling, so scrolling back to a card
// doesn't collapse and re-grow it.
const heightCache = new Map<string, number>();

const buildHtml = (item: QuizResultQuestion, c: Colors) => {
  const options = [...item.options]
    .sort((a, b) => a.order - b.order)
    .map((o, i) => {
      const cls = o.isCorrect ? "ok" : o.isSelected ? "bad" : "";
      const icon = o.isCorrect ? "✓" : o.isSelected ? "✕" : "";
      return `<div class="opt ${cls}">
  <b>${String.fromCharCode(65 + i)}.</b>
  <div class="body">${o.text ? toHtml(o.text) : ""}${
    o.imageUrl
      ? `<img class="oimg" decoding="async" src="${esc(o.imageUrl)}">`
      : ""
  }${o.isSelected ? `<div class="mine">Your answer</div>` : ""}</div>
  ${icon ? `<span class="icon">${icon}</span>` : ""}</div>`;
    })
    .join("");

  const explanation =
    item.explanation || item.explanationImageUrl
      ? `<div class="exp"><div class="label">Explanation</div>${
          item.explanation
            ? `<div class="sm">${toHtml(item.explanation)}</div>`
            : ""
        }${
          item.explanationImageUrl
            ? `<img class="qimg" decoding="async" src="${esc(item.explanationImageUrl)}">`
            : ""
        }</div>`
      : "";

  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>${KATEX_CSS}</style>
<style>
  html,body{margin:0;padding:0;background:transparent;}
  body{color:${c.text};font-family:-apple-system,system-ui,Roboto,sans-serif;
    font-size:16px;line-height:24px;-webkit-user-select:none;user-select:none;
    overflow:hidden;word-wrap:break-word;}
  p{margin:0 0 6px;} p:last-child{margin-bottom:0;}
  ul,ol{margin:0 0 6px;padding-left:20px;}
  .katex{font-size:1.05em;} .katex-display{margin:6px 0;overflow-x:auto;overflow-y:hidden;}
  table{border-collapse:collapse;} td,th{border:1px solid ${c.border};padding:4px 6px;}
  .q{font-weight:500;margin-bottom:20px;}
  .qimg{width:100%;height:180px;object-fit:contain;object-position:top;border-radius:8px;
    background:${c.surface};margin-bottom:16px;display:block;}
  .label{color:${c.primary};font-size:14px;line-height:20px;font-weight:700;}
  .opts{display:flex;flex-direction:column;gap:12px;margin-top:12px;}
  .opt{display:flex;align-items:flex-start;gap:8px;padding:12px;border-radius:16px;
    border:1px solid ${c.border};background:${c.background};font-size:17px;line-height:26px;}
  .opt.ok{background:${c.success};border-color:${c.success};color:${c.onPrimary};}
  .opt.bad{background:${c.error};border-color:${c.error};color:${c.onPrimary};}
  .body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
  .mine{font-size:12px;line-height:16px;}
  .icon{font-weight:700;width:18px;text-align:center;}
  .oimg{width:70%;height:110px;object-fit:contain;border-radius:8px;background:#fff;}
  .exp{margin-top:16px;padding:16px;border-radius:12px;background:${c.surface};
    border-left:4px solid ${c.primary};display:flex;flex-direction:column;gap:4px;}
  .sm{font-size:14px;line-height:20px;}
</style></head><body><div id="c">
<div class="q">${toHtml(item.question)}</div>${
    item.imageUrl
      ? `<img class="qimg" decoding="async" src="${esc(item.imageUrl)}">`
      : ""
  }<div class="label">Options:</div><div class="opts">${options}</div>${explanation}
</div>
<script>
  (function(){
    var c=document.getElementById('c'),last=0;
    function post(){var h=Math.ceil(c.getBoundingClientRect().height);
      if(h!==last){last=h;window.ReactNativeWebView.postMessage(String(h));}}
    new ResizeObserver(post).observe(c);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(post);
    post();
  })();
</script></body></html>`;
};

/**
 * One WebView for a review card's question, options and explanation. Used only
 * when the card contains LaTeX; plain cards stay native.
 */
const ReviewWebView = memo(function ReviewWebView({
  item,
}: {
  item: QuizResultQuestion;
}) {
  const { colors } = useTheme();
  const html = useMemo(() => buildHtml(item, colors), [item, colors]);
  const [height, setHeight] = useState(() => heightCache.get(html) ?? 0);

  const onMessage = (e: WebViewMessageEvent) => {
    const h = Number(e.nativeEvent.data);
    if (h > 0) {
      heightCache.set(html, h);
      setHeight(h);
    }
  };

  return (
    <View
      style={{ height: height || 300, opacity: height ? 1 : 0 }}
      pointerEvents="none"
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={onMessage}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.webview}
        javaScriptEnabled
        androidLayerType="hardware"
      />
    </View>
  );
});

export default ReviewWebView;

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: "transparent" },
});
