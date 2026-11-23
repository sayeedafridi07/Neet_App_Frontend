import katex from "katex";
import { memo, useMemo, useState } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { KATEX_CSS } from "./katexCss";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

type Props = {
  /** Markdown content, optionally containing LaTeX ($…$, $$…$$, \(…\), \[…\]). */
  content: string;
  color: string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: "400" | "500" | "600" | "700";
  style?: StyleProp<ViewStyle>;
};

// $$…$$ | \[…\] (display) and $…$ | \(…\) (inline). Single $ must not be
// followed/preceded by whitespace so prices like "$5 and $10" aren't treated as math.
const MATH_RE =
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\s)((?:\\\$|[^$\n])+?)(?<!\s)\$/g;

export const hasMath = (s: string) => {
  MATH_RE.lastIndex = 0;
  return MATH_RE.test(s);
};

const md = new MarkdownIt({ html: false, breaks: true, linkify: false });

const renderMath = (tex: string, displayMode: boolean) =>
  katex.renderToString(tex, { displayMode, throwOnError: false, strict: false });

/** Swap math for placeholders, render markdown, then put KaTeX HTML back. */
export const toHtml = (content: string) => {
  const math: string[] = [];
  const masked = content.replace(MATH_RE, (_, d1, d2, i1, i2) => {
    const display = d1 != null || d2 != null;
    math.push(renderMath((d1 ?? d2 ?? i1 ?? i2).trim(), display));
    return `@@MATH${math.length - 1}@@`;
  });
  return md
    .render(masked)
    .replace(/@@MATH(\d+)@@/g, (_: string, i: string) => math[Number(i)]);
};

const buildDocument = (
  body: string,
  { color, fontSize, lineHeight, fontWeight }: Required<
    Pick<Props, "color" | "fontSize" | "lineHeight" | "fontWeight">
  >,
) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>${KATEX_CSS}</style>
<style>
  html,body{margin:0;padding:0;background:transparent;}
  body{color:${color};font-family:-apple-system,system-ui,Roboto,sans-serif;
    font-size:${fontSize}px;line-height:${lineHeight}px;font-weight:${fontWeight};
    -webkit-user-select:none;user-select:none;overflow:hidden;word-wrap:break-word;}
  p{margin:0 0 6px;} p:last-child{margin-bottom:0;}
  ul,ol{margin:0 0 6px;padding-left:20px;}
  .katex{font-size:1.05em;} .katex-display{margin:6px 0;overflow-x:auto;overflow-y:hidden;}
  img{max-width:100%;}
  table{border-collapse:collapse;} td,th{border:1px solid ${color}40;padding:4px 6px;}
</style></head><body><div id="c">${body}</div>
<script>
  (function(){
    var last=0;
    function post(){
      var h=Math.ceil(document.getElementById('c').getBoundingClientRect().height);
      if(h!==last){last=h;window.ReactNativeWebView.postMessage(String(h));}
    }
    new ResizeObserver(post).observe(document.getElementById('c'));
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(post);
    window.addEventListener('load',post);
    post();
  })();
</script></body></html>`;

const heightCache = new Map<string, number>();

const MathWebView = ({
  html,
  style,
}: {
  html: string;
  style?: StyleProp<ViewStyle>;
}) => {
  // Reuse the last measured height for this exact HTML so revisiting a
  // question doesn't collapse and re-grow.
  const [height, setHeight] = useState(() => heightCache.get(html) ?? 0);
  const onMessage = (e: WebViewMessageEvent) => {
    const h = Number(e.nativeEvent.data);
    if (h > 0) {
      heightCache.set(html, h);
      setHeight(h);
    }
  };

  return (
    // pointerEvents none so taps fall through to parent Pressables (options).
    <View
      style={[{ height: height || 24, opacity: height ? 1 : 0 }, style]}
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
};

export const RichText = memo(function RichText({
  content,
  color,
  fontSize = 16,
  lineHeight = 24,
  fontWeight = "400",
  style,
}: Props) {
  const containsMath = useMemo(() => hasMath(content), [content]);

  const html = useMemo(
    () =>
      containsMath
        ? buildDocument(toHtml(content), {
            color,
            fontSize,
            lineHeight,
            fontWeight,
          })
        : null,
    [containsMath, content, color, fontSize, lineHeight, fontWeight],
  );

  const mdStyles = useMemo(
    () =>
      StyleSheet.create({
        body: { color, fontSize, lineHeight, fontWeight },
        paragraph: { marginTop: 0, marginBottom: 6 },
        bullet_list: { marginBottom: 6 },
        ordered_list: { marginBottom: 6 },
        strong: { fontWeight: "700" },
        code_inline: { backgroundColor: "transparent", color },
      }),
    [color, fontSize, lineHeight, fontWeight],
  );

  if (html) return <MathWebView html={html} style={style} />;

  return (
    <View style={style}>
      <Markdown style={mdStyles} markdownit={md}>
        {content}
      </Markdown>
    </View>
  );
});

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: "transparent" },
});

export default RichText;
