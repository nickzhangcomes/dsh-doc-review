/**
 * Plugin stylesheet. Surfaces ride the shell's --dsw-alias tokens so light and
 * dark follow the theme; ::highlight() rules paint the in-place marks.
 */
const TAG_ID = 'dsh-doc-review/review.css'

const CSS = `
body{
  --dsr-surface:var(--dsw-alias-bg-layer-1,#fff);
  --dsr-border:var(--dsw-alias-border-l2,rgba(0,0,0,.1));
  --dsr-text:var(--dsw-alias-label-primary,#1f2329);
  --dsr-text-2:var(--dsw-alias-label-secondary,#646a73);
  --dsr-text-3:var(--dsw-alias-label-tertiary,#8f959e);
  --dsr-hover:var(--dsw-alias-interactive-bg-hover-solid,rgba(31,35,41,.06));
  --dsr-brand:var(--dsw-static-deepseek-500,#4d6bfe);
  --dsr-shadow:0 1px 2px rgba(31,35,41,.06),0 4px 14px rgba(31,35,41,.08);
  --dsr-shadow-lg:0 2px 4px rgba(31,35,41,.06),0 10px 28px rgba(31,35,41,.14);
  --dsd-line:color-mix(in srgb,var(--dsr-text) 12%,transparent);
  --dsd-line2:color-mix(in srgb,var(--dsr-text) 22%,transparent);
  --dsd-hover:color-mix(in srgb,var(--dsr-text) 6%,transparent);
  --dsd-soft:color-mix(in srgb,var(--dsr-text) 3%,var(--dsr-surface));
}

/* In-place marks: quiet by default, stronger when their card is active. */
::highlight(dsr-comment){background-color:rgba(255,198,10,.20);text-decoration:underline 2px rgba(232,170,0,.85);text-underline-offset:3px}
::highlight(dsr-agree){background-color:rgba(36,160,104,.14)}
::highlight(dsr-disagree){background-color:rgba(229,72,77,.09);text-decoration:underline wavy 1.5px rgba(229,72,77,.75);text-underline-offset:3px}
::highlight(dsr-active){background-color:rgba(255,198,10,.42)}

/* Kind accents. */
[data-kind='comment']{--dsr-accent:#d9a400}
[data-kind='agree']{--dsr-accent:#24a068}
[data-kind='disagree']{--dsr-accent:#e5484d}

/* Selection toolbar. */
.dsr-float-root{position:fixed;inset:0;pointer-events:none;z-index:80}
.dsr-float-root>*{pointer-events:auto}
.dsr-toolbar{position:fixed;display:flex;align-items:center;gap:2px;height:34px;padding:0 4px;border-radius:8px;border:1px solid var(--dsr-border);background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg);animation:dsr-pop .12s ease-out}
.dsr-tb-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:26px;min-width:26px;padding:0 5px;border:none;border-radius:6px;background:none;color:var(--dsr-text-2);cursor:pointer;font:inherit;font-size:13px;line-height:1}
.dsr-tb-btn:hover{background:var(--dsr-hover);color:var(--dsr-text)}
.dsr-tb-primary{padding:0 8px;color:var(--dsr-text);font-weight:500}
.dsr-tb-sep{width:1px;height:16px;margin:0 3px;background:var(--dsr-border)}
.dsr-tip{position:fixed;padding:4px 8px;border-radius:6px;background:rgba(31,35,41,.92);color:#fff;font-size:12px;line-height:16px;white-space:nowrap;pointer-events:none}
@keyframes dsr-pop{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}

/* Margin cards. */
.dsr-margin-host,.dsr-bar-host{position:fixed;inset:0;pointer-events:none;z-index:60}
.dsr-margin{position:fixed;inset:0;pointer-events:none}
.dsr-slot{position:fixed;pointer-events:auto;transition:top .18s ease,left .18s ease}
.dsr-card{position:relative;box-sizing:border-box;padding:8px 10px 8px 12px;border:1px solid var(--dsr-border);border-radius:8px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow);cursor:default}
.dsr-card::before{content:'';position:absolute;left:-1px;top:10px;bottom:10px;width:3px;border-radius:0 3px 3px 0;background:var(--dsr-accent);opacity:.9}
.dsr-card[data-active='true']{box-shadow:var(--dsr-shadow-lg);border-color:transparent}
.dsr-card-head{display:flex;align-items:center;gap:6px;height:24px}
.dsr-kind-chip{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 6px;margin-left:-4px;border:none;border-radius:5px;background:none;color:var(--dsr-accent);cursor:pointer;font:inherit;font-size:12px;font-weight:600}
.dsr-kind-chip:hover{background:var(--dsr-hover)}
.dsr-kind-chip svg:last-child{opacity:.6}
.dsr-card-num{margin-left:auto;color:var(--dsr-text-3);font-size:12px;font-variant-numeric:tabular-nums}
.dsr-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:5px;background:none;color:var(--dsr-text-3);cursor:pointer}
.dsr-icon-btn:hover{background:var(--dsr-hover);color:var(--dsr-text)}
.dsr-card-del{opacity:0;transition:opacity .12s}
.dsr-card:hover .dsr-card-del,.dsr-card[data-active='true'] .dsr-card-del{opacity:1}
.dsr-card-del:hover{color:#e5484d}
.dsr-card-text{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:2px 0;border:none;background:none;resize:none;outline:none;color:var(--dsr-text);font:inherit;font-size:13px;line-height:20px;overflow:hidden}
.dsr-card-text::placeholder{color:var(--dsr-text-3)}
.dsr-card-warn{margin-top:2px;color:#e5484d;font-size:12px;line-height:18px}
.dsr-menu{position:absolute;z-index:2;top:32px;left:6px;min-width:132px;padding:4px;border:1px solid var(--dsr-border);border-radius:8px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg)}
.dsr-menu-item{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;border:none;border-radius:5px;background:none;color:var(--dsr-text);cursor:pointer;font:inherit;font-size:13px;text-align:left}
.dsr-menu-item svg:first-child{color:var(--dsr-accent)}
.dsr-menu-item svg:last-child:not(:first-child){margin-left:auto;color:var(--dsr-brand)}
.dsr-menu-item:hover{background:var(--dsr-hover)}
.dsr-marker{position:fixed;pointer-events:auto;width:20px;height:20px;border:none;border-radius:10px 10px 10px 2px;background:var(--dsr-accent);color:#fff;font-size:11px;font-weight:600;line-height:20px;text-align:center;cursor:pointer;box-shadow:var(--dsr-shadow)}

/* Send bar. */
.dsr-anchor{height:0;width:100%}
.dsr-sendbar-wrap{position:fixed;transform:translateX(-50%);pointer-events:auto;display:flex;flex-direction:column;align-items:center;gap:8px}
.dsr-sendbar{display:flex;align-items:center;gap:2px;height:40px;padding:0 4px 0 6px;border:1px solid var(--dsr-border);border-radius:20px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg);white-space:nowrap;animation:dsr-pop .15s ease-out}
.dsr-sb-count{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 8px;border:none;border-radius:15px;background:none;color:var(--dsr-text);cursor:pointer;font:inherit;font-size:13px;font-weight:500}
.dsr-sb-count:hover{background:var(--dsr-hover)}
.dsr-sb-warn{padding:0 6px;color:#e5484d;font-size:12px}
.dsr-sb-sep{width:1px;height:16px;margin:0 4px;background:var(--dsr-border)}
.dsr-sb-ghost{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:none;border-radius:15px;background:none;color:var(--dsr-text-2);cursor:pointer;font:inherit;font-size:13px}
.dsr-sb-ghost:hover,.dsr-sb-ghost[data-on='true']{background:var(--dsr-hover);color:var(--dsr-text)}
.dsr-sb-btn{height:30px;padding:0 14px;border:1px solid var(--dsr-border);border-radius:15px;background:var(--dsr-surface);color:var(--dsr-text);cursor:pointer;font:inherit;font-size:13px;font-weight:500}
.dsr-sb-btn+.dsr-sb-btn{margin-left:4px}
.dsr-sb-btn:hover:not(:disabled){background:var(--dsr-hover)}
.dsr-sb-primary{border-color:transparent;background:var(--dsr-brand);color:#fff}
.dsr-sb-primary:hover:not(:disabled){background:var(--dsr-brand);filter:brightness(1.07)}
.dsr-sb-btn:disabled{opacity:.4;cursor:default}
.dsr-overall-pop{width:420px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:10px 12px;border:1px solid var(--dsr-border);border-radius:10px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg);animation:dsr-pop .12s ease-out}
.dsr-overall-title{font-size:12px;font-weight:600;color:var(--dsr-text-2);margin-bottom:4px}
.dsr-overall-text{display:block;width:100%;min-height:60px;max-height:160px;box-sizing:border-box;padding:0;border:none;background:none;resize:vertical;outline:none;color:var(--dsr-text);font:inherit;font-size:13px;line-height:20px}

/* ---------- Document mode: quiet document-tool layer on top of dsh's own theme ---------- */
::highlight(dsd-hl){background-color:rgba(110,170,120,.22)}
::highlight(dsd-cmt){background-color:rgba(240,190,40,.16);text-decoration:underline 1.5px rgba(215,160,20,.6);text-underline-offset:4px}
::highlight(dsd-active){background-color:rgba(240,190,40,.36)}
::highlight(dsd-flash){background-color:rgba(240,190,40,.45)}

.dsd-entry{display:inline-flex;align-items:center;margin-left:6px}
.dsd-docbtn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:.5px solid var(--dsd-line2);border-radius:8px;background:var(--dsr-surface);color:var(--dsr-text-2);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dsd-docbtn:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-badge{margin-left:8px;font-size:12px;color:var(--dsr-text-3);white-space:nowrap}

.dsd-host{position:relative;z-index:75}
.dsd-root{position:fixed;display:flex;flex-direction:column;background:var(--dsr-surface);color:var(--dsr-text);z-index:75;font-size:14px;box-shadow:-1px 0 0 var(--dsd-line)}
.dsd-root button{font:inherit;cursor:pointer}
.dsd-spacer{flex:1}
.dsd-bar{height:52px;flex:none;display:flex;align-items:center;gap:12px;padding:0 16px 0 12px;border-bottom:.5px solid var(--dsd-line)}
.dsd-back{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px 0 6px;border:none;border-radius:8px;background:none;color:var(--dsr-text);font-weight:500}
.dsd-back:hover{background:var(--dsd-hover)}
.dsd-divider{width:.5px;height:18px;background:var(--dsd-line2)}
.dsd-pill{font-size:12px;color:var(--dsr-text-3);white-space:nowrap}
.dsd-title{font-size:14px;color:var(--dsr-text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dsd-panelbtn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:none;border-radius:8px;background:none;color:var(--dsr-text-2);font-size:13px;white-space:nowrap}
.dsd-panelbtn:hover,.dsd-panelbtn.on{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-scroll{flex:1;overflow:auto;position:relative}
.dsd-hint{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:6;width:max-content;max-width:calc(100% - 32px);box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:7px 8px 7px 14px;border-radius:10px;background:var(--dsr-surface);border:.5px solid var(--dsd-line2);color:var(--dsr-text-2);font-size:13px;box-shadow:0 4px 16px rgba(15,23,42,.07)}
.dsd-hint button{width:22px;height:22px;flex:none;border:none;border-radius:6px;background:none;color:var(--dsr-text-3);display:inline-flex;align-items:center;justify-content:center}
.dsd-hint button:hover{background:var(--dsd-hover)}
.dsd-wrap{display:flex;gap:40px;max-width:1080px;margin:0 auto;padding:36px 32px 240px;box-sizing:border-box}
.dsd-doc{flex:1 1 auto;max-width:700px;min-width:0;position:relative}
.dsd-h1{font-size:28px;line-height:1.3;font-weight:700;margin:0 0 8px}
.dsd-meta{color:var(--dsr-text-3);font-size:13px;margin-bottom:24px}
.dsd-body{font-size:16px;line-height:1.9}
.dsd-body ::selection{background:rgba(77,107,254,.18)}
.dsd-rail{flex:0 0 272px;position:relative}
@media (max-width:1180px){.dsd-wrap{gap:24px;padding:28px 20px 240px}.dsd-rail{flex-basis:236px}}

.dsd-tb{position:absolute;z-index:8;transform:translate(-50%,-100%);margin-top:-10px;display:flex;align-items:center;gap:2px;padding:3px;background:var(--dsr-surface);border:.5px solid var(--dsd-line2);border-radius:10px;box-shadow:0 6px 20px rgba(15,23,42,.10)}
.dsd-tb button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:none;border-radius:7px;background:none;color:var(--dsr-text);font-size:13px;white-space:nowrap}
.dsd-tb button:hover{background:var(--dsd-hover)}
.dsd-tb button svg{color:var(--dsr-text-3)}
.dsd-tb-sep{width:.5px;height:16px;margin:0 2px;background:var(--dsd-line2)}

.dsd-card{position:absolute;left:0;right:0;box-sizing:border-box;background:var(--dsr-surface);border:.5px solid var(--dsd-line);border-radius:12px;padding:12px 14px;transition:top .22s ease,transform .15s ease,box-shadow .15s ease,border-color .15s}
.dsd-card:hover{border-color:var(--dsd-line2)}
.dsd-card.is-active{box-shadow:0 8px 28px rgba(15,23,42,.09);border-color:var(--dsd-line2);transform:translateX(-6px)}
.dsd-resolve{position:absolute;top:8px;right:8px;width:26px;height:26px;border:none;border-radius:6px;background:none;color:var(--dsr-text-3);display:inline-flex;align-items:center;justify-content:center;opacity:0;transition:opacity .12s}
.dsd-card:hover .dsd-resolve,.dsd-card.is-active .dsd-resolve{opacity:1}
.dsd-resolve:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-msg+.dsd-msg{margin-top:12px}
.dsd-who{display:flex;align-items:baseline;gap:6px;font-size:13px;padding-right:28px}
.dsd-name{font-weight:500;color:var(--dsr-text)}
.r-agent .dsd-name{color:var(--dsr-text-2)}
.dsd-mt{margin-top:3px;font-size:14px;line-height:1.7;white-space:pre-wrap;color:var(--dsr-text);word-break:break-word}
.r-agent .dsd-mt{color:var(--dsr-text-2);white-space:normal}
.dsd-mt.is-error{color:var(--dsr-text-3)}
.dsd-md-text p{margin:0 0 6px}.dsd-md-text p:last-child{margin-bottom:0}
.dsd-md-text ul,.dsd-md-text ol{margin:4px 0;padding-left:18px}
.dsd-md-text pre{font-size:12px;overflow:auto}
.dsd-thinking{margin-top:4px;font-size:13px;color:var(--dsr-text-3);display:flex;align-items:center;gap:5px}
.dsd-thinking i{width:4px;height:4px;border-radius:2px;background:currentColor;animation:dsd-b 1.1s infinite}
.dsd-thinking i:nth-child(2){animation-delay:.15s}
.dsd-thinking i:nth-child(3){animation-delay:.3s}
@keyframes dsd-b{0%,80%,100%{opacity:.3}40%{opacity:1}}
.dsd-editrow{margin-top:8px;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dsr-text-3)}
.dsd-editrow .dot{width:5px;height:5px;border-radius:3px;background:rgba(215,160,20,.8)}
.dsd-link{border:none;background:none;color:var(--dsr-text-2);font-size:12px;padding:0;text-decoration:underline;text-decoration-color:var(--dsd-line2);text-underline-offset:2px}
.dsd-link:hover{color:var(--dsr-text)}
.dsd-cc{margin-top:12px;border:.5px solid var(--dsd-line2);border-radius:10px;padding:8px 10px;background:var(--dsr-surface)}
.dsd-cc:focus-within{border-color:color-mix(in srgb,var(--dsr-text) 45%,transparent)}
.dsd-cc textarea{display:block;width:100%;box-sizing:border-box;border:none;resize:none;outline:none;font:inherit;font-size:14px;line-height:1.6;min-height:24px;color:var(--dsr-text);background:none;padding:0}
.dsd-cc textarea::placeholder{color:var(--dsr-text-3)}
.dsd-ccrow{display:flex;align-items:center;gap:6px;margin-top:8px}
.dsd-send{width:26px;height:26px;flex:none;border:none;border-radius:7px;background:var(--dsr-text);color:var(--dsr-surface);display:inline-flex;align-items:center;justify-content:center}
.dsd-send:disabled{opacity:.3;cursor:default}
.dsd-toggle{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 6px 0 2px;border:none;border-radius:6px;background:none;color:var(--dsr-text-3);font-size:12px}
.dsd-toggle:hover{background:var(--dsd-hover)}
.dsd-switch{width:12px;height:12px;box-sizing:border-box;border-radius:3px;border:1px solid var(--dsr-text-3);position:relative}
.dsd-toggle.on{color:var(--dsr-text-2)}
.dsd-toggle.on .dsd-switch{border-color:var(--dsr-text-2);background:var(--dsr-text-2)}
.dsd-toggle.on .dsd-switch::after{content:'';position:absolute;left:3px;top:.5px;width:3px;height:6px;border:solid var(--dsr-surface);border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}
.dsd-btn{height:30px;padding:0 12px;border:.5px solid var(--dsd-line2);border-radius:8px;background:var(--dsr-surface);color:var(--dsr-text);font-size:13px}
.dsd-btn:hover{background:var(--dsd-hover)}
.dsd-btn.primary{border-color:transparent;background:var(--dsr-text);color:var(--dsr-surface)}
.dsd-btn.primary:hover{opacity:.88}
.dsd-btn.ghost{border-color:transparent;background:none;color:var(--dsr-text-2)}
.dsd-btn.ghost:hover{background:var(--dsd-hover)}
.dsd-btn.sm{height:26px;padding:0 8px;font-size:12px}
.dsd-ib{width:30px;height:30px;border:none;border-radius:8px;background:none;color:var(--dsr-text-3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.dsd-ib:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-ib.sm{width:24px;height:24px;border-radius:6px}

.dsd-panel{position:absolute;top:52px;right:0;bottom:0;width:340px;max-width:100%;z-index:20;background:var(--dsr-surface);border-left:.5px solid var(--dsd-line2);box-shadow:-8px 0 24px rgba(15,23,42,.05);display:flex;flex-direction:column}
.dsd-panel-h{display:flex;align-items:center;gap:8px;padding:12px 12px 8px 16px}
.dsd-panel-title{font-weight:600;font-size:15px}
.dsd-tabs{display:flex;gap:2px;padding:0 12px 10px;border-bottom:.5px solid var(--dsd-line)}
.dsd-tab{height:28px;padding:0 10px;border:none;border-radius:7px;background:none;color:var(--dsr-text-3);font-size:13px}
.dsd-tab:hover{color:var(--dsr-text)}
.dsd-tab.on{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-plist{flex:1;overflow:auto;padding:8px}
.dsd-pitem{display:block;width:100%;text-align:left;border:none;background:none;border-radius:10px;padding:10px;color:var(--dsr-text)}
.dsd-pitem:hover{background:var(--dsd-hover)}
.dsd-pq{font-size:12px;color:var(--dsr-text-3);padding-left:8px;border-left:1.5px solid rgba(215,160,20,.55);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsd-pb{margin-top:6px;font-size:13px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsd-pm{margin-top:4px;font-size:12px;color:var(--dsr-text-3)}
.dsd-pempty{padding:32px 16px;text-align:center;color:var(--dsr-text-3);font-size:13px}

.dsd-sline{display:flex;gap:10px;padding:9px 0;border-top:.5px solid var(--dsd-line)}
.dsd-stag{flex:none;font-size:11px;font-weight:500;padding:0 6px;border-radius:4px;height:18px;line-height:18px;color:var(--dsr-text-2);background:var(--dsd-hover)}
.dsd-stag.t-hl{color:#2f6b3d;background:rgba(110,170,120,.18)}
.dsd-stag.t-cmt{color:#7a5a08;background:rgba(240,190,40,.18)}
.dsd-sq{font-size:13px;color:var(--dsr-text-3)}
.dsd-sb{font-size:13px;color:var(--dsr-text);margin-top:2px;line-height:1.6;white-space:pre-wrap}
.dsd-overlay{position:absolute;inset:0;z-index:50;background:rgba(15,23,42,.24);display:flex;align-items:center;justify-content:center;padding:24px}
.dsd-modal{width:520px;max-width:100%;max-height:calc(100% - 48px);overflow:auto;box-sizing:border-box;background:var(--dsr-surface);border-radius:14px;padding:22px 24px;box-shadow:0 20px 60px rgba(15,23,42,.18)}
.dsd-mh{font-size:17px;font-weight:600;line-height:1.4}
.dsd-md{margin-top:6px;color:var(--dsr-text-2);line-height:1.7}
.dsd-mlist{margin-top:16px;border:.5px solid var(--dsd-line2);border-radius:10px;padding:2px 14px}
.dsd-mlist .dsd-sline:first-child{border-top:none}
.dsd-mrow{display:flex;align-items:center;gap:8px;margin-top:20px}

.dsd-attachdock{display:flex;flex-direction:column;gap:6px;width:100%;max-width:800px;box-sizing:border-box;margin:0 auto 8px}
.dsd-attach{border:.5px solid var(--dsd-line2);border-radius:10px;background:var(--dsd-soft);padding:6px 6px 6px 10px}
.dsd-attach-h{display:flex;align-items:center;gap:8px;font-size:13px;min-width:0}
.dsd-attach-h>svg{color:var(--dsr-text-3);flex:none}
.dsd-attach-title{font-weight:500;color:var(--dsr-text);white-space:nowrap}
.dsd-attach-sub{color:var(--dsr-text-3);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dsd-attach-list{max-height:180px;overflow:auto;margin-top:6px;padding:0 6px 2px 0}
.dsd-attach-list .dsd-sline:first-child{border-top:none}
[data-composer-chip="dsh-doc-review"]{display:none}
.dsd-refmsg{display:flex;flex-direction:column;align-items:flex-start;width:fit-content;max-width:100%;margin:2px 0 8px}
.dsd-refpill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border:.5px solid var(--dsd-line2);border-radius:8px;background:var(--dsr-surface);color:var(--dsr-text-2);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.dsd-refpill:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-refpill>svg{color:var(--dsr-text-3)}
.dsd-refpill .sub{color:var(--dsr-text-3)}
.dsd-refbody{margin-top:6px;max-height:260px;overflow:auto;padding:8px 10px;border:.5px solid var(--dsd-line);border-radius:8px;background:var(--dsr-surface);font-size:12px;line-height:1.6;color:var(--dsr-text-2);white-space:pre-wrap;text-align:left}
`

export function ensureStyles(): () => void {
  if (document.querySelector('style[data-plugin-css="' + TAG_ID + '"]')) return () => {}
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-doc-review'
  tag.dataset.pluginCss = TAG_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
  return () => tag.remove()
}
