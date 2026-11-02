/* GHG Town 3D (เมืองคาร์บอน) v1.0 — app: template + logic (generated from src/ui/Main.dc.html by src/tools/build.mjs; do not edit) */
window.__DC_TPL = "\n<helmet>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&amp;family=IBM+Plex+Sans+Thai:wght@400;500;600;700&amp;family=Prompt:wght@400;500;600&amp;display=swap\">\n<style>\n:root{--g-top:78px}\nbody{margin:0;background:#0E1612}\nbutton{font-family:inherit}\nbutton:focus-visible{outline:3px solid #0B7D43;outline-offset:2px}\n.g-dark button:focus-visible{outline-color:#FFB703}\nbutton:disabled{cursor:default}\nkbd{display:inline-block;min-width:18px;padding:1px 6px;border:1px solid rgba(20,32,26,.16);border-radius:6px;background:rgba(20,32,26,.06);color:inherit;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;font-weight:600;line-height:1.5;text-align:center}\n.g-btn kbd{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.32);color:#FFFFFF}\n.g-root{min-height:100vh;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;padding:10px 14px 14px;background:#EEF2F0;color:#14201A;font-family:'IBM Plex Sans Thai','Noto Sans Thai','Leelawadee UI',Thonburi,system-ui,sans-serif}\n.g-h{font-family:'Prompt','IBM Plex Sans Thai',system-ui,sans-serif;font-weight:500;letter-spacing:0}\n.g-mono{font-family:'IBM Plex Mono','IBM Plex Sans Thai',ui-monospace,monospace}\n.g-av{flex:0 0 auto;display:block;border-radius:50%;background-repeat:no-repeat}\n.g-fig{flex:0 0 auto;display:block;background-repeat:no-repeat}\n.g-cl{box-shadow:0 0 0 2px #FFFFFF;margin-left:-9px}\n.g-cl:first-child{margin-left:0}\n.g-panel{box-sizing:border-box;background:#FFFFFF;border:1px solid rgba(20,32,26,.07);border-radius:20px;box-shadow:0 24px 60px rgba(10,22,16,.22),0 2px 8px rgba(10,22,16,.08)}\n.g-glass,.g-float{background:rgba(255,255,255,.84);-webkit-backdrop-filter:blur(16px) saturate(1.6);backdrop-filter:blur(16px) saturate(1.6);border:1px solid rgba(255,255,255,.7);box-shadow:0 8px 26px rgba(10,22,16,.16)}\n.g-dark{-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4)}\n.g-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:10px 20px;border:0;border-radius:14px;background:#0B7D43;color:#FFFFFF;font-size:15px;font-weight:600;cursor:pointer;box-sizing:border-box;box-shadow:0 6px 16px rgba(11,125,67,.26);transition:background .15s,transform .1s}\n.g-btn:hover{background:#096A39}\n.g-btn:active,.g-btn2:active{transform:translateY(1px)}\n.g-btn2{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:10px 18px;border:1px solid rgba(20,32,26,.14);border-radius:14px;background:#FFFFFF;color:#14201A;font-size:15px;font-weight:600;cursor:pointer;box-sizing:border-box;transition:background .15s,transform .1s}\n.g-btn2:hover{background:#F2F5F3}\n.g-link{min-height:44px;padding:4px 10px;border:0;border-radius:10px;background:transparent;color:#4A574F;font-size:13px;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:3px}\n.g-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;line-height:1.5;white-space:nowrap}\n.g-k{font-size:12px;line-height:1.45;color:#55625A}\n.g-seg{display:flex;align-items:center;gap:6px;min-height:36px;padding:4px 11px;border:0;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer}\n.g-wx{display:flex;align-items:center;justify-content:center;gap:5px;min-height:36px;min-width:36px;padding:4px 8px;border:0;border-radius:11px;font-size:12.5px;font-weight:600;cursor:pointer}\n.ghg-scroll{scrollbar-width:thin;overscroll-behavior:contain}\n.g-cols{column-width:340px;column-count:2;column-gap:22px}\n.g-cols>div{break-inside:avoid;margin-bottom:8px}\n.g-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.g-cert{position:relative;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:7px;padding:26px 34px 18px;border:4px double #1E3C2F;border-radius:20px;background:radial-gradient(ellipse at 50% -12%,rgba(66,178,54,.13),rgba(66,178,54,0) 58%),radial-gradient(circle at 0% 100%,rgba(16,192,229,.09),rgba(16,192,229,0) 38%),radial-gradient(circle at 100% 100%,rgba(255,183,3,.13),rgba(255,183,3,0) 38%),#FFFBF1;outline:1px solid rgba(30,60,47,.28);outline-offset:-12px;text-align:center;color:#19261E}\n.g-cert-t{margin:0;font-size:36px;line-height:1.2;font-weight:600;color:#1E3C2F;letter-spacing:0}\n.g-orn{display:flex;align-items:center;gap:6px;width:min(360px,80%)}\n.g-ol{flex:1 1 auto;height:1px;background:linear-gradient(90deg,rgba(30,60,47,0),rgba(30,60,47,.55))}\n.g-or{background:linear-gradient(90deg,rgba(30,60,47,.55),rgba(30,60,47,0))}\n.g-dia{flex:0 0 auto;width:7px;height:7px;border-radius:1.5px;transform:rotate(45deg)}\n.g-seal{flex:0 0 auto;width:86px;height:86px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:conic-gradient(#42B236 0deg 120deg,#10C0E5 120deg 240deg,#FFB703 240deg 360deg);box-shadow:0 3px 10px rgba(25,38,30,.18)}\n.g-seal>span{width:70px;height:70px;box-sizing:border-box;border-radius:50%;border:1.5px dashed rgba(30,60,47,.5);background:#FFFBF1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1E3C2F;line-height:1.1}\n.g-confl{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}\n.g-conf{position:absolute;top:-24px;display:block;opacity:.95}\n.ghg-ret{position:absolute;left:50%;top:50%;width:132px;height:132px;transform:translate(-50%,-50%);pointer-events:none;z-index:3}\n.ghg-found{position:absolute;left:12px;right:12px;top:24%;display:flex;justify-content:center;pointer-events:none;z-index:6}\n.g-spk{position:absolute;display:block;animation:gSpark 1.6s ease-in-out infinite}\n@keyframes ghgIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}\n@keyframes gBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}\n@keyframes gGlow{0%,100%{box-shadow:0 0 0 0 rgba(255,183,3,.55)}70%{box-shadow:0 0 0 12px rgba(255,183,3,0)}}\n@keyframes gSpin{to{transform:rotate(360deg)}}\n@keyframes gConfA{0%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(26px,480px,0) rotate(250deg)}100%{transform:translate3d(-8px,980px,0) rotate(540deg)}}\n@keyframes gConfB{0%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(-24px,480px,0) rotate(-230deg)}100%{transform:translate3d(10px,980px,0) rotate(-510deg)}}\n@keyframes gSpark{0%,100%{transform:scale(.25) rotate(0deg);opacity:0}45%{transform:scale(1) rotate(45deg);opacity:1}}\n@keyframes gPop{0%{transform:scale(.7);opacity:0}65%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:1}}\n@keyframes gWob{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-9deg)}75%{transform:rotate(9deg)}}\n.ghg-anim{animation:ghgIn .32s ease-out}\n.g-pop{animation:gPop .45s cubic-bezier(.2,.9,.3,1.25)}\n.g-wob{animation:gWob 1.8s ease-in-out infinite}\n.g-bob{animation:gBob 3.4s ease-in-out infinite}\n.g-bob2{animation:gBob 3.4s ease-in-out -1.1s infinite}\n.g-bob3{animation:gBob 3.4s ease-in-out -2.2s infinite}\n.g-glow{animation:gGlow 1.7s ease-out infinite}\n.ghg-dlg{position:absolute;left:196px;right:196px;bottom:12px;z-index:3;display:flex;justify-content:center}\n.ghg-dlg[data-card=\"1\"]{right:448px}\n.ghg-map{position:absolute;left:12px;bottom:12px;width:176px;z-index:2}\n.ghg-map>div{border-radius:20px!important;padding:6px!important}\n.ghg-map canvas{border-radius:14px!important}\n.ghg-leg{display:none}\n.ghg-map:hover .ghg-leg{display:flex}\n.ghg-hint{position:absolute;right:12px;top:var(--g-top);width:250px;z-index:7;display:flex;flex-direction:column;gap:5px}\n.ghg-hint>span{display:flex;align-items:center;gap:6px;white-space:nowrap}\n.ghg-stage{height:clamp(460px,calc(100vh - 68px),1100px)}\n.g-root[data-view=\"map\"]{height:100vh;height:100dvh;min-height:480px;padding:0;gap:0}\n.g-root[data-view=\"map\"]>header{display:none!important}\n.g-root[data-view=\"map\"] .ghg-stage{flex:1 1 auto;height:auto;min-height:0;border-radius:0!important;border:0!important}\n.g-root[data-view=\"map\"] footer{display:none}\n.ghg-banner{position:absolute;left:12px;right:12px;top:var(--g-top);display:flex;justify-content:center;pointer-events:none;z-index:4}\n.ghg-card{position:absolute;right:12px;top:var(--g-top);bottom:12px;width:420px;max-width:calc(100% - 24px);z-index:4}\n.ghg-drawer{position:absolute;left:12px;top:var(--g-top);bottom:12px;width:316px;max-width:calc(100% - 24px);z-index:6}\n.ghg-pop{position:absolute;right:0;top:calc(100% + 6px);display:flex;flex-direction:column;gap:2px;min-width:160px;padding:5px;border-radius:14px;z-index:9}\n.ghg-tb{min-height:40px;box-sizing:border-box}\n.ghg-ib{display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:0;border-radius:13px;cursor:pointer}\n.ghg-ml{display:inline}\n.ghg-top{position:absolute;left:12px;right:12px;top:12px;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;pointer-events:none;z-index:5}\n.ghg-top-l,.ghg-top-r{display:flex;align-items:center;gap:8px;pointer-events:auto;min-width:0}\n.ghg-top-r{flex:0 0 auto}\n.ghg-status{display:flex;align-items:center;gap:10px;min-width:0;max-width:min(400px,58vw);min-height:54px;padding:6px 12px 6px 8px;border-radius:18px;color:#14201A;text-align:left;cursor:pointer;font:inherit;box-sizing:border-box}\n.ghg-status:hover{background:rgba(255,255,255,.96)}\n.ghg-status[data-on=\"true\"]{box-shadow:0 0 0 2px #0B7D43,0 8px 26px rgba(10,22,16,.16)}\n.ghg-status-av{flex:0 0 auto;display:flex;align-items:center}\n.ghg-status-tx{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px}\n.ghg-status-tx strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px;line-height:1.25;font-weight:500}\n.ghg-status-row{display:flex;align-items:center;gap:8px;font-size:12px;line-height:1.3;color:#4A574F;white-space:nowrap}\n.ghg-status-row b{color:#0B7D43;font-weight:600}\n.ghg-pbar2{display:block;flex:0 0 auto;width:64px;height:6px;border-radius:999px;background:rgba(20,32,26,.12);overflow:hidden}\n.ghg-pbar2>span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#42B236,#10C0E5 60%,#FFB703)}\n.ghg-status-ic{flex:0 0 auto;color:#55625A}\n.ghg-inside{display:flex;align-items:center;gap:6px;min-height:36px;padding:4px 12px;border-radius:999px;font-size:12.5px;font-weight:600;color:#6B4A00;white-space:nowrap;box-sizing:border-box}\n.ghg-tbtn{display:flex;align-items:center;justify-content:center;gap:8px;min-width:50px;min-height:50px;padding:6px 15px;border-radius:16px;color:#14201A;font-size:14px;font-weight:600;cursor:pointer;box-sizing:border-box}\n.ghg-tbtn:hover{background:rgba(255,255,255,.96)}\n.ghg-tbtn[data-on=\"true\"]{background:#0B7D43;color:#FFFFFF;border-color:#0B7D43}\n.ghg-menu{position:absolute;top:calc(100% + 8px);right:0;width:310px;max-width:calc(100vw - 24px);max-height:min(580px,calc(100vh - 110px));overflow-y:auto;display:flex;flex-direction:column;gap:4px;padding:10px;border-radius:20px;box-sizing:border-box;z-index:9;background:rgba(255,255,255,.95)}\n.ghg-menu-h{padding:6px 8px 2px;font-size:12px;font-weight:600;color:#55625A}\n.ghg-menu-sep{display:block;margin:6px 4px;border-top:1px solid rgba(20,32,26,.10)}\n.ghg-segs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border-radius:14px;background:rgba(20,32,26,.06)}\n.ghg-segs>button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:58px;padding:6px 4px;border:0;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer}\n.ghg-chips{display:flex;flex-wrap:wrap;gap:6px;padding:2px 4px}\n.ghg-chips>button{min-height:40px;padding:6px 13px;border:1px solid rgba(20,32,26,.12);border-radius:999px;font-size:13.5px;font-weight:600;cursor:pointer}\n.ghg-mrow{display:flex;align-items:center;gap:10px;width:100%;min-height:50px;padding:8px 10px;border:0;border-radius:12px;background:transparent;color:#14201A;font-size:14.5px;font-weight:500;text-align:left;cursor:pointer;box-sizing:border-box}\n.ghg-mrow:hover{background:rgba(20,32,26,.06)}\n.ghg-mrow>svg{flex:0 0 auto;color:#3A463F}\n.ghg-sw{flex:0 0 auto;position:relative;width:42px;height:26px;border-radius:999px;background:rgba(20,32,26,.2);transition:background .15s}\n.ghg-sw::after{content:\"\";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .15s}\n.ghg-sw[data-on=\"true\"]{background:#0B7D43}\n.ghg-sw[data-on=\"true\"]::after{transform:translateX(16px)}\n.ghg-qwrap{position:absolute;inset:0;z-index:4;display:flex;justify-content:center;align-items:flex-start;padding:var(--g-top) 16px 16px;box-sizing:border-box;background:linear-gradient(180deg,rgba(10,22,16,.12),rgba(10,22,16,.34));-webkit-backdrop-filter:blur(2.5px);backdrop-filter:blur(2.5px)}\n.ghg-quiz{position:relative;width:min(780px,100%);max-height:100%;display:flex;flex-direction:column;box-sizing:border-box;background:#FFFFFF;border-radius:24px;box-shadow:0 30px 80px rgba(10,22,16,.34),0 2px 10px rgba(10,22,16,.1);overflow:hidden}\n.ghg-quiz-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;padding:20px 22px 20px;box-sizing:border-box}\n.ghg-quiz-head{display:flex;align-items:center;gap:12px}\n.ghg-quiz-badge{flex:0 0 auto;width:46px;height:46px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600}\n.ghg-quiz-ttl{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}\n.ghg-quiz-ttl>span{font-size:12.5px;line-height:1.45;color:#55625A}\n.ghg-quiz-ttl h3{margin:0;font-size:19px;line-height:1.3;font-weight:500;color:#14201A}\n.ghg-quiz-meta{display:flex;flex-wrap:wrap;gap:6px}\n.ghg-quiz-scene{display:flex;gap:10px;align-items:flex-start;padding:11px 13px;border-radius:14px;background:#F3F6F4;color:#3A463F}\n.ghg-quiz-scene p{margin:0;font-size:14px;line-height:1.6;color:#2E3B33}\n.ghg-quiz-q{margin:4px 0 0;font-size:22px;line-height:1.45;font-weight:600;color:#14201A}\n.ghg-quiz-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n.ghg-opt{display:flex;align-items:center;gap:12px;min-height:66px;padding:10px 14px;border:1.5px solid rgba(20,32,26,.14);border-radius:16px;background:#FFFFFF;color:#14201A;text-align:left;font-size:15.5px;font-weight:500;line-height:1.45;cursor:pointer;box-sizing:border-box;transition:transform .12s,box-shadow .15s,border-color .15s,background .15s,opacity .15s}\n.ghg-opt:hover:not(:disabled){border-color:#0B7D43;background:#F5FBF7;box-shadow:0 8px 20px rgba(11,125,67,.15);transform:translateY(-1px)}\n.ghg-opt:active:not(:disabled){transform:translateY(0)}\n.ghg-opt:disabled{cursor:default}\n.ghg-opt-k{flex:0 0 auto;width:36px;height:36px;border-radius:12px;background:#EEF2F0;color:#2E3B33;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600}\n.ghg-opt-t{flex:1 1 auto}\n.ghg-opt[data-st=\"ok\"]{border-color:#15803D;background:#E9F6EE}\n.ghg-opt[data-st=\"ok\"] .ghg-opt-k{background:#15803D;color:#FFFFFF}\n.ghg-opt[data-st=\"bad\"]{border-color:#B42318;background:#FDEDEB}\n.ghg-opt[data-st=\"bad\"] .ghg-opt-k{background:#B42318;color:#FFFFFF}\n.ghg-opt[data-st=\"dim\"]{opacity:.5}\n.ghg-quiz-tip{display:flex;align-items:center;gap:9px;margin:0;font-size:13px;line-height:1.5;color:#4A574F}\n.ghg-quiz-res{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:18px}\n.ghg-quiz-tabs{display:flex;flex-wrap:wrap;gap:6px}\n.ghg-quiz-tabs>button{display:flex;align-items:center;gap:6px;min-height:42px;padding:3px 13px 3px 4px;border:1.5px solid;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer}\n.ghg-quiz-foot{flex:0 0 auto;padding:12px 22px 16px;border-top:1px solid rgba(20,32,26,.08);background:#FFFFFF}\n.ghg-quiz-foot .g-btn{width:100%;min-height:54px;font-size:16px}\n/* v1.0 site-visit film */\n.ghg-film{position:absolute;inset:0;z-index:60;overflow:hidden;pointer-events:none;--fm-bar:min(9vh,88px)}\n.ghg-fm-live{position:absolute;inset:0}\n.ghg-fm-dip{position:absolute;inset:0;background:#000;opacity:0}\n.ghg-fm-vig{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.42) 100%)}\n.ghg-fm-bar{position:absolute;left:0;right:0;height:var(--fm-bar);background:#050807}\n.ghg-fm-top{top:0;animation:gFmTop .7s cubic-bezier(.2,.8,.2,1) both}\n.ghg-fm-bot{bottom:0;animation:gFmBot .7s cubic-bezier(.2,.8,.2,1) both}\n.ghg-film[data-shot=\"4\"] .ghg-fm-top{animation:gFmTopOut .45s ease-in both}\n.ghg-film[data-shot=\"4\"] .ghg-fm-bot{animation:gFmBotOut .45s ease-in both}\n@keyframes gFmTop{from{transform:translateY(-100%)}to{transform:none}}\n@keyframes gFmBot{from{transform:translateY(100%)}to{transform:none}}\n@keyframes gFmTopOut{from{transform:none}to{transform:translateY(-100%)}}\n@keyframes gFmBotOut{from{transform:none}to{transform:translateY(100%)}}\n.ghg-fm-vf{position:absolute;left:3.5%;right:3.5%;top:calc(var(--fm-bar) + 16px);bottom:calc(var(--fm-bar) + 16px)}\n.ghg-fm-vf i{position:absolute;width:28px;height:28px;border:2px solid rgba(255,255,255,.72)}\n.ghg-fm-vf i:nth-child(1){left:0;top:0;border-right:0;border-bottom:0}\n.ghg-fm-vf i:nth-child(2){right:0;top:0;border-left:0;border-bottom:0}\n.ghg-fm-vf i:nth-child(3){left:0;bottom:0;border-right:0;border-top:0}\n.ghg-fm-vf i:nth-child(4){right:0;bottom:0;border-left:0;border-top:0}\n.ghg-fm-vf span{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;opacity:.5;background:linear-gradient(#FFFFFF,#FFFFFF) center/2px 100% no-repeat,linear-gradient(#FFFFFF,#FFFFFF) center/100% 2px no-repeat}\n.ghg-fm-hud,.ghg-fm-hud2{position:absolute;top:calc(var(--fm-bar) + 24px);display:flex;align-items:center;gap:12px;font:600 13px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#FFFFFF;letter-spacing:.04em;text-shadow:0 1px 3px rgba(0,0,0,.75)}\n.ghg-fm-hud{left:calc(3.5% + 40px)}\n.ghg-fm-hud2{right:calc(3.5% + 40px)}\n.ghg-fm-rec{display:flex;align-items:center;gap:6px;color:#FF6B61}\n.ghg-fm-rec b{width:10px;height:10px;border-radius:50%;background:#FF3B30;box-shadow:0 0 8px rgba(255,59,48,.8);animation:gFmBlink 1.1s steps(1,end) infinite}\n@keyframes gFmBlink{50%{opacity:.15}}\n.ghg-fm-cam{padding:4px 8px;border-radius:6px;background:rgba(0,0,0,.35);font-family:\"Prompt\",\"IBM Plex Sans Thai\",sans-serif;letter-spacing:0}\n.ghg-fm-prog{position:absolute;left:0;right:0;top:var(--fm-bar);height:3px;background:rgba(255,255,255,.14)}\n.ghg-fm-prog i{display:block;width:0;height:100%;background:linear-gradient(90deg,#FFB703,#FFD86B)}\n.ghg-fm-flash{position:absolute;inset:0;background:#FFFFFF;opacity:0}\n.ghg-fm-tag{position:absolute;left:0;top:0;opacity:0;transition:opacity .35s;will-change:transform}\n.ghg-fm-ring{position:absolute;left:-23px;top:-23px;width:46px;height:46px;border-radius:50%;border:2px solid #8CFFD0;box-shadow:0 0 14px rgba(140,255,208,.65),inset 0 0 10px rgba(140,255,208,.35)}\n.ghg-fm-ring i{position:absolute;inset:-2px;border-radius:50%;border:2px solid #8CFFD0;animation:gFmPing 1.6s ease-out infinite}\n@keyframes gFmPing{from{transform:scale(1);opacity:.9}to{transform:scale(2.3);opacity:0}}\n.ghg-fm-line{position:absolute;left:20px;top:-20px;width:44px;height:2px;background:#8CFFD0;transform-origin:0 50%;transform:rotate(-40deg);box-shadow:0 0 6px rgba(140,255,208,.8)}\n.ghg-fm-card{position:absolute;left:52px;top:-98px;display:flex;flex-direction:column;gap:4px;width:max-content;max-width:250px;padding:10px 13px;border:1px solid rgba(140,255,208,.6);border-radius:12px;background:rgba(4,22,15,.8);color:#FFFFFF;box-shadow:0 8px 24px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}\n.ghg-fm-tag[data-side=\"l\"] .ghg-fm-line{left:auto;right:20px;transform-origin:100% 50%;transform:rotate(40deg)}\n.ghg-fm-tag[data-side=\"l\"] .ghg-fm-card{left:auto;right:52px}\n.ghg-fm-card small{font-size:11px;font-weight:600;letter-spacing:.06em;color:#8CFFD0}\n.ghg-fm-card strong{font-family:\"Prompt\",\"IBM Plex Sans Thai\",sans-serif;font-size:17px;font-weight:600;line-height:1.25}\n.ghg-fm-gas{display:flex;flex-wrap:wrap;gap:4px}\n.ghg-fm-gas em{padding:2px 8px;border-radius:999px;font-style:normal;font-size:12px;font-weight:700;color:#FFFFFF;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}\n.ghg-fm-ad{font-size:12.5px;color:#DDE7E2}\n.ghg-fm-title{position:absolute;left:calc(3.5% + 6px);bottom:calc(var(--fm-bar) + 28px);display:flex;flex-direction:column;gap:6px;max-width:min(660px,82%);padding:14px 20px 15px 16px;border-left:4px solid #FFB703;border-radius:4px 16px 16px 4px;background:linear-gradient(90deg,rgba(6,14,10,.82),rgba(6,14,10,.45));color:#FFFFFF;animation:gFmSlide .7s cubic-bezier(.2,.8,.2,1) .35s both}\n@keyframes gFmSlide{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}\n.ghg-fm-kick{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#FFE08A}\n.ghg-fm-badge{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:8px;color:#FFFFFF;font-size:13px;font-weight:700;box-shadow:inset 0 0 0 1px rgba(255,255,255,.4)}\n.ghg-fm-title strong{font-size:clamp(21px,2.8vw,32px);line-height:1.2;font-weight:600}\n.ghg-fm-org{font-size:14px;color:#D4DED8}\n.ghg-fm-sub{position:absolute;left:50%;bottom:calc(var(--fm-bar) + 22px);width:min(880px,90%);margin:0;transform:translateX(-50%);text-align:center;animation:gFmFade .5s ease both}\n@keyframes gFmFade{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}\n.ghg-fm-sub span{padding:3px 10px;border-radius:6px;background:rgba(0,0,0,.66);color:#FFFFFF;font-size:clamp(15px,1.6vw,19px);line-height:1.8;-webkit-box-decoration-break:clone;box-decoration-break:clone}\n.ghg-fm-saved{position:absolute;left:50%;top:calc(var(--fm-bar) + 20px);display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.94);color:#14201A;font-size:13.5px;font-weight:600;white-space:nowrap;transform:translateX(-50%);box-shadow:0 6px 20px rgba(0,0,0,.3);animation:gFmDrop .45s cubic-bezier(.2,.8,.2,1) both}\n@keyframes gFmDrop{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}\n.ghg-fm-ctl{position:absolute;right:14px;bottom:max(8px,calc((var(--fm-bar) - 42px) / 2));display:flex;align-items:center;gap:8px;pointer-events:auto}\n.ghg-fm-ctl button{display:flex;align-items:center;gap:8px;min-height:42px;padding:6px 16px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(255,255,255,.12);color:#FFFFFF;font:600 14px/1 \"Prompt\",\"IBM Plex Sans Thai\",sans-serif;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}\n.ghg-fm-ctl button:hover{background:rgba(255,255,255,.22)}\n.ghg-fm-ctl .ghg-fm-ico{width:42px;padding:0;justify-content:center}\n.ghg-fm-ctl kbd{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.16);color:#FFFFFF}\n.g-root[data-film=\"1\"] .ghg-stage>:not(canvas):not(.ghg-film){visibility:hidden!important}\n.ghg-quiz-photo{position:relative;flex:0 0 auto;width:132px;aspect-ratio:16/9;padding:0;border:0;border-radius:10px;overflow:hidden;background:#0E1612;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.18)}\n.ghg-quiz-photo img{display:block;width:100%;height:100%;object-fit:cover}\n.ghg-quiz-photo span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(0,0,0,.45))}\n.ghg-quiz-photo span i,.ghg-filmbtn i{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#FFB703;color:#14201A;font-style:normal;box-shadow:0 2px 8px rgba(0,0,0,.25)}\n.ghg-quiz-scene-t{display:flex;flex-direction:column;gap:8px;min-width:0}\n.ghg-filmbtn{align-self:flex-start;display:flex;align-items:center;gap:8px;min-height:38px;padding:4px 14px 4px 5px;border:0;border-radius:999px;background:#14201A;color:#FFFFFF;font-size:13px;font-weight:600;cursor:pointer}\n.ghg-filmbtn i{width:28px;height:28px;box-shadow:none}\n.ghg-bk-ph{flex:0 0 auto;width:54px;height:31px;border-radius:8px;object-fit:cover;box-shadow:0 0 0 2px var(--bk,#15803D)}\n.ghg-media{position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#0E1612}\n.ghg-media iframe,.ghg-media video{position:absolute;inset:0;width:100%;height:100%;border:0}\n@media (max-width:640px){\n  .ghg-film{--fm-bar:min(7vh,58px)}\n  .ghg-fm-hud,.ghg-fm-hud2{top:calc(var(--fm-bar) + 14px);gap:8px;font-size:11px}\n  .ghg-fm-hud{left:calc(3.5% + 28px)}\n  .ghg-fm-hud2{right:calc(3.5% + 28px)}\n  .ghg-fm-cam{display:none}\n  .ghg-fm-vf{top:calc(var(--fm-bar) + 8px);bottom:calc(var(--fm-bar) + 8px)}\n  .ghg-fm-vf i{width:20px;height:20px}\n  .ghg-fm-title{left:10px;right:10px;max-width:none;bottom:calc(var(--fm-bar) + 14px);padding:11px 14px 12px 12px}\n  .ghg-fm-sub{bottom:calc(var(--fm-bar) + 12px);width:94%}\n  .ghg-fm-sub span{font-size:14.5px;line-height:1.75}\n  .ghg-fm-card{top:-90px;max-width:180px;padding:8px 10px}\n  .ghg-fm-card strong{font-size:15px}\n  .ghg-fm-saved{font-size:12.5px}\n  .ghg-fm-ctl{right:8px}\n  .ghg-fm-ctl button{min-height:38px;padding:5px 12px;font-size:13px}\n  .ghg-quiz-photo{width:104px}\n}\n.ghg-introbg{-webkit-backdrop-filter:blur(7px) saturate(1.2);backdrop-filter:blur(7px) saturate(1.2)}\n.ghg-wl{display:inline}\n.ghg-xs-show{display:none}\n.ghg-joy{position:absolute;left:0;top:0;display:none;width:116px;height:116px;margin:-58px 0 0 -58px;border-radius:50%;box-sizing:border-box;background:rgba(255,253,248,.2);border:2px solid rgba(255,253,248,.75);box-shadow:0 4px 18px rgba(25,38,30,.25);pointer-events:none;z-index:4}\n.ghg-joy>span{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px 0 0 -25px;border-radius:50%;background:rgba(255,253,248,.92);box-shadow:0 2px 8px rgba(25,38,30,.3)}\n.g-cmp{flex:0 0 auto;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#FFB703;color:#19261E;box-shadow:0 0 0 3px rgba(255,183,3,.28)}\n.g-cmp>svg{transition:transform .12s linear}\n.g-name{display:block;box-sizing:border-box;width:min(460px,92%);margin:2px auto 0;padding:2px 8px 4px;border:0;border-bottom:2px dashed rgba(30,60,47,.45);border-radius:0;background:transparent;color:#19261E;font-size:27px;line-height:1.35;text-align:center;outline:none}\n.g-name:focus{border-bottom-color:#2E7A26;background:rgba(66,178,54,.06)}\n.g-name::placeholder{color:#9AA39C;font-size:19px}\n.g-root[data-touch=\"1\"] .ghg-map{left:auto;right:12px;bottom:auto;top:var(--g-top);width:132px}\n.g-root[data-touch=\"1\"] .ghg-kb{display:none}\n.g-root[data-touch=\"0\"] .ghg-tc{display:none}\n@media print{\n  @page{size:A4 landscape;margin:10mm}\n  html,body{height:auto!important;background:#FFFFFF!important}\n  body *{visibility:hidden!important}\n  header,footer{display:none!important}\n  .g-root{height:auto!important;min-height:0!important;padding:0!important;background:#FFFFFF!important}\n  .ghg-stage{height:0!important;min-height:0!important;border:0!important;overflow:visible!important}\n  .g-cert,.g-cert *{visibility:visible!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;animation:none!important}\n  .g-cert{position:fixed!important;left:0;right:0;top:0;margin:0 auto;width:100%;max-width:272mm}\n  .g-name::placeholder{color:transparent}\n  .g-noprint{display:none!important}\n}\n@media (max-width:1100px){\n  .ghg-ml{display:none}\n  .ghg-quiz-opts{grid-template-columns:1fr}\n  .ghg-opt{min-height:56px}\n  .ghg-status{max-width:min(320px,calc(100vw - 150px))}\n  .ghg-dlg{left:12px;right:12px}\n  .ghg-dlg[data-card=\"1\"]{display:none}\n  .ghg-map{left:auto;right:12px;bottom:auto;top:var(--g-top);width:132px}\n  .ghg-banner{right:156px}\n  .ghg-found{top:30%}\n  .ghg-sub{display:none}\n  .ghg-loc{max-width:230px}\n  .g-cert{padding:22px 20px 16px}\n  .g-cert-t{font-size:31px}\n}\n@media (max-width:640px){\n  .ghg-loc{display:none!important}\n  .ghg-banner{right:12px;top:calc(var(--g-top) + 142px)}\n  .ghg-stage{height:clamp(460px,calc(100vh - 124px),900px)}\n  .ghg-pbar{display:none}\n  .ghg-status{padding:6px 10px 6px 6px;gap:8px}\n  .ghg-status-ic{display:none}\n  .ghg-status-av .g-av:nth-child(n+2){display:none}\n  .ghg-pbar2{width:44px}\n  .ghg-xs-hide{display:none!important}\n  .ghg-xs-show{display:flex}\n  .g-name{font-size:22px}\n  .ghg-intro{padding:14px 14px 12px!important;gap:11px!important}\n  .ghg-intro h2{font-size:21px!important}\n  .ghg-team{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important}\n  .ghg-team>div{padding:6px 4px 8px!important}\n  .ghg-team .g-fig{width:64px!important;height:64px!important}\n  .ghg-team strong{font-size:15px!important}\n  .ghg-team .ghg-motto,.ghg-team .g-chip{display:none!important}\n  .ghg-qwrap{padding:calc(var(--g-top) - 4px) 8px 8px}\n  .ghg-quiz{border-radius:20px}\n  .ghg-quiz-scroll{padding:16px 14px 16px;gap:12px}\n  .ghg-quiz-foot{padding:10px 14px 12px}\n  .ghg-quiz-q{font-size:19px}\n}\n@media (prefers-reduced-motion: reduce){.ghg-anim,.g-pop,.g-wob,.g-bob,.g-bob2,.g-bob3,.g-glow,.g-fig{animation:none!important}.g-conf{display:none!important}.g-spk{animation:none!important;opacity:.9}}\n</style>\n</helmet>\n<div class=\"g-root\" data-view=\"{{viewKey}}\" data-touch=\"{{touchKey}}\" data-film=\"{{filmKey}}\">\n\n<header style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; min-height: 42px\">\n  <div style=\"flex: 1 1 auto; display: flex; align-items: center; gap: 10px; min-width: 0\">\n    <span aria-hidden=\"true\" style=\"flex: 0 0 auto; display: flex; align-items: center; padding: 2px 4px 2px 2px\">\n      <sc-for list=\"{{brandPics}}\" as=\"bp\" hint-placeholder-count=\"3\"><span class=\"g-av g-cl\" style=\"width: 32px; height: 32px; background-color: {{bp.bg}}; background-image: {{bp.img}}; background-size: {{bp.size}}; background-position: {{bp.pos}}\"></span></sc-for>\n    </span>\n    <h1 class=\"g-h\" style=\"margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 19px; line-height: 1.25; font-weight: 600; color: #19261E\">GHG Town 3D <span style=\"font-weight: 500; color: #2E7A26\">เมืองคาร์บอน</span></h1>\n    <span class=\"g-chip g-mono\" style=\"padding: 1px 7px; background: #19261E; color: #FFB703; font-size: 11px\">v1.0</span>\n  </div>\n  <nav aria-label=\"เลือกมุมมอง\" style=\"display: flex; gap: 3px; padding: 3px; border-radius: 13px; background: #E6EBE8\">\n    <button type=\"button\" onClick=\"{{goMap}}\" aria-pressed=\"{{isMap}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 34px; padding: 4px 12px; border: 0; border-radius: 10px; background: {{tabMap.bg}}; color: {{tabMap.fg}}; box-shadow: {{tabMap.sh}}; font-size: 13.5px; font-weight: 600; cursor: pointer\">\n      <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z\"></path><path d=\"M4 7.4l8 4.6 8-4.6M12 12v9.2\"></path></svg>\n      เมือง 3D\n    </button>\n    <button type=\"button\" onClick=\"{{goTable}}\" aria-pressed=\"{{isTable}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 34px; padding: 4px 12px; border: 0; border-radius: 10px; background: {{tabTable.bg}}; color: {{tabTable.fg}}; box-shadow: {{tabTable.sh}}; font-size: 13.5px; font-weight: 600; cursor: pointer\">\n      <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2\"></rect><path d=\"M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15\"></path></svg>\n      ตารางสรุป\n    </button>\n  </nav>\n  <div title=\"{{headProg}}\" style=\"position: relative; display: flex; align-items: center; gap: 9px; min-height: 40px; box-sizing: border-box; padding: 4px 12px; border-radius: 13px; background: #FFFFFF; border: 1px solid rgba(25,38,30,.12)\">\n    <span class=\"g-k\" style=\"font-weight: 600\">คะแนน</span>\n    <strong class=\"g-h\" style=\"font-size: 17px; line-height: 1.1; font-weight: 600; color: #0B7D43\">{{score}}/{{total}}</strong>\n    <div class=\"ghg-pbar\" aria-hidden=\"true\" style=\"width: 76px; height: 7px; border-radius: 999px; background: #E4E9E6; overflow: hidden\"><div style=\"width: {{progress}}; height: 7px; border-radius: 999px; background: linear-gradient(90deg, #42B236, #10C0E5 60%, #FFB703)\"></div></div>\n    <span style=\"position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap\">{{headProg}}</span>\n  </div>\n</header>\n\n<section class=\"ghg-stage\" aria-label=\"เมืองจำลอง 3 มิติ\" style=\"position: relative; border-radius: 24px; overflow: hidden; border: 1px solid rgba(25,38,30,.14); background: #CFDFE6; display: {{mapDisplay}}\">\n  <canvas ref=\"{{canvasRef}}\" aria-label=\"เมืองจำลอง 3 มิติ: กด W A S D หรือลูกศรเพื่อเดิน ลากเมาส์เพื่อมองรอบตัว คลิกพื้นเพื่อเดินไปที่นั่น กด H ขอคำใบ้ กด E ตามหาหรือคุยกับทีม\" style=\"display: block; width: 100%; height: 100%; touch-action: none\"></canvas>\n  <div class=\"ghg-joy\" ref=\"{{joyRef}}\" aria-hidden=\"true\"><span></span></div>\n\n  <!-- v1.0 site-visit film: the engine moves the camera and writes into .ghg-fm-live (kept element) -->\n  <sc-if value=\"{{film.on}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-film\" data-shot=\"{{film.shot}}\" role=\"region\" aria-label=\"วิดีโอสำรวจหน้างาน\">\n      <div class=\"ghg-fm-live\" ref=\"{{filmRef}}\">\n        <div class=\"ghg-fm-dip\"></div>\n        <div class=\"ghg-fm-vig\"></div>\n        <div class=\"ghg-fm-vf\" aria-hidden=\"true\"><i></i><i></i><i></i><i></i><span></span></div>\n        <div class=\"ghg-fm-tag\" aria-hidden=\"true\">\n          <span class=\"ghg-fm-ring\"><i></i></span>\n          <span class=\"ghg-fm-line\"></span>\n          <span class=\"ghg-fm-card\">\n            <small>แหล่งปล่อยที่พบ</small>\n            <strong>{{film.short}}</strong>\n            <span class=\"ghg-fm-gas\"><sc-for list=\"{{film.gases}}\" as=\"fg\" hint-placeholder-count=\"2\"><em style=\"background: {{fg.bg}}\">{{fg.t}}</em></sc-for></span>\n            <sc-if value=\"{{film.hasAd}}\" hint-placeholder-val=\"{{ false }}\"><span class=\"ghg-fm-ad\">{{film.ad}}</span></sc-if>\n          </span>\n        </div>\n        <div class=\"ghg-fm-hud\" aria-hidden=\"true\"><span class=\"ghg-fm-rec\"><b></b>REC</span><span class=\"ghg-fm-tc\">00:00:00:00</span><span class=\"ghg-fm-cam\">DRONE · มุมสูง</span></div>\n        <div class=\"ghg-fm-hud2\" aria-hidden=\"true\"><span>ALT <span class=\"ghg-fm-alt\">–</span> m</span><span>ระยะ <span class=\"ghg-fm-dist\">–</span> m</span></div>\n        <div class=\"ghg-fm-prog\" aria-hidden=\"true\"><i></i></div>\n        <div class=\"ghg-fm-flash\"></div>\n      </div>\n      <div class=\"ghg-fm-bar ghg-fm-top\"></div>\n      <div class=\"ghg-fm-bar ghg-fm-bot\"></div>\n      <sc-if value=\"{{film.isTitle}}\" hint-placeholder-val=\"{{ true }}\">\n        <div class=\"ghg-fm-title\">\n          <span class=\"ghg-fm-kick\"><span class=\"ghg-fm-badge\" style=\"background: {{film.color}}\">{{film.n}}</span>วิดีโอสำรวจหน้างาน · จุดที่ {{film.n}} จาก {{film.total}}</span>\n          <strong class=\"g-h\">{{film.place}}</strong>\n          <span class=\"ghg-fm-org\">{{film.org}}</span>\n        </div>\n      </sc-if>\n      <sc-if value=\"{{film.hasSub}}\" hint-placeholder-val=\"{{ false }}\">\n        <p class=\"ghg-fm-sub\" aria-live=\"polite\"><span>{{film.sub}}</span></p>\n      </sc-if>\n      <sc-if value=\"{{film.saved}}\" hint-placeholder-val=\"{{ false }}\">\n        <div class=\"ghg-fm-saved\" role=\"status\"><svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z\"></path><circle cx=\"12\" cy=\"13\" r=\"3.2\"></circle></svg>บันทึกภาพหลักฐานลงสมุดปริศนาแล้ว</div>\n      </sc-if>\n      <div class=\"ghg-fm-ctl\">\n        <sc-if value=\"{{ttsOk}}\" hint-placeholder-val=\"{{ true }}\">\n          <button type=\"button\" class=\"ghg-fm-ico\" onClick=\"{{filmNarr}}\" aria-pressed=\"{{film.narr}}\" title=\"เปิด/ปิดเสียงบรรยาย\">\n            <sc-if value=\"{{film.narr}}\" hint-placeholder-val=\"{{ true }}\"><svg width=\"19\" height=\"19\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 9.5h3.5L12 5.5v13l-4.5-4H4z\"></path><path d=\"M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11\"></path></svg></sc-if>\n            <sc-if value=\"{{film.narrOff}}\" hint-placeholder-val=\"{{ false }}\"><svg width=\"19\" height=\"19\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 9.5h3.5L12 5.5v13l-4.5-4H4z\"></path><path d=\"M16 9.5l5 5M21 9.5l-5 5\"></path></svg></sc-if>\n          </button>\n        </sc-if>\n        <button type=\"button\" onClick=\"{{filmSkip}}\">ข้ามวิดีโอ <kbd class=\"ghg-kb\">Space</kbd></button>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{webglBad}}\" hint-placeholder-val=\"{{ false }}\">\n    <div style=\"position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; background: linear-gradient(180deg, #E8F0EC 0%, #EEF2F0 100%); text-align: center\">\n      <span class=\"g-fig\" aria-hidden=\"true\" style=\"width: 120px; height: 120px; background-image: {{sadFig.img}}; background-size: {{sadFig.size}}; background-position: {{sadFig.pos}}\"></span>\n      <strong class=\"g-h\" style=\"font-size: 20px\">เบราว์เซอร์นี้แสดงเมือง 3 มิติไม่ได้</strong>\n      <p style=\"margin: 0; max-width: 460px; font-size: 14px; line-height: 1.6; color: #2E3B33\">ทีมมาสคอตยังพาเรียนได้ครบทุกจุด เปิดรายการจุดเรียนรู้เพื่ออ่านบทนำและตอบคำถาม หรือดูตารางสรุป</p>\n      <button type=\"button\" class=\"g-btn\" onClick=\"{{openDrawer}}\">เปิดรายการจุดเรียนรู้</button>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{loading}}\" hint-placeholder-val=\"{{ false }}\">\n    <div style=\"position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(180deg, #E6F0EE 0%, #EEF2F0 100%); color: #0B7D43; z-index: 8\">\n      <div aria-hidden=\"true\" style=\"display: flex; align-items: flex-end; gap: 6px\">\n        <sc-for list=\"{{loadFigs}}\" as=\"lf\" hint-placeholder-count=\"3\"><span class=\"g-fig\" style=\"width: 96px; height: 96px; animation: {{lf.anim}}; background-image: {{lf.img}}; background-size: {{lf.size}}; background-position: {{lf.pos}}\"></span></sc-for>\n      </div>\n      <strong class=\"g-h\" style=\"font-size: 20px\">กำลังสร้างเมืองคาร์บอน…</strong>\n      <span style=\"display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #4A574F\"><span style=\"width: 16px; height: 16px; box-sizing: border-box; border-radius: 50%; border: 3px solid #D7E2C8; border-top-color: #42B236; animation: gSpin 1s linear infinite\"></span>ทีมมาสคอตกำลังซ่อนปริศนา {{total}} จุดไว้ทั่วเมือง</span>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{noContent}}\" hint-placeholder-val=\"{{ false }}\">\n    <div style=\"position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(25,38,30,.35); z-index: 12\">\n      <div role=\"alert\" class=\"g-panel\" style=\"width: min(460px, 100%); display: flex; flex-direction: column; gap: 10px; padding: 22px\">\n        <strong class=\"g-h\" style=\"font-size: 20px\">โหลดเนื้อหาบทเรียนไม่สำเร็จ</strong>\n        <p style=\"margin: 0; font-size: 14px; line-height: 1.6; color: #2E3B33\">ไม่พบไฟล์เนื้อหาของเมืองคาร์บอน ลองรีเฟรชหน้านี้อีกครั้ง ถ้ายังไม่ขึ้น แจ้งผู้ดูแลให้ตรวจไฟล์เนื้อหา (content.js)</p>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showTop}}\" hint-placeholder-val=\"{{ true }}\">\n    <div class=\"ghg-top\">\n      <div class=\"ghg-top-l\">\n        <button type=\"button\" class=\"g-glass ghg-status\" onClick=\"{{toggleDrawer}}\" aria-expanded=\"{{drawerOn}}\" title=\"{{drawerTip}}\" data-on=\"{{drawerOn}}\">\n          <span class=\"ghg-status-av\" aria-hidden=\"true\">\n            <sc-for list=\"{{brandPics}}\" as=\"bp\" hint-placeholder-count=\"3\"><span class=\"g-av g-cl\" style=\"width: 30px; height: 30px; background-color: {{bp.bg}}; background-image: {{bp.img}}; background-size: {{bp.size}}; background-position: {{bp.pos}}\"></span></sc-for>\n          </span>\n          <span class=\"ghg-status-tx\">\n            <strong class=\"g-h\">{{loc.name}}</strong>\n            <span class=\"ghg-status-row\"><span class=\"ghg-pbar2\" aria-hidden=\"true\"><span style=\"width: {{progress}}\"></span></span><span>{{drawerLbl}} <b class=\"g-mono\">{{doneOf}}</b></span></span>\n          </span>\n          <svg class=\"ghg-status-ic\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4.5 5.5A2 2 0 0 1 6.5 3.5H19v15H6.5a2 2 0 0 0-2 2z\"></path><path d=\"M4.5 20.5v-15\"></path></svg>\n        </button>\n        <sc-if value=\"{{loc.hasInside}}\" hint-placeholder-val=\"{{ false }}\">\n          <span class=\"g-glass ghg-inside\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 20.5V9l8-5 8 5v11.5\"></path><path d=\"M9.5 20.5v-6h5v6\"></path></svg>{{loc.inside}}</span>\n        </sc-if>\n      </div>\n      <div class=\"ghg-top-r\">\n        <sc-if value=\"{{showHop}}\" hint-placeholder-val=\"{{ true }}\">\n          <div style=\"position: relative\">\n            <button type=\"button\" class=\"g-glass ghg-tbtn\" onClick=\"{{toggleHop}}\" aria-expanded=\"{{hopOpen}}\" aria-haspopup=\"menu\" title=\"เดินทางด่วน · น้องส่องพาบินโดรนไปย่านอื่น\" data-on=\"{{hopOpen}}\">\n              <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"9\" y=\"10\" width=\"6\" height=\"4.5\" rx=\"1.5\"></rect><path d=\"M9 11 5.5 8.5M15 11l3.5-2.5M9 13.5 5.5 16M15 13.5l3.5 2.5\"></path><path d=\"M3 8.5h5M16 8.5h5M3 16h5M16 16h5\"></path></svg>\n              <span class=\"ghg-ml\">เดินทางด่วน</span>\n            </button>\n            <sc-if value=\"{{hopOpen}}\" hint-placeholder-val=\"{{ false }}\">\n              <div role=\"menu\" aria-label=\"เดินทางด่วน\" class=\"g-glass ghg-menu ghg-anim ghg-scroll\">\n                <span class=\"ghg-menu-h\">เดินทางด่วน · น้องส่องพาบินไปลงใกล้ปริศนาที่ยังไม่ไข</span>\n                <sc-for list=\"{{hops}}\" as=\"hp\" hint-placeholder-count=\"9\">\n                  <button type=\"button\" role=\"menuitem\" class=\"ghg-mrow\" onClick=\"{{hp.go}}\" style=\"background: {{hp.bg}}\">\n                    <span style=\"flex: 0 0 auto; width: 10px; height: 10px; border-radius: 50%; background: {{hp.dot}}; box-shadow: 0 0 0 3px {{hp.ring}}\"></span>\n                    <span style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0\">\n                      <strong style=\"font-size: 14px; line-height: 1.35; font-weight: 600\">{{hp.name}}</strong>\n                      <span style=\"font-size: 12px; line-height: 1.4; color: {{hp.subFg}}\">{{hp.prog}}</span>\n                    </span>\n                  </button>\n                </sc-for>\n              </div>\n            </sc-if>\n          </div>\n        </sc-if>\n        <div style=\"position: relative\">\n          <button type=\"button\" class=\"g-glass ghg-tbtn\" onClick=\"{{toggleMore}}\" aria-expanded=\"{{moreOpen}}\" aria-haspopup=\"menu\" title=\"เมนู · โหมด เวลา เสียง ตารางสรุป วิธีเล่น\" data-on=\"{{moreOpen}}\">\n            <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 7h16M4 12h16M4 17h16\"></path></svg>\n            <span class=\"ghg-ml\">เมนู</span>\n          </button>\n          <sc-if value=\"{{moreOpen}}\" hint-placeholder-val=\"{{ false }}\">\n            <div role=\"menu\" aria-label=\"เมนู\" class=\"g-glass ghg-menu ghg-anim ghg-scroll\" style=\"right: 0\">\n              <span class=\"ghg-menu-h\">โหมดการเล่น</span>\n              <div class=\"ghg-segs\">\n                <button type=\"button\" onClick=\"{{setExplore}}\" aria-pressed=\"{{mExplore.on}}\" style=\"background: {{mExplore.bg}}; color: {{mExplore.fg}}\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M15.5 8.5l-2 5-5 2 2-5z\"></path></svg>สำรวจเอง</button>\n                <button type=\"button\" onClick=\"{{setTour}}\" aria-pressed=\"{{mTour.on}}\" style=\"background: {{mTour.bg}}; color: {{mTour.fg}}\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"8.5\" cy=\"6\" r=\"2.3\"></circle><path d=\"M4.5 20v-4.5a4 4 0 0 1 8 0V20\"></path><circle cx=\"16.5\" cy=\"7.5\" r=\"2\"></circle><path d=\"M13.8 20v-3.6a2.7 2.7 0 0 1 5.4 0V20\"></path></svg>ทัวร์</button>\n                <button type=\"button\" onClick=\"{{toggleOver}}\" aria-pressed=\"{{mOver.on}}\" style=\"background: {{mOver.bg}}; color: {{mOver.fg}}\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2z\"></path><path d=\"M9 4.5v13M15 6.5v13\"></path></svg>มุมสูง</button>\n              </div>\n              <span class=\"ghg-menu-h\">ช่วงเวลาและอากาศ</span>\n              <div class=\"ghg-chips\">\n                <button type=\"button\" role=\"menuitemradio\" aria-checked=\"{{wDay.on}}\" onClick=\"{{setDay}}\" style=\"background: {{wDay.bg}}; color: {{wDay.fg}}\">กลางวัน</button>\n                <button type=\"button\" role=\"menuitemradio\" aria-checked=\"{{wEvening.on}}\" onClick=\"{{setEvening}}\" style=\"background: {{wEvening.bg}}; color: {{wEvening.fg}}\">ตอนเย็น</button>\n                <button type=\"button\" role=\"menuitemradio\" aria-checked=\"{{wNight.on}}\" onClick=\"{{setNight}}\" style=\"background: {{wNight.bg}}; color: {{wNight.fg}}\">กลางคืน</button>\n                <button type=\"button\" role=\"menuitemradio\" aria-checked=\"{{wRain.on}}\" onClick=\"{{setRain}}\" style=\"background: {{wRain.bg}}; color: {{wRain.fg}}\">ฝนตก</button>\n                <button type=\"button\" role=\"menuitemradio\" aria-checked=\"{{wAuto.on}}\" onClick=\"{{setAuto}}\" style=\"background: {{wAuto.bg}}; color: {{wAuto.fg}}\">ตามเวลาจริง</button>\n              </div>\n              <span class=\"ghg-menu-sep\"></span>\n              <button type=\"button\" role=\"menuitemcheckbox\" aria-checked=\"{{soundOn}}\" class=\"ghg-mrow\" onClick=\"{{toggleSound}}\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 9.5h3.5L12 5.5v13l-4.5-4H4z\"></path><path d=\"M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11\"></path></svg><span style=\"flex: 1 1 auto\">เสียงประกอบ</span><span class=\"ghg-sw\" data-on=\"{{soundOn}}\"></span></button>\n              <button type=\"button\" role=\"menuitemcheckbox\" aria-checked=\"{{labelsOn}}\" class=\"ghg-mrow\" onClick=\"{{toggleLabels}}\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"2.8\"></circle></svg><span style=\"flex: 1 1 auto\">ป้ายชื่อจุดในเมือง</span><span class=\"ghg-sw\" data-on=\"{{labelsOn}}\"></span></button>\n              <button type=\"button\" role=\"menuitemcheckbox\" aria-checked=\"{{filmAutoOn}}\" class=\"ghg-mrow\" onClick=\"{{toggleFilmAuto}}\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"2.5\" y=\"6\" width=\"13\" height=\"12\" rx=\"2.5\"></rect><path d=\"M15.5 10.5l6-3.5v10l-6-3.5z\"></path></svg><span style=\"flex: 1 1 auto\">วิดีโอสำรวจเมื่อเจอแหล่งปล่อย</span><span class=\"ghg-sw\" data-on=\"{{filmAutoOn}}\"></span></button>\n              <sc-if value=\"{{ttsOk}}\" hint-placeholder-val=\"{{ true }}\">\n                <button type=\"button\" role=\"menuitemcheckbox\" aria-checked=\"{{narrSw}}\" class=\"ghg-mrow\" onClick=\"{{toggleNarr}}\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 5.5h16v10.5H9.5L4 20z\"></path><path d=\"M8 9.5h8M8 12.5h5\"></path></svg><span style=\"flex: 1 1 auto\">เสียงบรรยายภาษาไทย</span><span class=\"ghg-sw\" data-on=\"{{narrSw}}\"></span></button>\n              </sc-if>\n              <button type=\"button\" role=\"menuitem\" class=\"ghg-mrow\" onClick=\"{{goTableM}}\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2\"></rect><path d=\"M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15\"></path></svg><span style=\"flex: 1 1 auto\">ตารางสรุปผล 19 จุด</span></button>\n              <button type=\"button\" role=\"menuitem\" class=\"ghg-mrow\" onClick=\"{{toggleHelp}}\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5M12 16.6v.2\"></path></svg><span style=\"flex: 1 1 auto\">วิธีเล่น · ปุ่มลัด</span></button>\n            </div>\n          </sc-if>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showGateWait}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-banner\">\n      <div class=\"ghg-anim g-dark\" role=\"status\" style=\"display: flex; align-items: center; gap: 10px; padding: 8px 16px 8px 8px; border-radius: 16px; background: rgba(14,24,19,.80); color: #FFFFFF; font-size: 14px; font-weight: 600\">\n        <span aria-hidden=\"true\" style=\"display: flex; align-items: center\">\n          <sc-for list=\"{{brandPics}}\" as=\"gp\" hint-placeholder-count=\"3\"><span class=\"g-av g-cl\" style=\"width: 32px; height: 32px; box-shadow: 0 0 0 2px #19261E; background-color: {{gp.bg}}; background-image: {{gp.img}}; background-size: {{gp.size}}; background-position: {{gp.pos}}\"></span></sc-for>\n        </span>\n        {{gateText}}\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showGateChoice}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-banner\">\n      <div class=\"ghg-anim g-panel\" role=\"group\" aria-label=\"เลือกวิธีเริ่มสำรวจ\" style=\"pointer-events: auto; width: min(620px, 100%); display: flex; flex-direction: column; gap: 11px; padding: 14px 16px; border-radius: 20px; box-shadow: 0 12px 34px rgba(25,38,30,.28)\">\n        <div style=\"display: flex; align-items: center; gap: 11px\">\n          <span aria-hidden=\"true\" style=\"flex: 0 0 auto; display: flex; align-items: center\">\n            <sc-for list=\"{{gatePics}}\" as=\"gc\" hint-placeholder-count=\"3\"><span class=\"g-av g-cl\" style=\"width: 40px; height: 40px; box-shadow: 0 0 0 2.5px #FFFFFF; background-color: {{gc.bg}}; background-image: {{gc.img}}; background-size: {{gc.size}}; background-position: {{gc.pos}}\"></span></sc-for>\n          </span>\n          <div style=\"display: flex; flex-direction: column; gap: 1px; min-width: 0\">\n            <strong class=\"g-h\" style=\"font-size: 17px; line-height: 1.3; font-weight: 600\">ประตูเมืองคาร์บอน · พร้อมออกสำรวจ</strong>\n            <span style=\"font-size: 12.5px; line-height: 1.45; color: #4A574F\">มีปริศนาซ่อนอยู่ {{total}} จุดทั่วเมือง · ทบทวนพื้นฐานก่อนจะไขปริศนาได้ง่ายขึ้น</span>\n          </div>\n        </div>\n        <div style=\"display: flex; flex-wrap: wrap; gap: 8px\">\n          <button type=\"button\" class=\"g-btn\" onClick=\"{{gateLessons}}\" style=\"flex: 1 1 250px\">\n            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z\"></path><path d=\"M12 6.5v13\"></path></svg>\n            ทบทวนบทนำ {{lessonCount}} บทก่อน (แนะนำ)\n          </button>\n          <button type=\"button\" class=\"g-btn2\" onClick=\"{{gateGo}}\" style=\"flex: 1 1 170px\">\n            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"13\" cy=\"4.5\" r=\"1.8\"></circle><path d=\"M11 21l2-6-2.5-2.5 1-4.5 3 3 3 1\"></path><path d=\"M10.5 8.5 7 10.5 6 14M13 15l3 6\"></path></svg>\n            เข้าเมืองเลย\n          </button>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showFinaleWait}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-banner\">\n      <div class=\"ghg-anim g-dark\" role=\"status\" style=\"display: flex; align-items: center; gap: 10px; padding: 8px 16px 8px 8px; border-radius: 16px; background: rgba(14,24,19,.80); color: #FFFFFF; font-size: 14px; font-weight: 600\">\n        <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 34px; height: 34px; background-color: {{finFig.bg}}; background-image: {{finFig.img}}; background-size: {{finFig.size}}; background-position: {{finFig.pos}}\"></span>\n        น้องส่องพาบินขึ้นชมวิวทั้งเมือง…\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showTravel}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-banner\">\n      <div class=\"ghg-anim g-dark\" role=\"status\" style=\"width: min(580px, 100%); box-sizing: border-box; display: flex; flex-direction: column; gap: 9px; padding: 11px 13px; border-radius: 18px; background: rgba(14,24,19,.80); color: #FFFFFF; box-shadow: 0 10px 30px rgba(0,0,0,.25); pointer-events: auto\">\n        <div style=\"display: flex; align-items: center; gap: 10px\">\n          <span class=\"g-av g-glow\" aria-hidden=\"true\" style=\"width: 44px; height: 44px; background-color: {{travel.pic.bg}}; background-image: {{travel.pic.img}}; background-size: {{travel.pic.size}}; background-position: {{travel.pic.pos}}\"></span>\n          <div style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px\">\n            <span style=\"font-size: 12px; color: #CDE8C4\">{{travel.mode}}</span>\n            <strong class=\"g-h\" style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: 16px; line-height: 1.35\"><span class=\"g-chip g-mono\" style=\"padding: 1px 8px; background: {{travel.color}}; color: {{travel.badgeFg}}; font-size: 12.5px\">จุดที่ {{travel.n}}</span>{{travel.short}}</strong>\n            <span style=\"font-size: 12.5px; line-height: 1.4; color: #DCE9E0\">{{travel.place}}</span>\n          </div>\n          <sc-if value=\"{{travel.hasDist}}\" hint-placeholder-val=\"{{ true }}\"><span class=\"g-mono\" style=\"flex: 0 0 auto; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.14); font-size: 12.5px; font-weight: 600; white-space: nowrap\">{{travel.dist}}</span></sc-if>\n        </div>\n        <div style=\"display: flex; align-items: flex-start; gap: 9px; padding: 8px 10px; border-radius: 12px; background: rgba(255,255,255,.08)\">\n          <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 28px; height: 28px; background-color: {{travel.tipPic.bg}}; background-image: {{travel.tipPic.img}}; background-size: {{travel.tipPic.size}}; background-position: {{travel.tipPic.pos}}\"></span>\n          <p style=\"margin: 0; font-size: 13px; line-height: 1.55; color: #EEF4EE\"><strong style=\"color: #FFB703\">{{travel.tipName}} · รู้หรือไม่ </strong>{{travel.tip}}</p>\n        </div>\n        <div style=\"display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px\">\n          <button type=\"button\" onClick=\"{{toggleFast}}\" aria-pressed=\"{{fastOn}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 40px; padding: 4px 12px; border: 1px solid rgba(255,255,255,.35); border-radius: 11px; background: {{fastBtn.bg}}; color: {{fastBtn.fg}}; font-size: 13px; font-weight: 600; cursor: pointer\">\n            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 6.5v11l7.5-5.5zM12.5 6.5v11L20 12z\"></path></svg>\n            เร่ง ×3\n          </button>\n          <button type=\"button\" onClick=\"{{skip}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 40px; padding: 4px 12px; border: 0; border-radius: 11px; background: #FFB703; color: #19261E; font-size: 13px; font-weight: 600; cursor: pointer\">\n            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6 5.5v13l9-6.5zM18 5.5v13\"></path></svg>\n            ข้ามไปถึงเลย\n          </button>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showSeek}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-banner\">\n      <div class=\"ghg-anim g-dark\" role=\"status\" style=\"pointer-events: auto; width: min(600px, 100%); box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; border-radius: 18px; background: rgba(14,24,19,.80); color: #FFFFFF; box-shadow: 0 10px 30px rgba(0,0,0,.25)\">\n        <div style=\"display: flex; align-items: center; gap: 10px\">\n          <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 42px; height: 42px; background-color: {{seek.pic.bg}}; background-image: {{seek.pic.img}}; background-size: {{seek.pic.size}}; background-position: {{seek.pic.pos}}\"></span>\n          <div style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px\">\n            <span style=\"font-size: 12px; font-weight: 600; color: #FFD66B\">{{seek.how}}</span>\n            <strong class=\"g-h\" style=\"font-size: 16px; line-height: 1.35; font-weight: 500\">{{seek.text}}</strong>\n            <span style=\"font-size: 12px; line-height: 1.4; color: #DCE9E0\">{{seek.area}}</span>\n          </div>\n          <sc-if value=\"{{seek.cmp}}\" hint-placeholder-val=\"{{ false }}\">\n            <span style=\"flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 2px\">\n              <span class=\"g-cmp\" style=\"width: 38px; height: 38px\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\" style=\"transform: {{cmp.rot}}\"><path d=\"M12 2.5l6.5 16-6.5-3.6-6.5 3.6z\"></path></svg></span>\n              <span class=\"g-mono\" style=\"font-size: 11px; font-weight: 600; color: #FFE7A6; white-space: nowrap\">{{cmp.dist}}</span>\n            </span>\n          </sc-if>\n          <span class=\"g-mono\" style=\"flex: 0 0 auto; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.14); font-size: 12.5px; font-weight: 600; white-space: nowrap\">{{seek.pct}}</span>\n        </div>\n        <sc-if value=\"{{seek.hasClue}}\" hint-placeholder-val=\"{{ false }}\">\n          <p style=\"margin: 0; padding: 7px 10px; border-radius: 11px; background: rgba(255,183,3,.16); font-size: 12.5px; line-height: 1.55; color: #FFF3D1\"><strong style=\"color: #FFB703\">คำใบ้: </strong>{{seek.clue}}</p>\n        </sc-if>\n        <div style=\"display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px\">\n          <sc-if value=\"{{seek.canHint}}\" hint-placeholder-val=\"{{ true }}\">\n            <button type=\"button\" onClick=\"{{seekHint}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 38px; padding: 4px 12px; border: 0; border-radius: 11px; background: #FFB703; color: #19261E; font-size: 13px; font-weight: 600; cursor: pointer\">ขอคำใบ้ <kbd class=\"ghg-kb\">H</kbd></button>\n          </sc-if>\n          <button type=\"button\" onClick=\"{{seekStop}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 38px; padding: 4px 12px; border: 1px solid rgba(255,255,255,.35); border-radius: 11px; background: transparent; color: #FFFFFF; font-size: 13px; font-weight: 600; cursor: pointer\">ยกเลิก</button>\n        </div>\n      </div>\n    </div>\n    <div class=\"ghg-ret\" aria-hidden=\"true\">\n      <svg width=\"132\" height=\"132\" viewBox=\"0 0 132 132\" fill=\"none\" focusable=\"false\">\n        <circle cx=\"66\" cy=\"66\" r=\"56\" stroke=\"rgba(25,38,30,.30)\" stroke-width=\"10\"></circle>\n        <circle cx=\"66\" cy=\"66\" r=\"56\" stroke=\"rgba(255,255,255,.7)\" stroke-width=\"2.5\"></circle>\n        <circle cx=\"66\" cy=\"66\" r=\"56\" stroke=\"#FFB703\" stroke-width=\"7\" stroke-dasharray=\"351.86\" transform=\"rotate(-90 66 66)\" style=\"stroke-dashoffset: {{seek.off}}\"></circle>\n        <path d=\"M66 22v20M66 90v20M22 66h20M90 66h20\" stroke=\"rgba(25,38,30,.55)\" stroke-width=\"5\" stroke-linecap=\"round\"></path>\n        <path d=\"M66 22v20M66 90v20M22 66h20M90 66h20\" stroke=\"#FFFFFF\" stroke-width=\"2.5\" stroke-linecap=\"round\"></path>\n        <circle cx=\"66\" cy=\"66\" r=\"3.5\" fill=\"#FFFFFF\" stroke=\"rgba(25,38,30,.6)\" stroke-width=\"1.5\"></circle>\n      </svg>\n      <span class=\"g-chip\" style=\"position: absolute; left: 50%; top: 138px; transform: translateX(-50%); background: rgba(25,38,30,.82); color: #FFFFFF\">{{seek.label}}</span>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showHintB}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-banner\">\n      <div class=\"ghg-anim g-dark\" role=\"status\" style=\"pointer-events: auto; width: min(560px, 100%); box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; padding: 10px 12px; border-radius: 18px; background: rgba(14,24,19,.80); color: #FFFFFF; box-shadow: 0 10px 30px rgba(0,0,0,.25)\">\n        <div style=\"display: flex; align-items: center; gap: 10px\">\n          <sc-if value=\"{{cmp.on}}\" hint-placeholder-val=\"{{ true }}\">\n            <span class=\"g-cmp\" role=\"img\" aria-label=\"{{cmp.say}}\" style=\"width: 46px; height: 46px\"><svg width=\"26\" height=\"26\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\" style=\"transform: {{cmp.rot}}\"><path d=\"M12 2.5l6.5 16-6.5-3.6-6.5 3.6z\"></path></svg></span>\n          </sc-if>\n          <sc-if value=\"{{cmp.off}}\" hint-placeholder-val=\"{{ false }}\">\n            <span class=\"g-av g-glow\" aria-hidden=\"true\" style=\"width: 44px; height: 44px; background-color: {{hintB.pic.bg}}; background-image: {{hintB.pic.img}}; background-size: {{hintB.pic.size}}; background-position: {{hintB.pic.pos}}\"></span>\n          </sc-if>\n          <div style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px\">\n            <strong class=\"g-h\" style=\"font-size: 15.5px; line-height: 1.35; font-weight: 500\">น้องส่องบินนำไปแล้ว — ตามแสงไปเลย!</strong>\n            <span style=\"font-size: 12.5px; line-height: 1.4; color: #DCE9E0\">ไปที่: {{hintB.area}}<sc-if value=\"{{cmp.on}}\" hint-placeholder-val=\"{{ true }}\"><strong style=\"color: #FFD66B\"> · {{cmp.say}} · {{cmp.dist}}</strong></sc-if></span>\n          </div>\n        </div>\n        <div style=\"display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px\">\n          <sc-if value=\"{{hintB.far}}\" hint-placeholder-val=\"{{ true }}\">\n            <button type=\"button\" onClick=\"{{hopNear}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 38px; padding: 4px 12px; border: 0; border-radius: 11px; background: #FFB703; color: #19261E; font-size: 13px; font-weight: 600; cursor: pointer\">\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"9\" y=\"10\" width=\"6\" height=\"4.5\" rx=\"1.5\"></rect><path d=\"M9 11 5.5 8.5M15 11l3.5-2.5M9 13.5 5.5 16M15 13.5l3.5 2.5\"></path><path d=\"M3 8.5h5M16 8.5h5M3 16h5M16 16h5\"></path></svg>\n              บินตามไปเลย\n            </button>\n          </sc-if>\n          <button type=\"button\" onClick=\"{{hintOff}}\" style=\"flex: 0 0 auto; display: flex; align-items: center; min-height: 38px; padding: 4px 12px; border: 1px solid rgba(255,255,255,.35); border-radius: 11px; background: transparent; color: #FFFFFF; font-size: 13px; font-weight: 600; cursor: pointer\">ยกเลิกคำใบ้</button>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showFound}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-found\">\n      <div class=\"g-pop g-panel\" role=\"status\" style=\"position: relative; pointer-events: auto; display: flex; align-items: center; gap: 12px; max-width: 100%; padding: 12px 20px 12px 10px; border: 1.5px solid #F2D58E; border-radius: 24px; background: #FFFFFF; box-shadow: 0 16px 44px rgba(25,38,30,.34)\">\n        <span class=\"g-spk\" aria-hidden=\"true\" style=\"left: -9px; top: -11px; width: 22px; height: 22px; color: #FFB703\"><svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"currentColor\" focusable=\"false\"><path d=\"M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z\"></path></svg></span>\n        <span class=\"g-spk\" aria-hidden=\"true\" style=\"left: 34%; top: -17px; width: 15px; height: 15px; color: #42B236; animation-delay: .35s\"><svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"currentColor\" focusable=\"false\"><path d=\"M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z\"></path></svg></span>\n        <span class=\"g-spk\" aria-hidden=\"true\" style=\"right: 16%; top: -13px; width: 19px; height: 19px; color: #10C0E5; animation-delay: .7s\"><svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"currentColor\" focusable=\"false\"><path d=\"M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z\"></path></svg></span>\n        <span class=\"g-spk\" aria-hidden=\"true\" style=\"right: -11px; top: 26%; width: 17px; height: 17px; color: #FFB703; animation-delay: .2s\"><svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"currentColor\" focusable=\"false\"><path d=\"M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z\"></path></svg></span>\n        <span class=\"g-spk\" aria-hidden=\"true\" style=\"right: -7px; bottom: -11px; width: 21px; height: 21px; color: #42B236; animation-delay: .55s\"><svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"currentColor\" focusable=\"false\"><path d=\"M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z\"></path></svg></span>\n        <span class=\"g-spk\" aria-hidden=\"true\" style=\"left: 46%; bottom: -15px; width: 14px; height: 14px; color: #FFB703; animation-delay: .9s\"><svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"currentColor\" focusable=\"false\"><path d=\"M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z\"></path></svg></span>\n        <span class=\"g-spk\" aria-hidden=\"true\" style=\"left: -13px; bottom: 16%; width: 16px; height: 16px; color: #10C0E5; animation-delay: 1.1s\"><svg viewBox=\"0 0 24 24\" width=\"100%\" height=\"100%\" fill=\"currentColor\" focusable=\"false\"><path d=\"M12 1.5l2.4 8.1 8.1 2.4-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z\"></path></svg></span>\n        <span class=\"g-fig g-bob\" aria-hidden=\"true\" style=\"width: 96px; height: 96px; background-image: {{found.fig.img}}; background-size: {{found.fig.size}}; background-position: {{found.fig.pos}}\"></span>\n        <div style=\"display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; max-width: 380px\">\n          <strong class=\"g-h\" style=\"font-size: 30px; line-height: 1.1; font-weight: 600; color: #0B7D43\">เจอแล้ว!</strong>\n          <span style=\"font-size: 14px; line-height: 1.5; color: #19261E\"><strong class=\"g-h\" style=\"font-weight: 500; color: {{found.color}}\">{{found.name}}: </strong>{{found.t}}</span>\n          <span style=\"font-size: 12px; line-height: 1.45; color: #55625A\">{{found.sub}}</span>\n          <sc-if value=\"{{found.canGo}}\" hint-placeholder-val=\"{{ true }}\">\n            <button type=\"button\" class=\"g-btn\" onClick=\"{{foundGo}}\" style=\"min-height: 38px; margin-top: 2px; padding: 6px 14px; font-size: 13.5px\">ไปดูคำถามเลย <kbd class=\"ghg-kb\">Space</kbd></button>\n          </sc-if>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showMap}}\" hint-placeholder-val=\"{{ true }}\">\n    <div class=\"ghg-map\">\n      <div class=\"g-float\" style=\"display: flex; flex-direction: column; gap: 5px; padding: 5px; border-radius: 16px\">\n        <canvas ref=\"{{mapRef}}\" width=\"420\" height=\"420\" aria-label=\"แผนที่ย่อของเมือง คลิกจุดสีเพื่อไปที่จุดนั้น\" style=\"display: block; width: 100%; aspect-ratio: 1 / 1; border-radius: 12px; background: #DCE7DD; cursor: pointer\"></canvas>\n        <div class=\"ghg-leg\" aria-hidden=\"true\" style=\"flex-wrap: wrap; gap: 3px 9px; padding: 0 3px 1px; font-size: 11px; line-height: 1.4; color: #3A463F\">\n          <span style=\"display: flex; align-items: center; gap: 4px\"><span style=\"width: 8px; height: 8px; border-radius: 50%; background: #E8590C\"></span>{{mapTodo}}</span>\n          <span style=\"display: flex; align-items: center; gap: 4px\"><span style=\"width: 8px; height: 8px; border-radius: 50%; background: #15803D\"></span>ถูก</span>\n          <span style=\"display: flex; align-items: center; gap: 4px\"><span style=\"width: 8px; height: 8px; border-radius: 50%; background: #64748B\"></span>ผิด</span>\n          <span style=\"display: flex; align-items: center; gap: 4px\"><span style=\"width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 9px solid #1D4ED8\"></span>คุณ</span>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showHint}}\" hint-placeholder-val=\"{{ true }}\">\n    <div class=\"ghg-hint g-float ghg-anim\" role=\"note\" aria-label=\"วิธีควบคุม\" style=\"box-sizing: border-box; padding: 10px 12px; border-radius: 16px; font-size: 12px; line-height: 1.4; color: #2E3B33\">\n      <sc-if value=\"{{hintWalk}}\" hint-placeholder-val=\"{{ true }}\">\n        <sc-if value=\"{{touchOn}}\" hint-placeholder-val=\"{{ false }}\">\n          <span><kbd>แตะค้างซ้ายจอ</kbd> ลากเพื่อเดิน (ลากสุดคือวิ่ง)</span>\n          <span><kbd>ลากขวาจอ</kbd> มองรอบตัว · เล็งเป้า</span>\n          <span><kbd>แตะที่แหล่งปล่อย</kbd> ตอนตามหา = เจอแล้ว</span>\n          <span><kbd>จีบนิ้ว</kbd> ซูม · <kbd>แตะพื้น</kbd> เดินไปที่นั่น</span>\n        </sc-if>\n        <sc-if value=\"{{touchOff}}\" hint-placeholder-val=\"{{ true }}\">\n          <span><kbd>W A S D</kbd> เดิน · <kbd>Shift</kbd> วิ่ง</span>\n          <span><kbd>ลากเมาส์</kbd> มองรอบตัว · เล็งเป้า</span>\n          <span><kbd>คลิกพื้น</kbd> เดินไปที่นั่น</span>\n          <span><kbd>คลิกแหล่งปล่อย</kbd> ตอนตามหา = เจอแล้ว</span>\n          <span><kbd>H</kbd> คำใบ้ · <kbd>E</kbd> ตามหา/คุย</span>\n          <span><kbd>Space</kbd> ต่อไป · <kbd>M</kbd> มุมสูง · <kbd>Esc</kbd> ปิด</span>\n        </sc-if>\n        <span>ปุ่ม <strong>เดินทางด่วน</strong> พาบินไปย่านอื่น · คลิกแผนที่ย่อเพื่อบินไปจุดนั้น</span>\n      </sc-if>\n      <sc-if value=\"{{hintOver}}\" hint-placeholder-val=\"{{ false }}\">\n        <span><kbd>ลากเมาส์</kbd> หมุนมุมมอง</span>\n        <span><kbd>ล้อเมาส์</kbd> ซูมเข้า-ออก</span>\n        <span><kbd>คลิกหมุด</kbd> ให้ทีมมาสคอตพาไป</span>\n        <span><kbd>M</kbd> กลับมาเดินต่อ</span>\n      </sc-if>\n      <p style=\"margin: 3px 0 0; padding-top: 6px; border-top: 1px solid rgba(25,38,30,.1); font-size: 11.5px; line-height: 1.5; color: #55625A\">ความคืบหน้าบันทึกไว้ในเบราว์เซอร์นี้อัตโนมัติ · ข้อมูลทุกจุดเป็นตัวอย่างสมมติเพื่อการสอน · อ้างอิง IPCC 2006 · GWP AR5 · ค่า EF ของ อบก.</p>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showNear}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-dlg\">\n      <div class=\"ghg-anim g-panel\" role=\"status\" style=\"display: flex; align-items: center; gap: 12px; width: min(620px, 100%); padding: 10px 12px 10px 10px; border-radius: 20px; box-shadow: 0 10px 30px rgba(25,38,30,.28)\">\n        <span class=\"g-av g-glow\" aria-hidden=\"true\" style=\"width: 56px; height: 56px; background-color: {{near.pic.bg}}; background-image: {{near.pic.img}}; background-size: {{near.pic.size}}; background-position: {{near.pic.pos}}\"></span>\n        <div style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px\">\n          <span style=\"font-size: 12.5px; font-weight: 600; color: #8A5A00\">{{near.callout}}</span>\n          <strong class=\"g-h\" style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: 16px; line-height: 1.35\"><span class=\"g-chip g-mono\" style=\"padding: 1px 8px; background: {{near.color}}; color: {{near.badgeFg}}; font-size: 12px\">จุดที่ {{near.n}}</span>{{near.short}}</strong>\n          <span style=\"font-size: 12.5px; color: #4A574F\">{{near.place}}</span>\n        </div>\n        <button type=\"button\" class=\"g-btn\" onClick=\"{{talkNear}}\" style=\"flex: 0 0 auto\">\n          คุยกับทีม <kbd class=\"ghg-kb\">E</kbd>\n        </button>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showRiddle}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-dlg\">\n      <div class=\"ghg-anim g-panel\" role=\"region\" aria-label=\"ปริศนาใกล้ตัว\" style=\"width: min(640px, 100%); display: flex; flex-direction: column; gap: 9px; padding: 12px 14px; border: 1.5px solid #F2D58E; border-radius: 22px; background: #FFFFFF; box-shadow: 0 12px 34px rgba(25,38,30,.30)\">\n        <div style=\"display: flex; align-items: flex-start; gap: 12px\">\n          <span aria-hidden=\"true\" style=\"flex: 0 0 auto; position: relative; width: 56px; height: 56px\">\n            <span class=\"g-av\" style=\"width: 56px; height: 56px; box-shadow: 0 0 0 3px #FFB703; background-color: {{riddle.pic.bg}}; background-image: {{riddle.pic.img}}; background-size: {{riddle.pic.size}}; background-position: {{riddle.pic.pos}}\"></span>\n            <span class=\"g-h g-wob\" style=\"position: absolute; right: -6px; bottom: -5px; width: 26px; height: 26px; border-radius: 50%; background: #19261E; color: #FFB703; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; box-shadow: 0 0 0 2px #FFFFFF\">?</span>\n          </span>\n          <div style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px\">\n            <div style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px\">\n              <span class=\"g-chip\" style=\"background: #19261E; color: #FFB703\">ปริศนาใกล้ตัว!</span>\n              <span style=\"font-size: 12px; line-height: 1.4; color: #55625A\">{{riddle.area}}</span>\n              <sc-if value=\"{{riddle.hasDist}}\" hint-placeholder-val=\"{{ true }}\"><span class=\"g-chip g-mono\" style=\"margin-left: auto; padding: 2px 9px; background: #EEF2F0; color: #2E3B33; font-size: 11.5px\"><sc-if value=\"{{riddle.cmp}}\" hint-placeholder-val=\"{{ false }}\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"#B87800\" aria-hidden=\"true\" focusable=\"false\" style=\"transform: {{cmp.rot}}; transition: transform .12s linear\"><path d=\"M12 2.5l6.5 16-6.5-3.6-6.5 3.6z\"></path></svg></sc-if>{{riddle.dist}}</span></sc-if>\n            </div>\n            <p class=\"g-h\" style=\"margin: 2px 0 0; font-size: 16px; line-height: 1.55; font-weight: 400; color: #19261E\">“{{riddle.t}}” <span style=\"font-family: 'IBM Plex Sans Thai', sans-serif; font-size: 12px; font-weight: 600; color: {{riddle.color}}\">— {{riddle.name}}</span></p>\n          </div>\n        </div>\n        <div style=\"display: flex; align-items: flex-start; gap: 8px; padding: 7px 10px; border-radius: 12px; background: #FFF2CC; font-size: 13px; line-height: 1.5; color: #5A3F00\">\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto; margin-top: 2px\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"></circle><path d=\"M15.5 15.5l5 5\"></path></svg>\n          <span><strong>ภารกิจ: </strong>{{riddle.seek}}</span>\n        </div>\n        <sc-if value=\"{{riddle.showClue}}\" hint-placeholder-val=\"{{ false }}\">\n          <div style=\"display: flex; align-items: flex-start; gap: 8px; padding: 7px 10px; border-radius: 12px; background: #E6F4E2; font-size: 13px; line-height: 1.5; color: #1E4A19\">\n            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto; margin-top: 2px\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9 18h6M10 21h4\"></path><path d=\"M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z\"></path></svg>\n            <span><strong>คำใบ้: </strong>{{riddle.clue}}</span>\n          </div>\n        </sc-if>\n        <div style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 8px\">\n          <button type=\"button\" class=\"g-btn\" onClick=\"{{riddleSeek}}\">\n            <svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"7.5\"></circle><path d=\"M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4\"></path></svg>\n            ตามหาเลย <kbd class=\"ghg-kb\">E</kbd>\n          </button>\n          <button type=\"button\" class=\"g-btn2\" onClick=\"{{riddleHint}}\">\n            <svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9 18h6M10 21h4\"></path><path d=\"M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z\"></path></svg>\n            ขอคำใบ้ <kbd class=\"ghg-kb\">H</kbd>\n          </button>\n          <button type=\"button\" class=\"g-link\" onClick=\"{{riddleSkip}}\" style=\"margin-left: auto\">ข้ามไปที่คำถาม</button>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showRoam}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-dlg\">\n      <div class=\"ghg-anim g-float\" role=\"status\" style=\"display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 10px; padding: 7px 8px 7px 8px; border-radius: 999px\">\n        <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 34px; height: 34px; background-color: {{roam.pic.bg}}; background-image: {{roam.pic.img}}; background-size: {{roam.pic.size}}; background-position: {{roam.pic.pos}}\"></span>\n        <span style=\"font-size: 13.5px; line-height: 1.45; color: #19261E\">เหลือ <strong>{{roam.left}}</strong> ปริศนา · มองหาฟอง <strong class=\"g-h\" style=\"color: #B87800\">?</strong> ในเมือง<span class=\"ghg-sub ghg-kb\" style=\"color: #4A574F\"> · <kbd>W A S D</kbd> เดิน · <kbd>Shift</kbd> วิ่ง</span><span class=\"ghg-tc\" style=\"color: #4A574F\"> · แตะค้างซ้ายจอแล้วลากเพื่อเดิน</span></span>\n        <button type=\"button\" class=\"g-btn2\" onClick=\"{{roamHint}}\" style=\"min-height: 36px; padding: 4px 12px; border-radius: 999px; font-size: 13px\">ให้น้องส่องพาไป <kbd class=\"ghg-kb\">H</kbd></button>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showOverTip}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-dlg\">\n      <div class=\"ghg-anim g-float\" role=\"note\" aria-label=\"วิธีใช้มุมสูง\" style=\"display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 12px; padding: 7px 14px; border-radius: 999px; font-size: 13px; line-height: 1.45; color: #19261E\">\n        <span><kbd>ลากเมาส์</kbd> หมุน</span>\n        <span><kbd>ล้อเมาส์</kbd> ซูม</span>\n        <span><kbd>คลิกหมุด</kbd> ให้ทีมพาไป</span>\n        <span><kbd>M</kbd> กลับมาเดิน</span>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showDlg}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-dlg\" data-card=\"{{dlgCard}}\">\n      <div class=\"ghg-anim g-panel\" style=\"display: flex; align-items: center; gap: 12px; width: min(740px, 100%); padding: 10px 12px 10px 10px; border-radius: 22px; box-shadow: 0 10px 30px rgba(25,38,30,.28)\">\n        <div aria-hidden=\"true\" style=\"flex: 0 0 auto; position: relative; width: 60px; height: 60px\">\n          <span class=\"g-av\" style=\"width: 60px; height: 60px; box-shadow: 0 0 0 3px {{dlg.ring}}; background-color: {{dlg.pic.bg}}; background-image: {{dlg.pic.img}}; background-size: {{dlg.pic.size}}; background-position: {{dlg.pic.pos}}\"></span>\n        </div>\n        <div style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px\">\n          <div style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px\">\n            <strong class=\"g-h\" style=\"font-size: 16px; color: {{dlg.nameColor}}\">{{dlg.name}}</strong>\n            <span class=\"g-chip\" style=\"padding: 1px 8px; background: {{dlg.chipBg}}; color: {{dlg.chipFg}}; font-size: 11.5px\">{{dlg.principle}}</span>\n            <span style=\"font-size: 12px; color: #55625A\">{{dlg.sub}}</span>\n          </div>\n          <p aria-live=\"polite\" style=\"margin: 0; font-size: 15.5px; line-height: 1.55; color: #19261E\">{{dlg.text}}</p>\n          <sc-if value=\"{{dlg.hasDots}}\" hint-placeholder-val=\"{{ true }}\">\n            <div aria-hidden=\"true\" style=\"display: flex; gap: 4px; padding-top: 2px\">\n              <sc-for list=\"{{dlg.dots}}\" as=\"dt\" hint-placeholder-count=\"3\"><span style=\"width: {{dt.w}}; height: 6px; border-radius: 999px; background: {{dt.bg}}\"></span></sc-for>\n            </div>\n          </sc-if>\n        </div>\n        <sc-if value=\"{{dlg.hasNext}}\" hint-placeholder-val=\"{{ true }}\">\n          <div style=\"flex: 0 0 auto; display: flex; flex-direction: column; align-items: stretch; gap: 2px\">\n            <button type=\"button\" class=\"g-btn\" onClick=\"{{dlgNext}}\">\n              {{dlg.nextLabel}}\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12h13.5M13 6l6 6-6 6\"></path></svg>\n            </button>\n            <sc-if value=\"{{dlg.hasSkip}}\" hint-placeholder-val=\"{{ true }}\">\n              <button type=\"button\" class=\"g-link\" onClick=\"{{dlgSkip}}\" style=\"min-height: 30px; font-size: 12px\">ข้ามไปที่คำถาม</button>\n            </sc-if>\n          </div>\n        </sc-if>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showDrawer}}\" hint-placeholder-val=\"{{ false }}\">\n    <aside class=\"ghg-scroll ghg-anim ghg-drawer g-panel\" aria-label=\"{{drawerTitle}}\" style=\"overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding: 14px; border-radius: 20px\">\n      <div style=\"display: flex; align-items: center; justify-content: space-between; gap: 8px\">\n        <div style=\"display: flex; flex-direction: column; gap: 1px\">\n          <strong class=\"g-h\" style=\"font-size: 17px\">{{drawerTitle}}</strong>\n          <span class=\"g-k\">{{drawerSub}}</span>\n        </div>\n        <button type=\"button\" onClick=\"{{closeDrawer}}\" aria-label=\"ปิดรายการ\" style=\"flex: 0 0 auto; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 12px; background: #EEF2F0; color: #19261E; cursor: pointer\">\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg>\n        </button>\n      </div>\n      <sc-if value=\"{{showBook}}\" hint-placeholder-val=\"{{ false }}\">\n        <div style=\"display: flex; flex-direction: column; gap: 6px\">\n          <div aria-hidden=\"true\" style=\"height: 7px; border-radius: 999px; background: #E4E9E6; overflow: hidden\"><div style=\"width: {{progress}}; height: 7px; border-radius: 999px; background: linear-gradient(90deg, #42B236, #10C0E5 60%, #FFB703)\"></div></div>\n          <p style=\"margin: 0; padding: 8px 10px; border-radius: 12px; background: #FFF5D9; font-size: 12px; line-height: 1.55; color: #5A3F00\">เดินเข้าใกล้ฟอง ? ในเมืองเพื่อเปิดปริศนา ไขได้แล้วจะบันทึกไว้ที่นี่ · กด <kbd>H</kbd> ให้น้องส่องพาไปจุดที่ใกล้ที่สุด</p>\n        </div>\n      </sc-if>\n      <sc-if value=\"{{showStopList}}\" hint-placeholder-val=\"{{ true }}\">\n        <div style=\"display: flex; flex-direction: column; gap: 6px\">\n          <span style=\"font-size: 12px; font-weight: 600; color: #2E7A26\">บทนำที่ประตูเมือง</span>\n          <sc-for list=\"{{lessonsList}}\" as=\"ls\" hint-placeholder-count=\"4\">\n            <button type=\"button\" onClick=\"{{ls.pick}}\" style=\"display: flex; align-items: center; gap: 10px; width: 100%; min-height: 46px; padding: 5px 10px 5px 6px; border: 1px solid rgba(25,38,30,.1); border-radius: 13px; background: #FFFFFF; color: #19261E; text-align: left; cursor: pointer\">\n              <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 32px; height: 32px; background-color: {{ls.pic.bg}}; background-image: {{ls.pic.img}}; background-size: {{ls.pic.size}}; background-position: {{ls.pic.pos}}\"></span>\n              <span style=\"display: flex; flex-direction: column; gap: 0; min-width: 0\">\n                <span style=\"font-size: 11px; color: #55625A\">บทที่ {{ls.n}}</span>\n                <span style=\"font-size: 13.5px; font-weight: 600; line-height: 1.35\">{{ls.title}}</span>\n              </span>\n            </button>\n          </sc-for>\n        </div>\n      </sc-if>\n      <sc-if value=\"{{showBook}}\" hint-placeholder-val=\"{{ false }}\">\n        <sc-for list=\"{{bGroups}}\" as=\"bg\" hint-placeholder-count=\"3\">\n          <div style=\"display: flex; flex-direction: column; gap: 6px\">\n            <div style=\"display: flex; align-items: baseline; justify-content: space-between; gap: 8px\">\n              <span style=\"font-size: 12px; font-weight: 600; color: #2E7A26\">{{bg.name}}</span>\n              <span class=\"g-k\" style=\"font-size: 11.5px\">{{bg.prog}}</span>\n            </div>\n            <sc-for list=\"{{bg.items}}\" as=\"bi\" hint-placeholder-count=\"2\">\n              <sc-if value=\"{{bi.solved}}\" hint-placeholder-val=\"{{ false }}\">\n                <button type=\"button\" onClick=\"{{bi.review}}\" style=\"display: flex; align-items: center; gap: 10px; width: 100%; min-height: 50px; padding: 6px 10px; border: 1.5px solid rgba(25,38,30,.1); border-radius: 14px; background: #FFFFFF; color: #19261E; text-align: left; cursor: pointer\">\n                  <sc-if value=\"{{bi.hasPhoto}}\" hint-placeholder-val=\"{{ false }}\"><img class=\"ghg-bk-ph\" src=\"{{bi.photo}}\" alt=\"ภาพหลักฐานจุดที่ {{bi.n}}\" style=\"--bk: {{bi.badge}}\"></sc-if>\n                  <sc-if value=\"{{bi.noPhoto}}\" hint-placeholder-val=\"{{ true }}\"><span class=\"g-mono\" style=\"flex: 0 0 auto; width: 30px; height: 30px; border-radius: 10px; background: {{bi.badge}}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600\">{{bi.n}}</span></sc-if>\n                  <span style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px\">\n                    <span style=\"font-size: 13.5px; font-weight: 600; line-height: 1.3\">{{bi.title}}</span>\n                    <span style=\"display: flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 600; color: {{bi.resFg}}\">\n                      <sc-if value=\"{{bi.ok}}\" hint-placeholder-val=\"{{ true }}\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12.5l4.2 4.2L19 7\"></path></svg></sc-if>\n                      <sc-if value=\"{{bi.bad}}\" hint-placeholder-val=\"{{ false }}\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg></sc-if>\n                      {{bi.res}}\n                    </span>\n                  </span>\n                  <span class=\"g-chip\" style=\"flex: 0 0 auto; padding: 2px 7px; background: {{bi.scopeSoft}}; color: {{bi.scopeInk}}; font-size: 10.5px\">{{bi.scopeLabel}}</span>\n                </button>\n              </sc-if>\n              <sc-if value=\"{{bi.open}}\" hint-placeholder-val=\"{{ true }}\">\n                <div style=\"display: flex; flex-direction: column; gap: 6px; padding: 9px 10px 7px; border: 1.5px dashed {{bi.bd}}; border-radius: 14px; background: {{bi.bg}}\">\n                  <div style=\"display: flex; align-items: center; gap: 9px\">\n                    <span class=\"g-h\" aria-hidden=\"true\" style=\"flex: 0 0 auto; width: 30px; height: 30px; border-radius: 10px; background: #19261E; color: #FFB703; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600\">?</span>\n                    <span style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0\">\n                      <strong style=\"font-size: 13.5px; line-height: 1.3\">ปริศนา ???</strong>\n                      <span style=\"font-size: 11.5px; line-height: 1.35; color: #55625A\">{{bi.area}}</span>\n                    </span>\n                    <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 28px; height: 28px; background-color: {{bi.pic.bg}}; background-image: {{bi.pic.img}}; background-size: {{bi.pic.size}}; background-position: {{bi.pic.pos}}\"></span>\n                  </div>\n                  <p class=\"g-clamp2\" style=\"margin: 0; font-size: 12.5px; line-height: 1.5; color: #2E3B33\">“{{bi.riddle}}”</p>\n                  <sc-if value=\"{{bi.hinting}}\" hint-placeholder-val=\"{{ false }}\"><span class=\"g-chip\" style=\"align-self: flex-start; background: #FFB703; color: #19261E\">น้องส่องกำลังพาไป · ตามแสงไปเลย</span></sc-if>\n                  <div style=\"display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 2px 8px\">\n                    <button type=\"button\" onClick=\"{{bi.hint}}\" style=\"display: flex; align-items: center; gap: 6px; min-height: 36px; padding: 3px 12px 3px 4px; border: 0; border-radius: 999px; background: #0B7D43; color: #FFFFFF; font-size: 12.5px; font-weight: 600; cursor: pointer\">\n                      <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 28px; height: 28px; background-color: {{bookFly.bg}}; background-image: {{bookFly.img}}; background-size: {{bookFly.size}}; background-position: {{bookFly.pos}}\"></span>\n                      ขอให้น้องส่องพาไป\n                    </button>\n                    <button type=\"button\" class=\"g-link\" onClick=\"{{bi.warp}}\" style=\"min-height: 32px; padding: 2px 4px; font-size: 11.5px; font-weight: 500; color: #6B756F\">วาร์ปไปเลย (วิทยากร)</button>\n                  </div>\n                </div>\n              </sc-if>\n            </sc-for>\n          </div>\n        </sc-for>\n        <div style=\"display: flex; flex-direction: column; gap: 6px; padding-top: 4px; border-top: 1px dashed rgba(25,38,30,.18)\">\n          <span style=\"font-size: 12px; font-weight: 600; color: #2E7A26\">ทบทวนบทนำที่ประตูเมือง</span>\n          <sc-for list=\"{{lessonsList}}\" as=\"lb\" hint-placeholder-count=\"4\">\n            <button type=\"button\" onClick=\"{{lb.pick}}\" style=\"display: flex; align-items: center; gap: 10px; width: 100%; min-height: 44px; padding: 4px 10px 4px 6px; border: 1px solid rgba(25,38,30,.1); border-radius: 13px; background: #FFFFFF; color: #19261E; text-align: left; cursor: pointer\">\n              <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 30px; height: 30px; background-color: {{lb.pic.bg}}; background-image: {{lb.pic.img}}; background-size: {{lb.pic.size}}; background-position: {{lb.pic.pos}}\"></span>\n              <span style=\"display: flex; flex-direction: column; gap: 0; min-width: 0\">\n                <span style=\"font-size: 11px; color: #55625A\">บทที่ {{lb.n}}</span>\n                <span style=\"font-size: 13px; font-weight: 600; line-height: 1.35\">{{lb.title}}</span>\n              </span>\n            </button>\n          </sc-for>\n        </div>\n      </sc-if>\n      <sc-if value=\"{{showStopList}}\" hint-placeholder-val=\"{{ true }}\">\n        <sc-for list=\"{{dGroups}}\" as=\"dg\" hint-placeholder-count=\"3\">\n          <div style=\"display: flex; flex-direction: column; gap: 6px\">\n            <div style=\"display: flex; align-items: baseline; justify-content: space-between; gap: 8px\">\n              <span style=\"font-size: 12px; font-weight: 600; color: #2E7A26\">{{dg.name}}</span>\n              <span class=\"g-k\" style=\"font-size: 11.5px\">{{dg.prog}}</span>\n            </div>\n            <sc-for list=\"{{dg.items}}\" as=\"it\" hint-placeholder-count=\"2\">\n              <button type=\"button\" onClick=\"{{it.pick}}\" style=\"display: flex; align-items: center; gap: 10px; width: 100%; min-height: 52px; padding: 6px 10px; border: 1.5px solid {{it.bd}}; border-radius: 14px; background: {{it.bg}}; color: #19261E; text-align: left; cursor: pointer\">\n                <span class=\"g-mono\" style=\"flex: 0 0 auto; width: 30px; height: 30px; border-radius: 10px; background: {{it.badge}}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600\">{{it.n}}</span>\n                <span style=\"flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px\">\n                  <span style=\"font-size: 13.5px; font-weight: 600; line-height: 1.3\">{{it.short}}</span>\n                  <span style=\"font-size: 11.5px; line-height: 1.3; color: #55625A\">{{it.place}}</span>\n                </span>\n                <span style=\"flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; gap: 3px\">\n                  <span class=\"g-chip\" style=\"padding: 2px 7px; background: {{it.scopeSoft}}; color: {{it.scopeInk}}; font-size: 10.5px\">{{it.scopeLabel}}</span>\n                  <span style=\"font-size: 10.5px; color: {{it.stFg}}; white-space: nowrap\">{{it.stText}}</span>\n                </span>\n              </button>\n            </sc-for>\n          </div>\n        </sc-for>\n      </sc-if>\n      <button type=\"button\" class=\"g-btn2\" onClick=\"{{restart}}\" style=\"align-self: flex-start; min-height: 40px; font-size: 13px\">\n        <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 12a8 8 0 1 0 2.4-5.7\"></path><path d=\"M4 4.5v4h4\"></path></svg>\n        เริ่มใหม่ทั้งหมด\n      </button>\n    </aside>\n  </sc-if>\n\n  <sc-if value=\"{{showCard}}\" hint-placeholder-val=\"{{ false }}\">\n    <div class=\"ghg-qwrap\">\n      <section class=\"ghg-quiz ghg-anim\" role=\"dialog\" aria-label=\"คำถามประจำจุด\">\n        <div class=\"ghg-quiz-scroll ghg-scroll\">\n          <div class=\"ghg-quiz-head\">\n            <span class=\"ghg-quiz-badge g-h\" style=\"background: {{card.color}}; color: {{card.badgeFg}}\">{{card.n}}</span>\n            <div class=\"ghg-quiz-ttl\">\n              <span>{{card.pos}}</span>\n              <h3 class=\"g-h\">{{card.title}}</h3>\n              <span>{{card.org}}</span>\n            </div>\n          </div>\n          <div class=\"ghg-quiz-meta\">\n            <span class=\"g-chip\" style=\"background: {{card.soft}}; color: {{card.ink}}\"><span style=\"width: 8px; height: 8px; border-radius: 50%; background: {{card.color}}; box-shadow: 0 0 0 1px rgba(25,38,30,.25)\"></span>{{card.scopeLabel}}</span>\n            <span class=\"g-chip\" style=\"background: #EEF2F0; color: #2E3B33\">{{card.isoText}}</span>\n            <sc-for list=\"{{card.gases}}\" as=\"cg\" hint-placeholder-count=\"2\"><span class=\"g-chip\" style=\"border: 1px solid rgba(25,38,30,.14); color: #2E3B33; font-weight: 500\"><span style=\"width: 8px; height: 8px; border-radius: 50%; background: {{cg.color}}\"></span><strong>{{cg.t}}</strong> {{cg.sub}}</span></sc-for>\n          </div>\n          <div class=\"ghg-quiz-scene\">\n            <sc-if value=\"{{card.hasPhoto}}\" hint-placeholder-val=\"{{ false }}\">\n              <button type=\"button\" class=\"ghg-quiz-photo\" onClick=\"{{filmReplay}}\" title=\"ดูวิดีโอสำรวจหน้างานอีกครั้ง\"><img src=\"{{card.photo}}\" alt=\"ภาพหลักฐานจากวิดีโอสำรวจหน้างาน จุดที่ {{card.n}}\"><span><i><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M8 5.5v13l11-6.5z\"></path></svg></i></span></button>\n            </sc-if>\n            <sc-if value=\"{{card.noPhoto}}\" hint-placeholder-val=\"{{ true }}\">\n              <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto; margin-top: 2px\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"2.8\"></circle></svg>\n            </sc-if>\n            <div class=\"ghg-quiz-scene-t\">\n              <p><strong>สิ่งที่เห็น </strong>{{card.scene}}</p>\n              <sc-if value=\"{{card.canFilm}}\" hint-placeholder-val=\"{{ true }}\">\n                <button type=\"button\" class=\"ghg-filmbtn\" onClick=\"{{filmReplay}}\"><i><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M8 5.5v13l11-6.5z\"></path></svg></i>{{card.filmLbl}}</button>\n              </sc-if>\n            </div>\n          </div>\n          <p class=\"ghg-quiz-q g-h\">{{card.q}}</p>\n          <div class=\"ghg-quiz-opts\" role=\"group\" aria-label=\"ตัวเลือกคำตอบ\">\n            <sc-for list=\"{{opts}}\" as=\"op\" hint-placeholder-count=\"4\">\n              <button type=\"button\" class=\"ghg-opt\" onClick=\"{{op.pick}}\" disabled=\"{{op.dis}}\" data-st=\"{{op.st}}\">\n                <span class=\"ghg-opt-k\">{{op.key}}</span>\n                <span class=\"ghg-opt-t\">{{op.t}}</span>\n                <sc-if value=\"{{op.ok}}\" hint-placeholder-val=\"{{ false }}\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#15803D\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-label=\"คำตอบที่ถูก\" role=\"img\"><path d=\"M5 12.5l4.2 4.2L19 7\"></path></svg></sc-if>\n                <sc-if value=\"{{op.bad}}\" hint-placeholder-val=\"{{ false }}\"><svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#B42318\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-label=\"คำตอบที่เลือกไม่ถูก\" role=\"img\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg></sc-if>\n              </button>\n            </sc-for>\n          </div>\n          <sc-if value=\"{{notAnswered}}\" hint-placeholder-val=\"{{ true }}\">\n            <p class=\"ghg-quiz-tip\">\n              <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 30px; height: 30px; background-color: {{askPic.bg}}; background-image: {{askPic.img}}; background-size: {{askPic.size}}; background-position: {{askPic.pos}}\"></span>\n              <span>เลือกคำตอบที่คิดว่าถูก แล้วทีมมาสคอตจะเฉลยพร้อมสูตรและมุมผู้ทวนสอบ<span class=\"ghg-kb\"> · กด <kbd>1</kbd>–<kbd>4</kbd> ก็ได้</span></span>\n            </p>\n          </sc-if>\n          <sc-if value=\"{{answered}}\" hint-placeholder-val=\"{{ false }}\">\n            <div class=\"ghg-quiz-res\" style=\"background: {{card.fbBg}}; color: {{card.fbFg}}\">\n              <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 52px; height: 52px; background-color: {{card.fbPic.bg}}; background-image: {{card.fbPic.img}}; background-size: {{card.fbPic.size}}; background-position: {{card.fbPic.pos}}; box-shadow: 0 0 0 2.5px {{card.fbIcon}}\"></span>\n              <div style=\"display: flex; flex-direction: column; gap: 4px; min-width: 0\">\n                <strong class=\"g-h\" style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 18px; font-weight: 600\">\n                  <sc-if value=\"{{cardOk}}\" hint-placeholder-val=\"{{ true }}\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#15803D\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12.5l4.2 4.2L19 7\"></path></svg></sc-if>\n                  <sc-if value=\"{{cardBad}}\" hint-placeholder-val=\"{{ false }}\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#B42318\" stroke-width=\"2.8\" stroke-linecap=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg></sc-if>\n                  {{card.fbTitle}}<span style=\"font-family: 'IBM Plex Sans Thai', sans-serif; font-size: 13.5px; font-weight: 600; opacity: .85\">· {{card.fbSub}}</span>\n                </strong>\n                <span style=\"font-size: 13px; font-weight: 600; opacity: .92\">{{card.fbName}}: “{{card.fbLine}}”</span>\n                <span style=\"font-size: 14px; line-height: 1.65\">{{card.why}}</span>\n              </div>\n            </div>\n\n            <div role=\"tablist\" aria-label=\"รายละเอียดเฉลย\" class=\"ghg-quiz-tabs\">\n              <sc-for list=\"{{tabs}}\" as=\"tb\" hint-placeholder-count=\"5\">\n                <button type=\"button\" role=\"tab\" onClick=\"{{tb.pick}}\" aria-selected=\"{{tb.on}}\" style=\"border-color: {{tb.bd}}; background: {{tb.bg}}; color: {{tb.fg}}\">\n                  <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 28px; height: 28px; background-color: {{tb.pic.bg}}; background-image: {{tb.pic.img}}; background-size: {{tb.pic.size}}; background-position: {{tb.pic.pos}}\"></span>\n                  {{tb.label}}\n                </button>\n              </sc-for>\n            </div>\n            <div style=\"display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 14px; background: {{host.soft}}\">\n              <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 40px; height: 40px; background-color: #FFFFFF; background-image: {{host.pic.img}}; background-size: {{host.pic.size}}; background-position: {{host.pic.pos}}\"></span>\n              <div style=\"display: flex; flex-direction: column; gap: 0; min-width: 0\">\n                <strong class=\"g-h\" style=\"font-size: 14.5px; font-weight: 500; color: {{host.ink}}\">{{host.label}}</strong>\n                <span style=\"font-size: 12px; color: {{host.ink}}\">{{host.motto}}</span>\n              </div>\n            </div>\n          <sc-if value=\"{{tabCalc}}\" hint-placeholder-val=\"{{ true }}\">\n            <div role=\"tabpanel\" style=\"display: flex; flex-direction: column; gap: 10px\">\n              <div style=\"display: flex; flex-direction: column; gap: 6px\">\n                <span style=\"font-size: 13px; font-weight: 600; color: #2E3B33\">สูตร</span>\n                <div class=\"g-mono\" style=\"padding: 10px 12px; border: 1px solid rgba(25,38,30,.12); border-radius: 13px; background: #FFFFFF; font-size: 13px; line-height: 1.65\">{{card.formula}}</div>\n              </div>\n              <div style=\"display: flex; flex-direction: column; gap: 6px\">\n                <span style=\"font-size: 13px; font-weight: 600; color: #2E3B33\">ตัวอย่างการคำนวณ</span>\n                <div style=\"display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid rgba(25,38,30,.12); border-radius: 13px\">\n                  <sc-for list=\"{{card.ex}}\" as=\"el\" hint-placeholder-count=\"2\"><div class=\"g-mono\" style=\"font-size: 12.5px; line-height: 1.6; color: #2E3B33\">{{el.t}}</div></sc-for>\n                  <div class=\"g-h\" style=\"margin-top: 2px; padding-top: 8px; border-top: 1px dashed rgba(25,38,30,.25); font-size: 19px; font-weight: 600; color: {{card.resultInk}}\">= {{card.result}}</div>\n                  <sc-if value=\"{{card.hasExtra}}\" hint-placeholder-val=\"{{ false }}\"><div style=\"padding: 8px 10px; border-radius: 11px; background: #F2F5F3; font-size: 12.5px; line-height: 1.6; color: #2E3B33\">{{card.extra}}</div></sc-if>\n                </div>\n              </div>\n              <p style=\"margin: 0; padding: 10px 12px; border-radius: 13px; background: #F2F5F3; font-size: 13px; line-height: 1.6; color: #2E3B33\">{{card.owner}}</p>\n            </div>\n          </sc-if>\n          <sc-if value=\"{{tabData}}\" hint-placeholder-val=\"{{ false }}\">\n            <div role=\"tabpanel\" style=\"display: flex; flex-direction: column; gap: 8px\">\n              <span style=\"font-size: 13px; font-weight: 600; color: #2E3B33\">ข้อมูลกิจกรรมและหลักฐานที่ต้องเก็บ</span>\n              <sc-for list=\"{{card.data}}\" as=\"dl\" hint-placeholder-count=\"2\">\n                <div style=\"display: flex; align-items: flex-start; gap: 8px; padding: 9px 11px; border: 1px solid rgba(25,38,30,.12); border-radius: 13px; font-size: 13.5px; line-height: 1.6; color: #2E3B33\">\n                  <svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0A7C99\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto; margin-top: 3px\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z\"></path><path d=\"M14 3.5V8h4M9.5 12h5M9.5 15.5h5\"></path></svg>\n                  <span>{{dl.t}}</span>\n                </div>\n              </sc-for>\n            </div>\n          </sc-if>\n          <sc-if value=\"{{tabVerify}}\" hint-placeholder-val=\"{{ false }}\">\n            <div role=\"tabpanel\" style=\"display: flex; flex-direction: column; gap: 8px\">\n              <span style=\"font-size: 13px; font-weight: 600; color: #2E3B33\">ผู้ทวนสอบจะตรวจอะไรที่จุดนี้</span>\n              <sc-for list=\"{{card.verify}}\" as=\"vf\" hint-placeholder-count=\"3\">\n                <div style=\"display: flex; align-items: flex-start; gap: 8px; padding: 9px 11px; border-radius: 13px; background: #E8EFEA; font-size: 13.5px; line-height: 1.6; color: #1F3A2B\">\n                  <svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0B7D43\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto; margin-top: 3px\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-5\"></path></svg>\n                  <span>{{vf.t}}</span>\n                </div>\n              </sc-for>\n            </div>\n          </sc-if>\n          <sc-if value=\"{{tabReduce}}\" hint-placeholder-val=\"{{ false }}\">\n            <div role=\"tabpanel\" style=\"display: flex; flex-direction: column; gap: 8px\">\n              <span style=\"font-size: 13px; font-weight: 600; color: #2E3B33\">แนวทางลดการปล่อย</span>\n              <sc-for list=\"{{card.reduce}}\" as=\"rd\" hint-placeholder-count=\"3\">\n                <div style=\"display: flex; align-items: flex-start; gap: 8px; padding: 9px 11px; border-radius: 13px; background: #E6F4E2; font-size: 13.5px; line-height: 1.6; color: #1E4A19\">\n                  <svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#2E7A26\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto; margin-top: 3px\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 19c0-8 5.5-13.5 14-14 0 8.5-5.5 14-14 14z\"></path><path d=\"M5 19l7-7\"></path></svg>\n                  <span>{{rd.t}}</span>\n                </div>\n              </sc-for>\n            </div>\n          </sc-if>\n          <sc-if value=\"{{tabMedia}}\" hint-placeholder-val=\"{{ false }}\">\n            <div role=\"tabpanel\" style=\"display: flex; flex-direction: column; gap: 8px\">\n              <div class=\"ghg-media\">\n                <sc-if value=\"{{media.yt}}\" hint-placeholder-val=\"{{ true }}\"><iframe src=\"{{media.src}}\" title=\"{{media.title}}\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen referrerpolicy=\"strict-origin-when-cross-origin\" loading=\"lazy\"></iframe></sc-if>\n                <sc-if value=\"{{media.file}}\" hint-placeholder-val=\"{{ false }}\"><video src=\"{{media.src}}\" controls playsinline preload=\"metadata\"></video></sc-if>\n              </div>\n              <sc-if value=\"{{media.hasNote}}\" hint-placeholder-val=\"{{ true }}\"><p style=\"margin: 0; font-size: 12.5px; line-height: 1.6; color: #4A574F\">{{media.note}}</p></sc-if>\n            </div>\n          </sc-if>\n          <sc-if value=\"{{tabRef}}\" hint-placeholder-val=\"{{ false }}\">\n            <div role=\"tabpanel\" style=\"display: flex; flex-direction: column; gap: 10px\">\n              <div style=\"display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 1px solid #F2D58E; border-radius: 13px; background: #FFF5D9\">\n                <span style=\"font-size: 13px; font-weight: 600; color: #6B4A00\">ข้อควรระวัง</span>\n                <sc-for list=\"{{card.caution}}\" as=\"cl\" hint-placeholder-count=\"1\"><p style=\"margin: 0; font-size: 13.5px; line-height: 1.6; color: #533A04\">{{cl.t}}</p></sc-for>\n              </div>\n              <div style=\"display: flex; flex-wrap: wrap; gap: 6px\">\n                <span class=\"g-chip\" style=\"background: #EEF2F0; color: #2E3B33\">{{card.cat}}</span>\n                <sc-if value=\"{{card.hasIpcc}}\" hint-placeholder-val=\"{{ true }}\"><span class=\"g-chip g-mono\" style=\"border: 1px solid rgba(25,38,30,.16); color: #2E3B33\">{{card.ipcc}}</span></sc-if>\n                <span class=\"g-chip\" style=\"background: {{card.soft}}; color: {{card.ink}}\">{{card.isoName}}</span>\n              </div>\n              <p style=\"margin: 0; font-size: 12.5px; line-height: 1.6; color: #4A574F\">ที่มาของค่า: {{card.src}}</p>\n            </div>\n          </sc-if>\n          </sc-if>\n        </div>\n        <sc-if value=\"{{answered}}\" hint-placeholder-val=\"{{ false }}\">\n          <div class=\"ghg-quiz-foot\">\n            <button type=\"button\" class=\"g-btn\" onClick=\"{{after}}\">\n              {{afterLabel}}\n              <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12h13.5M13 6l6 6-6 6\"></path></svg>\n              <kbd class=\"ghg-kb\">Space</kbd>\n            </button>\n          </div>\n        </sc-if>\n      </section>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showIntro}}\" hint-placeholder-val=\"{{ true }}\">\n    <div class=\"ghg-scroll ghg-introbg\" style=\"position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; padding: 18px; box-sizing: border-box; overflow-y: auto; background: radial-gradient(ellipse at 50% 40%, rgba(10,22,16,.18) 0%, rgba(10,22,16,.5) 100%)\">\n      <div class=\"ghg-anim g-panel ghg-intro\" style=\"width: min(900px, 100%); margin: auto; display: flex; flex-direction: column; gap: 14px; padding: 20px 22px 16px; border-radius: 24px; background: #FFFFFF\">\n        <div style=\"display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 8px 16px\">\n          <div style=\"display: flex; flex-direction: column; gap: 6px; min-width: 0\">\n            <span class=\"g-chip\" style=\"align-self: flex-start; background: #19261E; color: #FFB703\">เมืองจำลองสำหรับอบรม CFO · v1.0</span>\n            <h2 class=\"g-h\" style=\"margin: 0; font-size: 25px; line-height: 1.25; font-weight: 600\">{{town.name}} · สำรวจเมือง ไขปริศนากับทีมมาสคอต GCC</h2>\n            <p style=\"margin: 0; font-size: 14.5px; line-height: 1.6; color: #2E3B33\">{{town.tagline}}<span style=\"color: #6B5A2E\"> · ข้อมูลทุกจุดเป็นตัวอย่างสมมติเพื่อการสอน</span></p>\n          </div>\n        </div>\n        <div class=\"ghg-team\" style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px\">\n          <sc-for list=\"{{teamCards}}\" as=\"tm\" hint-placeholder-count=\"3\">\n            <div style=\"display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 10px 12px; border-radius: 18px; background: #FFFFFF; border: 1px solid rgba(25,38,30,.08); text-align: center\">\n              <div style=\"width: 100%; display: flex; justify-content: center; padding: 6px 0 2px; border-radius: 16px; background: {{tm.soft}}\">\n                <span class=\"g-fig\" aria-hidden=\"true\" style=\"width: 112px; height: 112px; animation: {{tm.anim}}; background-image: {{tm.fig.img}}; background-size: {{tm.fig.size}}; background-position: {{tm.fig.pos}}\"></span>\n              </div>\n              <strong class=\"g-h\" style=\"font-size: 19px; line-height: 1.25; font-weight: 600; color: {{tm.ink}}\">{{tm.name}}</strong>\n              <span class=\"ghg-motto\" style=\"font-size: 14px; line-height: 1.5; color: #19261E\">“{{tm.motto}}”</span>\n              <span class=\"g-chip\" style=\"background: {{tm.soft}}; color: {{tm.ink}}; box-shadow: inset 0 0 0 1px {{tm.line}}\">หลักการ: {{tm.principle}} · {{tm.en}}</span>\n            </div>\n          </sc-for>\n        </div>\n        <sc-if value=\"{{resume.has}}\" hint-placeholder-val=\"{{ false }}\">\n          <div role=\"group\" aria-label=\"ความคืบหน้าที่บันทึกไว้\" style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; padding: 12px 14px; border-radius: 18px; background: #E6F5E3; border: 1px solid rgba(46,122,38,.25)\">\n            <svg width=\"26\" height=\"26\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#2E7A26\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1z\"></path><path d=\"M9 10l2 2 4-4\"></path></svg>\n            <div style=\"flex: 1 1 260px; min-width: 0; display: flex; flex-direction: column; gap: 2px\">\n              <strong class=\"g-h\" style=\"font-size: 16.5px; line-height: 1.3; font-weight: 600; color: #1E5A1B\">ยินดีต้อนรับกลับ{{resume.who}} · ไขปริศนาแล้ว {{resume.done}} จาก {{total}} จุด</strong>\n              <span style=\"font-size: 12.5px; line-height: 1.5; color: #2E4A2B\">ตอบถูก {{resume.ok}} จุด · ความคืบหน้าบันทึกไว้ในเบราว์เซอร์เครื่องนี้ · เดินต่อจากจุดที่ค้างไว้ได้เลย</span>\n            </div>\n            <button type=\"button\" class=\"g-btn\" onClick=\"{{resumeGo}}\" style=\"min-height: 50px; padding: 8px 20px; font-size: 16px\">\n              <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7 4.5v15l12-7.5z\"></path></svg>\n              เล่นต่อจากเดิม\n            </button>\n          </div>\n        </sc-if>\n        <div style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 10px\">\n          <button type=\"button\" class=\"{{introMainCls}}\" onClick=\"{{startExplore}}\" style=\"min-height: 54px; padding: 10px 22px; font-size: 16.5px\">\n            <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"></circle><path d=\"M15.5 8.5l-2 5-5 2 2-5z\"></path></svg>\n            {{introMainLabel}}\n          </button>\n          <button type=\"button\" class=\"g-btn2\" onClick=\"{{startTour}}\" style=\"min-height: 54px\">\n            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"8.5\" cy=\"6\" r=\"2.3\"></circle><path d=\"M4.5 20v-4.5a4 4 0 0 1 8 0V20\"></path><circle cx=\"16.5\" cy=\"7.5\" r=\"2\"></circle><path d=\"M13.8 20v-3.6a2.7 2.7 0 0 1 5.4 0V20\"></path></svg>\n            ทัวร์นำเที่ยว (สำหรับวิทยากร)\n          </button>\n          <button type=\"button\" class=\"g-btn2\" onClick=\"{{startOverview}}\" style=\"min-height: 54px\">\n            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2z\"></path><path d=\"M9 4.5v13M15 6.5v13\"></path></svg>\n            ดูภาพรวมเมือง\n          </button>\n        </div>\n        <p class=\"ghg-kb\" style=\"margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12.5px; line-height: 1.6; color: #4A574F\"><kbd>W A S D</kbd> เดิน · <kbd>Shift</kbd> วิ่ง · ลากเมาส์ มองรอบตัวและเล็งเป้า · <kbd>H</kbd> คำใบ้ · <kbd>E</kbd> ตามหา/คุย · <kbd>Space</kbd> ต่อไป · <kbd>M</kbd> มุมสูง</p>\n        <p class=\"ghg-tc\" style=\"margin: 0; font-size: 12.5px; line-height: 1.6; color: #4A574F\">แตะค้างครึ่งซ้ายของจอแล้วลากเพื่อเดิน · ลากครึ่งขวาเพื่อมองรอบตัว · แตะที่แหล่งปล่อยเพื่อตามหา</p>\n        <sc-if value=\"{{resume.has}}\" hint-placeholder-val=\"{{ false }}\">\n          <div style=\"display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin-top: -4px\">\n            <sc-if value=\"{{resume.ask}}\" hint-placeholder-val=\"{{ false }}\"><span style=\"font-size: 12.5px; font-weight: 600; color: #8A3A08\">ลบความคืบหน้าทั้งหมดในเครื่องนี้แน่ไหม?</span></sc-if>\n            <button type=\"button\" class=\"g-link\" onClick=\"{{resume.clear}}\" style=\"padding: 4px 4px; color: {{resume.clearFg}}\">{{resume.clearLabel}}</button>\n            <sc-if value=\"{{resume.ask}}\" hint-placeholder-val=\"{{ false }}\"><button type=\"button\" class=\"g-link\" onClick=\"{{resume.keep}}\" style=\"padding: 4px 4px\">ไม่ลบ</button></sc-if>\n          </div>\n        </sc-if>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showLesson}}\" hint-placeholder-val=\"{{ false }}\">\n    <div style=\"position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; padding: 14px; box-sizing: border-box; background: rgba(25,38,30,.42)\">\n      <div class=\"ghg-scroll ghg-anim g-panel\" role=\"dialog\" aria-label=\"{{les.title}}\" style=\"width: min(940px, 100%); max-height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding: 20px 22px 18px; border-radius: 26px; background: #FFFFFF\">\n        <div style=\"display: flex; align-items: flex-start; justify-content: space-between; gap: 12px\">\n          <div style=\"display: flex; flex-direction: column; gap: 6px; min-width: 0\">\n            <span class=\"g-chip\" style=\"align-self: flex-start; background: #19261E; color: #FFB703\">{{les.kicker}} · ที่ประตูเมือง</span>\n            <h2 class=\"g-h\" style=\"margin: 0; font-size: 25px; line-height: 1.3; font-weight: 600\">{{les.title}}</h2>\n          </div>\n          <div style=\"display: flex; align-items: center; gap: 10px\">\n            <span aria-hidden=\"true\" style=\"display: flex; align-items: center\">\n              <sc-for list=\"{{les.presenters}}\" as=\"pr\" hint-placeholder-count=\"2\"><span class=\"g-av g-cl\" style=\"width: 44px; height: 44px; box-shadow: 0 0 0 2.5px #FFFFFF; background-color: {{pr.bg}}; background-image: {{pr.img}}; background-size: {{pr.size}}; background-position: {{pr.pos}}\"></span></sc-for>\n            </span>\n            <sc-if value=\"{{les.isView}}\" hint-placeholder-val=\"{{ false }}\">\n              <button type=\"button\" onClick=\"{{lesClose}}\" aria-label=\"ปิดบทนำ\" style=\"flex: 0 0 auto; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 12px; background: #E6EBE8; color: #19261E; cursor: pointer\">\n                <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg>\n              </button>\n            </sc-if>\n          </div>\n        </div>\n        <div style=\"display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 18px; background: #FFFFFF; border: 1px solid rgba(25,38,30,.08)\">\n          <sc-for list=\"{{les.lines}}\" as=\"ll\" hint-placeholder-count=\"3\">\n            <div style=\"display: flex; align-items: flex-start; gap: 10px\">\n              <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 40px; height: 40px; background-color: {{ll.pic.bg}}; background-image: {{ll.pic.img}}; background-size: {{ll.pic.size}}; background-position: {{ll.pic.pos}}\"></span>\n              <div style=\"display: flex; flex-direction: column; gap: 1px; min-width: 0\">\n                <strong class=\"g-h\" style=\"font-size: 13.5px; font-weight: 500; color: {{ll.color}}\">{{ll.name}}<span style=\"font-family: 'IBM Plex Sans Thai', sans-serif; font-size: 11.5px; font-weight: 500; color: #55625A\"> · {{ll.principle}}</span></strong>\n                <p style=\"margin: 0; font-size: 14px; line-height: 1.6; color: #19261E\">{{ll.t}}</p>\n              </div>\n            </div>\n          </sc-for>\n        </div>\n\n        <sc-if value=\"{{les.isGases}}\" hint-placeholder-val=\"{{ true }}\">\n          <div style=\"display: flex; flex-direction: column; gap: 10px\">\n            <div style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px\">\n              <sc-for list=\"{{les.gases}}\" as=\"gs\" hint-placeholder-count=\"7\">\n                <div style=\"display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid rgba(25,38,30,.1); border-top: 5px solid {{gs.color}}; border-radius: 16px; background: #FFFFFF\">\n                  <strong class=\"g-h\" style=\"font-size: 24px; line-height: 1.15; font-weight: 600; color: {{gs.color}}\">{{gs.t}}</strong>\n                  <span style=\"font-size: 13px; font-weight: 600; color: #19261E\">{{gs.name}}</span>\n                  <span class=\"g-chip\" style=\"align-self: flex-start; max-width: 100%; box-sizing: border-box; padding: 2px 8px; border-radius: 10px; white-space: normal; background: #EEF2F0; color: #2E3B33\">GWP {{gs.gwp}}</span>\n                  <span style=\"font-size: 12px; line-height: 1.5; color: #4A574F\">{{gs.from}}</span>\n                </div>\n              </sc-for>\n            </div>\n            <p style=\"margin: 0; padding: 8px 12px; border-radius: 12px; background: #EEF2F0; font-size: 12.5px; line-height: 1.6; color: #3A463F\">{{les.note}}</p>\n          </div>\n        </sc-if>\n\n        <sc-if value=\"{{les.isScopes}}\" hint-placeholder-val=\"{{ false }}\">\n          <div style=\"display: flex; flex-direction: column; gap: 12px\">\n            <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px\">\n              <sc-for list=\"{{les.scopes}}\" as=\"sp\" hint-placeholder-count=\"3\">\n                <div style=\"display: flex; flex-direction: column; gap: 8px; padding: 12px; border-radius: 16px; background: {{sp.soft}}; border-top: 5px solid {{sp.color}}\">\n                  <div style=\"display: flex; flex-direction: column; gap: 1px\">\n                    <strong class=\"g-h\" style=\"display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 6px; font-size: 17px; font-weight: 600; color: {{sp.ink}}\"><span>{{sp.label}}</span><span style=\"font-size: 13px; font-weight: 500\">· {{sp.en}}</span></strong>\n                    <span style=\"font-size: 12.5px; font-weight: 600; color: {{sp.ink}}\">{{sp.name}}</span>\n                  </div>\n                  <sc-for list=\"{{sp.items}}\" as=\"si\" hint-placeholder-count=\"3\"><div style=\"display: flex; align-items: flex-start; gap: 7px; padding: 7px 9px; border-radius: 11px; background: rgba(255,253,248,.85); font-size: 13px; line-height: 1.5; color: #19261E\"><span style=\"flex: 0 0 auto; width: 7px; height: 7px; margin-top: 7px; border-radius: 50%; background: {{sp.color}}; box-shadow: 0 0 0 1px rgba(25,38,30,.25)\"></span>{{si.t}}</div></sc-for>\n                </div>\n              </sc-for>\n            </div>\n            <div style=\"display: flex; flex-wrap: wrap; gap: 12px\">\n              <div style=\"flex: 1 1 280px; display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid rgba(25,38,30,.1); border-radius: 16px; background: #FFFFFF\">\n                <strong style=\"font-size: 13.5px\">กำหนดขอบเขตองค์กรก่อนเสมอ</strong>\n                <sc-for list=\"{{les.boundary}}\" as=\"bd\" hint-placeholder-count=\"2\"><p style=\"margin: 0; font-size: 12.5px; line-height: 1.55; color: #2E3B33\">{{bd.t}}</p></sc-for>\n                <span class=\"g-chip\" style=\"align-self: flex-start; background: {{les.removal.soft}}; color: {{les.removal.ink}}\">{{les.removal.label}} · {{les.removal.name}}</span>\n              </div>\n              <div style=\"flex: 1.3 1 320px; display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid rgba(25,38,30,.1); border-radius: 16px; background: #FFFFFF\">\n                <strong style=\"font-size: 13.5px\">เทียบหมวดตาม ISO 14064-1:2018</strong>\n                <sc-for list=\"{{les.iso}}\" as=\"io\" hint-placeholder-count=\"6\">\n                  <div style=\"display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 0; border-top: 1px solid rgba(25,38,30,.08); font-size: 12.5px; line-height: 1.45\">\n                    <span style=\"display: flex; flex-wrap: wrap; gap: 0 6px; color: #19261E\"><strong>{{io.short}}</strong><span>{{io.name}}</span></span>\n                    <span class=\"g-chip\" style=\"flex: 0 0 auto; padding: 2px 8px; background: {{io.soft}}; color: {{io.ink}}; font-size: 11.5px\">{{io.scope}}</span>\n                  </div>\n                </sc-for>\n              </div>\n            </div>\n          </div>\n        </sc-if>\n\n        <sc-if value=\"{{les.isFormula}}\" hint-placeholder-val=\"{{ false }}\">\n          <div style=\"display: flex; flex-direction: column; gap: 12px\">\n            <div aria-label=\"ข้อมูลกิจกรรม คูณ ค่าการปล่อย คูณ GWP เท่ากับ การปล่อย\" style=\"display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px\">\n              <div style=\"flex: 1 1 150px; display: flex; flex-direction: column; gap: 3px; padding: 12px; border-radius: 16px; background: #DDF3F9; color: #05617A\"><strong class=\"g-h\" style=\"font-size: 21px; font-weight: 600\">AD</strong><span style=\"font-size: 12.5px; font-weight: 600\">ข้อมูลกิจกรรม เช่น L, kWh, kg, ตัว</span></div>\n              <span aria-hidden=\"true\" class=\"g-h\" style=\"align-self: center; font-size: 24px; font-weight: 600; color: #4A574F\">×</span>\n              <div style=\"flex: 1 1 150px; display: flex; flex-direction: column; gap: 3px; padding: 12px; border-radius: 16px; background: #FFF2CC; color: #6B4A00\"><strong class=\"g-h\" style=\"font-size: 21px; font-weight: 600\">EF</strong><span style=\"font-size: 12.5px; font-weight: 600\">ค่าการปล่อยต่อหน่วยกิจกรรม</span></div>\n              <span aria-hidden=\"true\" class=\"g-h\" style=\"align-self: center; font-size: 24px; font-weight: 600; color: #4A574F\">×</span>\n              <div style=\"flex: 1 1 130px; display: flex; flex-direction: column; gap: 3px; padding: 12px; border: 1.5px dashed #42B236; border-radius: 16px; background: #EFF8EC; color: #1E5A1B\"><strong class=\"g-h\" style=\"font-size: 21px; font-weight: 600\">GWP</strong><span style=\"font-size: 12.5px; font-weight: 600\">เมื่อ EF เป็นรายก๊าซ</span></div>\n              <span aria-hidden=\"true\" class=\"g-h\" style=\"align-self: center; font-size: 24px; font-weight: 600; color: #4A574F\">=</span>\n              <div style=\"flex: 1 1 160px; display: flex; flex-direction: column; gap: 3px; padding: 12px; border-radius: 16px; background: #0B7D43; color: #FFFFFF\"><strong class=\"g-h\" style=\"font-size: 21px; font-weight: 600\">tCO₂e</strong><span style=\"font-size: 12.5px; font-weight: 600; color: #D4EBCD\">การปล่อย (หาร 1,000 จาก kg)</span></div>\n            </div>\n            <div style=\"display: flex; flex-wrap: wrap; gap: 12px\">\n              <div style=\"flex: 1 1 280px; display: flex; flex-direction: column; gap: 7px\">\n                <strong style=\"font-size: 13.5px\">ขั้นตอน</strong>\n                <sc-for list=\"{{les.steps}}\" as=\"stp\" hint-placeholder-count=\"4\">\n                  <div style=\"display: flex; align-items: flex-start; gap: 9px; font-size: 13px; line-height: 1.5; color: #19261E\"><span class=\"g-mono\" style=\"flex: 0 0 auto; width: 24px; height: 24px; border-radius: 50%; background: #0B7D43; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600\">{{stp.n}}</span><span style=\"padding-top: 2px\">{{stp.t}}</span></div>\n                </sc-for>\n              </div>\n              <div style=\"flex: 1 1 300px; display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid rgba(25,38,30,.12); border-radius: 16px; background: #FFFFFF\">\n                <strong style=\"font-size: 13.5px\">ตัวอย่าง</strong>\n                <span style=\"font-size: 13px; color: #2E3B33\">ข้อมูลกิจกรรม: {{les.ex.ad}}</span>\n                <span style=\"font-size: 13px; color: #2E3B33\">ค่าการปล่อย: {{les.ex.ef}}</span>\n                <span class=\"g-mono\" style=\"font-size: 13px; color: #19261E\">{{les.ex.calc}}</span>\n                <strong class=\"g-h\" style=\"font-size: 19px; font-weight: 600; color: #0B7D43\">= {{les.ex.res}}</strong>\n                <sc-if value=\"{{les.hasGwpEx}}\" hint-placeholder-val=\"{{ true }}\"><span class=\"g-mono\" style=\"padding-top: 6px; border-top: 1px dashed rgba(25,38,30,.25); font-size: 12.5px; color: #1E5A1B\">ถ้าเป็นรายก๊าซ: {{les.gwpEx}}</span></sc-if>\n              </div>\n            </div>\n          </div>\n        </sc-if>\n\n        <sc-if value=\"{{les.isEvidence}}\" hint-placeholder-val=\"{{ false }}\">\n          <div style=\"display: flex; flex-direction: column; gap: 12px\">\n            <div style=\"display: flex; flex-direction: column; gap: 8px\">\n              <strong class=\"g-h\" style=\"font-size: 16px; font-weight: 500\">3 หลักการของทีมมาสคอต · หัวใจของการทวนสอบ</strong>\n              <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px\">\n                <sc-for list=\"{{les.principles}}\" as=\"pc\" hint-placeholder-count=\"3\">\n                  <div style=\"display: flex; align-items: center; gap: 10px; padding: 10px 12px 10px 6px; border-radius: 18px; background: {{pc.soft}}\">\n                    <span class=\"g-fig\" aria-hidden=\"true\" style=\"width: 88px; height: 88px; background-image: {{pc.fig.img}}; background-size: {{pc.fig.size}}; background-position: {{pc.fig.pos}}\"></span>\n                    <div style=\"display: flex; flex-direction: column; gap: 2px; min-width: 0\">\n                      <strong class=\"g-h\" style=\"font-size: 16px; font-weight: 600; color: {{pc.ink}}\">{{pc.principle}}</strong>\n                      <span class=\"g-mono\" style=\"font-size: 11.5px; font-weight: 600; color: {{pc.ink}}\">{{pc.en}} · {{pc.name}}</span>\n                      <span style=\"font-size: 12.5px; line-height: 1.5; color: #19261E\">“{{pc.motto}}”</span>\n                      <span style=\"font-size: 12px; line-height: 1.5; color: #3A463F\">{{pc.bio}}</span>\n                    </div>\n                  </div>\n                </sc-for>\n              </div>\n            </div>\n            <div style=\"display: flex; flex-wrap: wrap; gap: 12px\">\n              <div style=\"flex: 1.2 1 320px; display: flex; flex-direction: column; gap: 8px\">\n                <strong style=\"font-size: 13.5px\">ลำดับคุณภาพข้อมูล (ดีที่สุด → ต่ำสุด)</strong>\n                <sc-for list=\"{{les.ladder}}\" as=\"ld\" hint-placeholder-count=\"4\">\n                  <div style=\"display: flex; flex-direction: column; gap: 4px\">\n                    <div style=\"width: {{ld.w}}; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 11px; border-radius: 12px; background: {{ld.color}}; color: #FFFFFF\">\n                      <strong style=\"font-size: 13.5px\">{{ld.t}}</strong>\n                      <span style=\"font-size: 11.5px; font-weight: 600; white-space: nowrap; opacity: .92\">{{ld.level}}</span>\n                    </div>\n                    <span style=\"padding-left: 4px; font-size: 12px; line-height: 1.45; color: #4A574F\">{{ld.ex}}</span>\n                  </div>\n                </sc-for>\n              </div>\n              <div style=\"flex: 1 1 280px; display: flex; flex-direction: column; gap: 7px; padding: 12px; border-radius: 16px; background: #E8EFEA\">\n                <strong style=\"font-size: 13.5px; color: #1F3A2B\">ผู้ทวนสอบจะตรวจ</strong>\n                <sc-for list=\"{{les.checks}}\" as=\"ck\" hint-placeholder-count=\"5\">\n                  <div style=\"display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.5; color: #1F3A2B\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0B7D43\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex: 0 0 auto; margin-top: 2px\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-5\"></path></svg><span>{{ck.t}}</span></div>\n                </sc-for>\n              </div>\n            </div>\n          </div>\n        </sc-if>\n\n        <div style=\"display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border: 1px solid rgba(25,38,30,.1); border-radius: 16px; background: #FFFFFF\">\n          <strong style=\"font-size: 13.5px\">ประเด็นสำคัญ</strong>\n          <sc-for list=\"{{les.points}}\" as=\"pt\" hint-placeholder-count=\"4\"><div style=\"display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; line-height: 1.55; color: #19261E\"><span style=\"flex: 0 0 auto; width: 7px; height: 7px; margin-top: 8px; border-radius: 50%; background: #42B236\"></span>{{pt.t}}</div></sc-for>\n        </div>\n\n        <div style=\"display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px\">\n          <div aria-hidden=\"true\" style=\"display: flex; gap: 5px\">\n            <sc-for list=\"{{les.dots}}\" as=\"ld2\" hint-placeholder-count=\"4\"><span style=\"width: {{ld2.w}}; height: 8px; border-radius: 999px; background: {{ld2.bg}}\"></span></sc-for>\n          </div>\n          <div style=\"display: flex; flex-wrap: wrap; gap: 8px\">\n            <sc-if value=\"{{les.isFlow}}\" hint-placeholder-val=\"{{ true }}\">\n              <button type=\"button\" class=\"g-link\" onClick=\"{{lesSkip}}\" style=\"min-height: 44px\">{{les.skipLabel}}</button>\n            </sc-if>\n            <sc-if value=\"{{les.hasPrev}}\" hint-placeholder-val=\"{{ false }}\">\n              <button type=\"button\" class=\"g-btn2\" onClick=\"{{lesPrev}}\">\n                <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M19 12H5.5M11 6l-6 6 6 6\"></path></svg>\n                ย้อนกลับ\n              </button>\n            </sc-if>\n            <button type=\"button\" class=\"g-btn\" onClick=\"{{lesNext}}\">\n              {{les.nextLabel}}\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 12h13.5M13 6l6 6-6 6\"></path></svg>\n            </button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n\n  <sc-if value=\"{{showOutro}}\" hint-placeholder-val=\"{{ false }}\">\n    <div style=\"position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; padding: 14px; box-sizing: border-box; background: rgba(25,38,30,.48)\">\n      <div class=\"g-confl\" aria-hidden=\"true\">\n        <sc-for list=\"{{confetti}}\" as=\"cf\" hint-placeholder-count=\"36\"><span class=\"g-conf\" style=\"left: {{cf.l}}; width: {{cf.w}}; height: {{cf.h}}; background: {{cf.bg}}; border-radius: {{cf.r}}; animation: {{cf.anim}}\"></span></sc-for>\n      </div>\n      <div class=\"ghg-scroll ghg-anim g-panel\" role=\"dialog\" aria-label=\"ใบประกาศนียบัตรและสรุปการเดินทาง\" style=\"position: relative; z-index: 1; width: min(1000px, 100%); max-height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding: 16px; border-radius: 26px; background: #EEF2F0\">\n        <div class=\"g-cert\">\n          <span class=\"g-mono\" style=\"font-size: 11.5px; font-weight: 600; line-height: 1.5; color: #2E7A26\"><span style=\"letter-spacing: .14em\">GHG TOWN 3D</span> · {{town.name}}</span>\n          <h2 class=\"g-h g-cert-t\">ใบประกาศนียบัตร</h2>\n          <div class=\"g-orn\" aria-hidden=\"true\"><span class=\"g-ol\"></span><span class=\"g-dia\" style=\"background: #42B236\"></span><span class=\"g-dia\" style=\"background: #10C0E5\"></span><span class=\"g-dia\" style=\"background: #FFB703\"></span><span class=\"g-ol g-or\"></span></div>\n          <p style=\"margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: #3A463F\">ให้ไว้เพื่อแสดงว่าผู้ร่วมอบรม</p>\n          <input ref=\"{{nameRef}}\" class=\"g-name g-h\" type=\"text\" maxlength=\"80\" autocomplete=\"name\" placeholder=\"พิมพ์ชื่อ-นามสกุลของคุณที่นี่\" aria-label=\"ชื่อผู้ร่วมอบรมบนใบประกาศนียบัตร\">\n          <p class=\"g-h\" style=\"margin: 0; font-size: 23px; line-height: 1.35; font-weight: 500; color: #19261E\">ผ่านการเดินทัวร์ทวนสอบเมืองคาร์บอน (CFO)</p>\n          <div style=\"width: 100%; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px 26px; padding: 4px 0 2px\">\n            <div aria-hidden=\"true\" style=\"flex: 0 0 auto; display: flex; align-items: flex-end\">\n              <sc-for list=\"{{outroFigs}}\" as=\"of\" hint-placeholder-count=\"3\"><span class=\"g-fig\" style=\"width: {{of.sz}}; height: {{of.sz}}; animation: {{of.anim}}; background-image: {{of.img}}; background-size: {{of.size}}; background-position: {{of.pos}}\"></span></sc-for>\n            </div>\n            <div style=\"flex: 1 1 340px; max-width: 470px; display: flex; flex-direction: column; gap: 8px; text-align: left\">\n              <div style=\"display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 6px 12px\">\n                <div style=\"display: flex; flex-direction: column; gap: 0\">\n                  <span style=\"font-size: 12.5px; font-weight: 600; color: #4A574F\">ผลการทวนสอบ · ตอบถูก</span>\n                  <strong class=\"g-h\" style=\"font-size: 46px; line-height: 1.05; font-weight: 600; color: #0B7D43\">{{score}}<span style=\"font-size: 21px; font-weight: 500; color: #4A574F\"> / {{total}} จุด</span></strong>\n                </div>\n                <span class=\"g-chip\" style=\"padding: 4px 11px; background: #0B7D43; color: #FFFFFF; font-size: 12.5px\">\n                  <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"#FFB703\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 3.2l2.7 5.5 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.4-4.2 6-.9z\"></path></svg>\n                  {{outro.scoreTitle}}\n                </span>\n              </div>\n              <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 7px\">\n                <sc-for list=\"{{sGroups}}\" as=\"sg\" hint-placeholder-count=\"4\">\n                  <div style=\"display: flex; flex-direction: column; gap: 4px; padding: 7px 9px 8px; border-radius: 12px; background: {{sg.soft}}; border-top: 4px solid {{sg.color}}\">\n                    <span style=\"font-size: 11.5px; font-weight: 600; line-height: 1.3; color: {{sg.ink}}\">{{sg.label}}</span>\n                    <strong class=\"g-mono\" style=\"font-size: 16px; line-height: 1.2; color: {{sg.ink}}\">{{sg.score}}</strong>\n                    <span aria-hidden=\"true\" style=\"display: block; height: 5px; border-radius: 999px; background: rgba(255,253,248,.9); overflow: hidden\"><span style=\"display: block; width: {{sg.w}}; height: 5px; border-radius: 999px; background: {{sg.color}}\"></span></span>\n                  </div>\n                </sc-for>\n              </div>\n              <span style=\"font-size: 12px; line-height: 1.5; color: #55625A\">{{cert.answered}}</span>\n            </div>\n          </div>\n          <div style=\"width: 100%; display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; gap: 10px 18px; margin-top: 6px\">\n            <div style=\"min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 4px\">\n              <span class=\"g-h\" style=\"font-size: 16px; line-height: 1.4; font-weight: 500; color: #19261E\">{{cert.date}}</span>\n              <span aria-hidden=\"true\" style=\"display: block; width: 100%; max-width: 240px; border-top: 1px solid rgba(30,60,47,.5)\"></span>\n              <span style=\"font-size: 12px; color: #55625A\">ให้ไว้ ณ วันที่</span>\n            </div>\n            <span class=\"g-seal\" aria-hidden=\"true\">\n              <span>\n                <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#2E7A26\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path d=\"M5 19c0-8 5.5-13.5 14-14 0 8.5-5.5 14-14 14z\"></path><path d=\"M5 19l7-7\"></path></svg>\n                <strong class=\"g-h\" style=\"font-size: 17px; font-weight: 600\">GCC</strong>\n                <span style=\"font-size: 10px; font-weight: 600; color: #2E3B33\">ทวนสอบ</span>\n              </span>\n            </span>\n            <div style=\"min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 4px\">\n              <svg width=\"150\" height=\"34\" viewBox=\"0 0 150 34\" fill=\"none\" stroke=\"#0B7D43\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M6 26c7-1 10-18 18-18 6 0-1 18 5 18s10-13 17-13c5 0 2 9 7 9 7 0 9-11 17-11 5 0 3 8 8 8 8 0 12-9 20-9 5 0 7 5 12 5h30\"></path><path d=\"M22 31c32 2 68 1 110-4\" stroke-width=\"1.3\" opacity=\".55\"></path></svg>\n              <span aria-hidden=\"true\" style=\"display: block; width: 100%; max-width: 240px; border-top: 1px solid rgba(30,60,47,.5)\"></span>\n              <span style=\"font-size: 12px; line-height: 1.45; color: #55625A; text-align: center\">ทีมมาสคอต GCC · หน่วยทวนสอบ GCC</span>\n            </div>\n          </div>\n          <span style=\"display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; padding: 3px 11px; border-radius: 999px; background: #EEF2F0; font-size: 11.5px; font-weight: 600; line-height: 1.5; color: #4A574F\">\n            <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 11v5.5M12 7.6v.4\"></path></svg>\n            ข้อมูลตัวอย่างเพื่อการสอน\n          </span>\n        </div>\n        <div style=\"display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px\">\n          <span class=\"g-chip\" style=\"background: #FFF2CC; color: #6B4A00\">จุดชมวิวบนเนินป่าชุมชน · ตอนจบ</span>\n          <div style=\"display: flex; flex-wrap: wrap; gap: 8px\">\n            <button type=\"button\" class=\"g-btn2\" onClick=\"{{printCert}}\" title=\"ใส่ชื่อบนใบประกาศก่อน แล้วพิมพ์หรือเลือก “บันทึกเป็น PDF”\">\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7 8.5V3.5h10v5\"></path><rect x=\"3.5\" y=\"8.5\" width=\"17\" height=\"8\" rx=\"2\"></rect><path d=\"M7 14h10v6.5H7z\"></path></svg>\n              พิมพ์ / บันทึก PDF\n            </button>\n            <button type=\"button\" class=\"g-btn2\" onClick=\"{{goTable}}\">\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2\"></rect><path d=\"M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15\"></path></svg>\n              ดูตารางสรุป\n            </button>\n            <button type=\"button\" class=\"g-btn2\" onClick=\"{{keepWalking}}\">\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><circle cx=\"13\" cy=\"4.5\" r=\"1.8\"></circle><path d=\"M11 21l2-6-2.5-2.5 1-4.5 3 3 3 1\"></path><path d=\"M10.5 8.5 7 10.5 6 14M13 15l3 6\"></path></svg>\n              เดินสำรวจต่อ\n            </button>\n            <button type=\"button\" class=\"g-btn\" onClick=\"{{restart}}\">\n              <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 12a8 8 0 1 0 2.4-5.7\"></path><path d=\"M4 4.5v4h4\"></path></svg>\n              เริ่มใหม่\n            </button>\n          </div>\n        </div>\n        <div style=\"display: flex; flex-direction: column; gap: 10px; padding: 14px 16px 6px; border-radius: 18px; background: #FFFFFF; border: 1px solid rgba(25,38,30,.08)\">\n          <strong class=\"g-h\" style=\"font-size: 18px; font-weight: 600\">{{outro.title}}</strong>\n          <div class=\"g-cols\">\n            <sc-for list=\"{{outro.lines}}\" as=\"ol\" hint-placeholder-count=\"4\">\n              <div style=\"display: flex; align-items: flex-start; gap: 10px\">\n                <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 38px; height: 38px; background-color: {{ol.pic.bg}}; background-image: {{ol.pic.img}}; background-size: {{ol.pic.size}}; background-position: {{ol.pic.pos}}\"></span>\n                <p style=\"margin: 0; padding-top: 6px; font-size: 14px; line-height: 1.6; color: #19261E\"><strong class=\"g-h\" style=\"font-weight: 500; color: {{ol.color}}\">{{ol.name}}: </strong>{{ol.t}}</p>\n              </div>\n            </sc-for>\n          </div>\n        </div>\n        <div style=\"display: flex; flex-direction: column; gap: 8px\">\n          <strong class=\"g-h\" style=\"font-size: 17px; font-weight: 500\">{{outro.tkCount}} ข้อที่ควรจำกลับไปใช้งาน</strong>\n          <div style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px\">\n            <sc-for list=\"{{outro.takeaways}}\" as=\"tk\" hint-placeholder-count=\"6\">\n              <div style=\"display: flex; align-items: flex-start; gap: 10px; padding: 12px; border: 1px solid rgba(25,38,30,.1); border-radius: 16px; background: #FFFFFF\">\n                <span class=\"g-h\" style=\"flex: 0 0 auto; width: 30px; height: 30px; border-radius: 10px; background: {{tk.bg}}; color: {{tk.fg}}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600\">{{tk.n}}</span>\n                <div style=\"display: flex; flex-direction: column; gap: 3px\">\n                  <strong style=\"font-size: 14px; line-height: 1.4\">{{tk.t}}</strong>\n                  <span style=\"font-size: 12.5px; line-height: 1.55; color: #3A463F\">{{tk.d}}</span>\n                </div>\n              </div>\n            </sc-for>\n          </div>\n        </div>\n      </div>\n    </div>\n  </sc-if>\n</section>\n\n<sc-if value=\"{{isTable}}\" hint-placeholder-val=\"{{ false }}\">\n  <section aria-label=\"ตารางสรุป\" style=\"display: flex; flex-direction: column; gap: 12px; padding: 18px 18px 20px; border: 1px solid rgba(25,38,30,.12); border-radius: 24px; background: #FFFFFF\">\n    <div style=\"display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px\">\n      <div style=\"display: flex; align-items: center; gap: 10px\">\n        <span class=\"g-av\" aria-hidden=\"true\" style=\"width: 44px; height: 44px; background-color: {{tablePic.bg}}; background-image: {{tablePic.img}}; background-size: {{tablePic.size}}; background-position: {{tablePic.pos}}\"></span>\n        <h2 class=\"g-h\" style=\"margin: 0; font-size: 20px; font-weight: 600\">ตารางสรุป {{total}} จุด · ข้อมูลกิจกรรม ค่าการปล่อย และผลการคำนวณ</h2>\n      </div>\n      <span class=\"g-k\">กดชื่อจุดเพื่อให้ทีมมาสคอตพาไปที่จุดนั้น</span>\n    </div>\n    <p style=\"margin: 0; padding: 10px 12px; border-radius: 14px; background: #F2F5F3; font-size: 13px; line-height: 1.6; color: #2E3B33\">แต่ละแถวเป็นตัวอย่างของ<strong>องค์กรผู้รายงานคนละราย</strong> (ร้านค้า เทศบาล โรงพยาบาล โรงสี ฟาร์ม ฯลฯ) ผลรวมด้านล่างจึงใช้เพื่อเปรียบเทียบขนาดเท่านั้น ไม่ใช่บัญชีขององค์กรใดองค์กรหนึ่ง และการดูดกลับต้องรายงานแยกจากการปล่อย</p>\n    <div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px\">\n      <sc-for list=\"{{totals}}\" as=\"tt\" hint-placeholder-count=\"4\">\n        <div style=\"display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border-radius: 16px; background: {{tt.soft}}; border-top: 4px solid {{tt.color}}\">\n          <span style=\"display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: {{tt.ink}}\">{{tt.label}} · {{tt.n}}</span>\n          <strong class=\"g-h\" style=\"font-size: 20px; font-weight: 600; color: {{tt.ink}}\">{{tt.sum}}</strong>\n        </div>\n      </sc-for>\n    </div>\n    <div style=\"overflow-x: auto; border: 1px solid rgba(25,38,30,.1); border-radius: 16px\">\n      <div role=\"table\" aria-label=\"ตารางสรุป 19 จุด\" style=\"min-width: 1080px\">\n        <div role=\"row\" style=\"display: grid; grid-template-columns: 50px 112px 72px minmax(220px, 1.7fr) minmax(150px, 1.1fr) minmax(150px, 1.1fr) 104px 92px; background: #EEF2F0; font-size: 12.5px; font-weight: 600; color: #2E3B33\">\n          <span role=\"columnheader\" style=\"padding: 10px 12px\">#</span>\n          <span role=\"columnheader\" style=\"padding: 10px 12px\">ประเภท</span>\n          <span role=\"columnheader\" style=\"padding: 10px 12px\">ISO</span>\n          <span role=\"columnheader\" style=\"padding: 10px 12px\">แหล่งปล่อย / องค์กร</span>\n          <span role=\"columnheader\" style=\"padding: 10px 12px\">ข้อมูลกิจกรรม</span>\n          <span role=\"columnheader\" style=\"padding: 10px 12px\">EF / ตัวคูณ</span>\n          <span role=\"columnheader\" style=\"padding: 10px 12px; text-align: right\">ผล (tCO₂e)</span>\n          <span role=\"columnheader\" style=\"padding: 10px 12px\">สถานะ</span>\n        </div>\n        <sc-for list=\"{{rows}}\" as=\"r\" hint-placeholder-count=\"19\">\n          <div role=\"row\" style=\"display: grid; grid-template-columns: 50px 112px 72px minmax(220px, 1.7fr) minmax(150px, 1.1fr) minmax(150px, 1.1fr) 104px 92px; align-items: center; border-top: 1px solid rgba(25,38,30,.08); font-size: 13px; color: #19261E\">\n            <span role=\"cell\" style=\"padding: 9px 12px\"><span class=\"g-mono\" style=\"display: inline-flex; width: 28px; height: 28px; border-radius: 9px; align-items: center; justify-content: center; background: {{r.color}}; color: {{r.badgeFg}}; font-size: 12.5px; font-weight: 600\">{{r.n}}</span></span>\n            <span role=\"cell\" style=\"padding: 9px 12px\"><span class=\"g-chip\" style=\"padding: 3px 9px; background: {{r.soft}}; color: {{r.ink}}\">{{r.scope}}</span></span>\n            <span role=\"cell\" style=\"padding: 9px 12px; font-size: 12px; color: #3A463F; white-space: nowrap\">{{r.iso}}</span>\n            <span role=\"cell\" style=\"padding: 9px 12px; display: flex; flex-direction: column; gap: 3px\">\n              <button type=\"button\" onClick=\"{{r.pick}}\" style=\"align-self: flex-start; padding: 0; border: 0; background: transparent; color: #19261E; font-size: 13.5px; font-weight: 600; line-height: 1.45; text-align: left; cursor: pointer; text-decoration: underline; text-decoration-color: rgba(25,38,30,.3); text-underline-offset: 3px\">{{r.title}}</button>\n              <span style=\"font-size: 12px; color: #55625A\">{{r.org}}</span>\n              <span style=\"display: flex; flex-wrap: wrap; gap: 4px\"><sc-for list=\"{{r.gases}}\" as=\"rg\" hint-placeholder-count=\"2\"><span style=\"padding: 1px 7px; border-radius: 7px; background: #EEF2F0; color: #2E3B33; font-size: 11.5px; font-weight: 600; line-height: 1.6\">{{rg.t}}</span></sc-for></span>\n            </span>\n            <span role=\"cell\" class=\"g-mono\" style=\"padding: 9px 12px; font-size: 12.5px; line-height: 1.5\">{{r.ad}}</span>\n            <span role=\"cell\" class=\"g-mono\" style=\"padding: 9px 12px; font-size: 12.5px; line-height: 1.5\">{{r.ef}}</span>\n            <span role=\"cell\" class=\"g-mono\" style=\"padding: 9px 12px; text-align: right; font-size: 13px; font-weight: 600; color: {{r.ink}}\">{{r.res}}</span>\n            <span role=\"cell\" style=\"padding: 9px 12px\"><span class=\"g-chip\" style=\"padding: 3px 8px; background: {{r.stBg}}; color: {{r.stFg}}; font-size: 11.5px\">{{r.stText}}</span></span>\n          </div>\n        </sc-for>\n      </div>\n    </div>\n  </section>\n</sc-if>\n\n<footer style=\"font-size: 12px; line-height: 1.6; color: #4A574F\">อ้างอิง: IPCC 2006 Guidelines · GWP100 ตาม IPCC AR5 · ค่า EF ของ อบก. สำหรับ CFO · EF ไฟฟ้า 0.4750 kgCO₂e/kWh — ตัวเลขทั้งหมดเป็นตัวอย่างสมมติเพื่อการสอน ไม่ใช่ข้อมูลขององค์กรจริง · มาสคอต: น้องทวน น้องกล้า น้องส่อง (หน่วยทวนสอบ GCC)</footer>\n\n</div>\n";
class Component extends DCLogic {
  // ================================================================ CONTENT ACCESS
  _uC() { return window.GHGTownContent || null; }
  _uSt() { return this.state || {}; }
  _uStops() { const C = this._uC(); return (C && Array.isArray(C.stops)) ? C.stops : []; }
  _uStop(id) { return this._uStops().find((s) => s.id === id) || null; }
  _uLessons() { const C = this._uC(); return (C && Array.isArray(C.lessons)) ? C.lessons : []; }
  // call an engine method if the engine provides it
  _uE(name) {
    if (typeof this[name] !== 'function') return undefined;
    const args = Array.prototype.slice.call(arguments, 1);
    try { return this[name].apply(this, args); } catch (err) { console.error('[GHG UI] ' + name, err); }
    return undefined;
  }
  _uHas(name) { return typeof this[name] === 'function'; }
  // clear engine-owned state keys (and the engine's diff cache, so its next write is not swallowed)
  _uClearE(patch) {
    const E = this._E;
    if (E && E.uiCache) for (const k in patch) E.uiCache[k] = patch[k];
    this.setState(patch);
  }
  _uNext(after, answers) {
    const a = answers || this._uSt().answers || {};
    const pend = this._uStops().filter((s) => a[s.id] == null);
    if (!pend.length) return null;
    const later = pend.find((s) => s.id > (after || 0));
    return (later || pend[0]).id;
  }

  // ================================================================ SAVED PROGRESS (v0.8): browser storage; the page also works without it
  _uStoreKey() { return 'ghg-town-3d:v1'; }
  _uLoad() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(this._uStoreKey()) : null;
      const d = raw ? JSON.parse(raw) : null;
      return d && typeof d === 'object' ? d : null;
    } catch (err) { return null; }
  }
  // patch = state values just set (setState may not have landed yet)
  _uSave(patch) {
    const st = Object.assign({}, this._uSt(), patch || {});
    const E = this._E;
    if (E && E.player && E.ctl === 'walk' && st.started && st.mode === 'explore') {
      const P = E.player;
      this.__uPos = [Math.round(P.x * 10) / 10, Math.round(P.z * 10) / 10, Math.round(P.yaw * 100) / 100];
    }
    const d = {
      v: 1, t: Date.now(), answers: st.answers || {}, clues: st.clues || {}, weather: st.weather || 'day',
      labels: st.labels == null ? true : !!st.labels, sound: st.sound == null ? true : !!st.sound,
      name: String(st.trainee || '').slice(0, 80), pos: this.__uPos || null,
      narr: st.narr == null ? true : !!st.narr, film: st.filmAuto == null ? true : !!st.filmAuto
    };
    try { window.localStorage.setItem(this._uStoreKey(), JSON.stringify(d)); } catch (err) { /* storage blocked: progress lives in this tab only */ }
  }
  _uRestore() {
    const d = this._uLoad();
    if (!d) return;
    const answers = {}, clues = {};
    for (const s of this._uStops()) {
      const v = d.answers ? d.answers[s.id] : null;
      if (Number.isInteger(v) && v >= 0 && v < (s.opts || []).length) answers[s.id] = v;
      if (d.clues && d.clues[s.id]) clues[s.id] = true;
    }
    const patch = { answers: answers, clues: clues, trainee: typeof d.name === 'string' ? d.name.slice(0, 80) : '' };
    if (['day', 'evening', 'night', 'rain', 'auto'].indexOf(d.weather) >= 0) patch.weather = d.weather;
    if (typeof d.labels === 'boolean') patch.labels = d.labels;
    if (typeof d.sound === 'boolean') patch.sound = d.sound;
    if (typeof d.narr === 'boolean') patch.narr = d.narr;
    if (typeof d.film === 'boolean') patch.filmAuto = d.film;
    patch.photos = this._uLoadPhotos();
    this.__uPos = Array.isArray(d.pos) && d.pos.length >= 2 && d.pos.every((v) => typeof v === 'number' && isFinite(v)) ? d.pos : null;
    this.setState(patch);
    this.__uSyncE = null;   // re-apply pins, weather, labels and sound to the engine on the next render
  }
  // continue a saved game: straight into exploring, back where the player stood
  _uResume() {
    const pos = this.__uPos;
    if (pos) {
      if (this._E && this._E.player && this._uHas('_eTeleport')) this._uE('_eTeleport', pos[0], pos[1], pos[2]);
      else this.__uTele = pos;
    }
    this._uExplore();
  }
  _uClearProgress() {
    const st = this._uSt();
    if (!st.clearAsk) { this.setState({ clearAsk: true }); return; }
    this.__uPos = null;
    this.__uTele = null;
    // a full wipe (e.g. the next trainee on a shared computer): the name goes too
    this.setState({ answers: {}, clues: {}, clearAsk: false, trainee: '', photos: {} });
    try { window.localStorage.removeItem(this._uStoreKey() + ':photos'); } catch (err) { /* ignore */ }
    this._uE('_eFilmReset');
    for (const s of this._uStops()) this._uE('_eAnswered', s.id, null);
    this._uSave({ answers: {}, clues: {}, trainee: '' });
  }

  // ================================================================ MASCOT TEAM
  _uSheets() {
    return {
      owl: 'assets/owl.webp',
      sapling: 'assets/sapling.webp',
      firefly: 'assets/firefly.webp'
    };
  }
  // 5 x 5 sprite sheets (240 px cells), row-major
  _uCells() {
    return [
      'hero', 'neutral', 'curious', 'inspect', 'surprised',
      'relieved', 'explain', 'wai', 'askdocs', 'thinking',
      'wave', 'jump', 'run', 'read', 'sign',
      'site', 'rain', 'grad', 'farmer', 'forest',
      'recycle', 'lab', 'thai', 'train', 'desk'
    ];
  }
  _uTeam() {
    const C = this._uC();
    const T = (C && C.team) || {};
    const D = {
      owl: { id: 'owl', name: 'น้องทวน', species: 'นกฮูก', motto: 'ทุกตัวเลขต้องมีที่มา', principle: 'ยึดหลักฐาน', principleEn: 'Evidence-based', role: 'หัวหน้าทีมทวนสอบ', bio: 'ทุกตัวเลขในรายงานต้องย้อนกลับไปหาหลักฐานต้นทางได้', color: '#3F5F4A', soft: '#E3ECE5', ink: '#1F3A2B' },
      sapling: { id: 'sapling', name: 'น้องกล้า', species: 'ต้นกล้า', motto: 'ครบทุกปี เทียบกันได้', principle: 'ความสอดคล้อง', principleEn: 'Consistency', role: 'ดูแลความสอดคล้องและการดูดกลับ', bio: 'ใช้วิธีคำนวณ ขอบเขต และแหล่งค่าเดิมทุกปี เพื่อให้เทียบแนวโน้มได้', color: '#3E9B3A', soft: '#E3F2DE', ink: '#1E5A1B' },
      firefly: { id: 'firefly', name: 'น้องส่อง', species: 'หิ่งห้อย', motto: 'ส่องให้ชัด ไม่มีมุมมืด', principle: 'ความโปร่งใส', principleEn: 'Transparency', role: 'ส่องแหล่งปล่อยและที่มาของข้อมูล', bio: 'เปิดเผยที่มา สมมติฐาน และข้อจำกัดของข้อมูลให้ผู้อ่านตรวจสอบได้', color: '#24495A', soft: '#DFEDF2', ink: '#173847' }
    };
    const out = {};
    for (const k of ['owl', 'sapling', 'firefly']) {
      const src = T[k] && typeof T[k] === 'object' ? T[k] : {};
      const o = Object.assign({}, D[k]);
      for (const f in src) if (src[f] != null && src[f] !== '') o[f] = src[f];
      out[k] = o;
    }
    return out;
  }
  _uWho(w) { return w === 'sapling' || w === 'firefly' ? w : 'owl'; }
  // normalise a dialogue line (string or {who, mood, t}) to {who, mood, t}
  _uLine(x, dWho, dMood) {
    if (x && typeof x === 'object') return { who: this._uWho(x.who || dWho), mood: String(x.mood || dMood || 'neutral'), t: String(x.t != null ? x.t : (x.text || '')) };
    return { who: this._uWho(dWho), mood: dMood || 'neutral', t: String(x == null ? '' : x) };
  }
  _uLines(objs, strs, dWho, dMood) {
    const src = Array.isArray(objs) && objs.length ? objs : (Array.isArray(strs) ? strs : []);
    return src.map((o) => this._uLine(o, dWho, dMood)).filter((l) => l.t);
  }
  _uStopLines(s) { return s ? this._uLines(s.lines, s.guide, 'owl', 'explain') : []; }

  // ---------------- explore mode content (v0.6), with fallbacks for older content
  _uGuideLines(key) {
    const C = this._uC();
    const G = (C && C.guide) || {};
    const D = {
      exploreIntro: [
        { who: 'owl', mood: 'wave', t: 'ยินดีต้อนรับสู่เมืองคาร์บอนครับ วันนี้เดินสำรวจได้ตามใจ ทีมเราจะเดินตามไปด้วยครับ' },
        { who: 'firefly', mood: 'explain', t: 'เห็นฟอง ? ลอยอยู่ตรงไหน เดินเข้าไปใกล้ ๆ เลย! จะมีปริศนาให้ทายว่าแหล่งปล่อยซ่อนอยู่ตรงไหน' },
        { who: 'sapling', mood: 'explain', t: 'เดาได้แล้วก็เล็งเป้ากลางจอไปที่แหล่งปล่อยนั้นครับ หาไม่เจอกด H ขอคำใบ้ได้ครับ' }
      ],
      foundLines: [{ who: 'firefly', mood: 'jump', t: 'เจอแล้ว! ตาไวสุด ๆ ไปเลย' }],
      hintLines: [{ who: 'firefly', mood: 'explain', t: 'ตามแสงหนูไปเลย! บินนำทางให้แล้วนะ' }],
      mysteryLines: [{ who: 'firefly', mood: 'curious', t: 'เอ๊ะ ตรงนี้มีอะไรแปลก ๆ นะ!' }]
    };
    const L = this._uLines(G[key], null, 'firefly', 'curious');
    return L.length ? L : (D[key] || []).map((l) => this._uLine(l));
  }
  // riddle, seek instruction, clue and area of a stop
  _uRiddle(s) {
    const C = this._uC();
    const DIS = (C && C.districts) || {};
    const area = String((s && (s.area || s.place || DIS[s.district])) || '');
    let line = s && s.riddle ? this._uLine(s.riddle, 'firefly', 'curious') : null;
    if (!line || !line.t) line = { who: 'firefly', mood: 'curious', t: 'แถวนี้มีแหล่งปล่อยก๊าซเรือนกระจกซ่อนอยู่ ลองเดาดูว่าเป็นอะไร แล้วมองหาให้เจอ!' };
    return {
      line: line,
      seek: String((s && s.seek) || ('มองหาแหล่งปล่อยรอบ ๆ ' + (area || 'บริเวณนี้'))),
      clue: String((s && (s.clue || s.scene)) || ''),
      area: area
    };
  }
  // nearest unsolved stop to the player (engine positions when available, else the next in order)
  _uNearestUnsolved() {
    const E = this._E;
    const a = this._uSt().answers || {};
    if (E && E.anchors && E.player) {
      let best = null, bd = Infinity;
      for (const k in E.anchors) {
        const id = +k;
        const an = E.anchors[k];
        if (!an || !an.view || a[id] != null || !this._uStop(id)) continue;
        const d = Math.hypot(E.player.x - an.view[0], E.player.z - an.view[1]);
        if (d < bd) { bd = d; best = id; }
      }
      if (best != null) return best;
    }
    return this._uNext(0);
  }

  // ---------------- context outfits: portraits mirror the 3D mascots' hats (grad > site > rain > district)
  _uOutfitOf(d) {
    const M = { farm: 'farmer', forest: 'forest', landfill: 'recycle', hospital: 'lab', school: 'train', civic: 'desk', industry: 'site', temple: 'thai' };
    return (d && M[d]) || null;
  }
  // district id from the name the engine reports (layout names first, then content names, then keywords)
  _uDistrictId(name) {
    const s = String(name || '').trim();
    if (!s) return null;
    const L = window.GHG3L && Array.isArray(window.GHG3L.districts) ? window.GHG3L.districts : [];
    for (const d of L) if (d && d.name === s && d.id) return d.id;
    const C = this._uC();
    const DIS = (C && C.districts) || {};
    for (const k in DIS) if (DIS[k] === s) return k;
    const KW = [['forest', /ป่า/], ['landfill', /ขยะ|ฝังกลบ/], ['farm', /เกษตร|ทุ่ง|ฟาร์ม|นาข้าว/], ['hospital', /โรงพยาบาล|อนามัย/], ['school', /โรงเรียน/], ['civic', /ราชการ|เทศบาล|อำเภอ/], ['industry', /อุตสาหกรรม|โรงสี|นิคม|โรงงาน/], ['temple', /^วัด|วัดกลาง/], ['market', /ตลาด|ร้านค้า/]];
    for (const p of KW) if (p[1].test(s)) return p[0];
    return null;
  }
  // inside a helmet interior (mill, boiler room)? shops and the generator room are not
  _uHelmet() {
    const E = this._E;
    const io = E && E.insideObj;
    if (io && typeof io.helmet === 'boolean') return io.helmet;
    return /โรงสี|หม้อไอน้ำ|โรงงาน|นิคม/.test(String(this._uSt().eInside || ''));
  }
  _uCtx(F) {
    const st = this._uSt();
    F = F || this._uFlow();
    if (F.started) {
      const S = this._uStops();
      const a = st.answers || {};
      if (F.step === 'finale' || F.step === 'outro' || (S.length > 0 && S.every((s) => a[s.id] != null))) return 'grad';
    }
    const inside = !!st.eInside;
    if (inside && this._uHelmet()) return 'site';
    if (!inside && st.weather === 'rain') return 'rain';
    const did = F.atStop && F.cur ? F.cur.district : this._uDistrictId(st.eDistrict);
    return this._uOutfitOf(did);
  }
  // sprite cell -> CSS background values. o.k = zoom (1 = whole cell), o.fy = top crop (cell fraction),
  // o.raw = no outfit swap, o.ctx = outfit override (null = none; undefined = live context)
  _uPic(who, mood, o) {
    o = o || {};
    const CELLS = this._uCells();
    const N = 5;
    let m = CELLS.indexOf(mood) >= 0 ? mood : 'neutral';
    if (!o.raw && (m === 'neutral' || m === 'explain' || m === 'curious' || m === 'read')) {
      const ctx = o.ctx !== undefined ? o.ctx : this._uCtx();
      if (ctx && CELLS.indexOf(ctx) >= 0) m = ctx;
    }
    const i = CELLS.indexOf(m);
    const col = i % N;
    const row = Math.floor(i / N);
    const k = o.k || 1;
    const fx = (1 - 1 / k) / 2;
    const fy = o.fy != null ? o.fy : (1 - 1 / k) * 0.12;
    const den = N * k - 1;
    const px = (k * (col + fx)) / den * 100;
    const py = (k * (row + fy)) / den * 100;
    const team = o.team || this._uTeam();
    const w = this._uWho(who);
    const size = (N * 100 * k).toFixed(1) + '%';
    return {
      img: 'url(' + this._uSheets()[w] + ')',
      size: size + ' ' + size,
      pos: px.toFixed(3) + '% ' + py.toFixed(3) + '%',
      bg: o.bg != null ? o.bg : team[w].soft,
      cell: m
    };
  }
  // make the 3D mascot speak (or fall back to the old single guide gestures)
  _uSpeak(who, mood, secs) {
    const M3 = {
      neutral: 'talk', explain: 'explain', inspect: 'inspect', curious: 'curious', surprised: 'surprised', relieved: 'cheer', jump: 'cheer', run: 'cheer',
      thinking: 'think', askdocs: 'think', wave: 'wave', wai: 'wai', read: 'explain', sign: 'explain', hero: 'talk', grad: 'cheer',
      site: 'talk', rain: 'talk', farmer: 'talk', forest: 'talk', recycle: 'talk', lab: 'inspect', thai: 'wai', train: 'explain', desk: 'explain'
    };
    const m = M3[mood] || 'talk';
    if (this._uHas('_eSpeaker')) this._uE('_eSpeaker', this._uWho(who), m, secs || 4);
    else if (m === 'cheer' || m === 'think') this._uE('_eGuide', m, secs || 3);
  }
  // certificate confetti: deterministic, so re-renders never move a piece
  _uConfetti() {
    if (this.__uConf) return this.__uConf;
    const COL = ['#42B236', '#10C0E5', '#FFB703', '#FFFFFF'];
    const out = [];
    for (let i = 0; i < 36; i++) {
      const a = ((i * 37 + 11) % 97) / 97;
      const b = ((i * 53 + 29) % 89) / 89;
      const c = ((i * 71 + 7) % 83) / 83;
      const strip = i % 3 === 0;
      const w = strip ? 4 : 6 + Math.round(b * 5);
      const h = strip ? 11 + Math.round(c * 6) : Math.max(4, Math.round(w * 0.62));
      out.push({
        l: (1.5 + a * 97).toFixed(1) + '%',
        w: w + 'px',
        h: h + 'px',
        bg: COL[i % 4],
        r: !strip && i % 5 === 2 ? '50%' : '1.5px',
        anim: (i % 2 ? 'gConfA ' : 'gConfB ') + (4.8 + c * 3).toFixed(2) + 's linear ' + (b * 3.2).toFixed(2) + 's 2 both'
      });
    }
    this.__uConf = out;
    return out;
  }

  // derived flow flags (shared by renderVals and keyboard handling)
  _uFlow() {
    const st = this._uSt();
    const answers = st.answers || {};
    const engine = typeof this._eTour === 'function' && st.webgl !== false;
    const started = !!st.started;
    const step = started ? (st.step || 'lesson') : 'intro';
    const cur = step === 'go' ? this._uStop(st.target) : null;
    const atStop = !!cur && (!engine || st.eArrived === cur.id);
    const traveling = !!cur && !atStop;
    const lines = this._uStopLines(cur);
    const line = Math.min(st.line || 0, lines.length);
    const answered = !!cur && answers[cur.id] != null;
    const linesLeft = atStop && !answered && line < lines.length;
    const quiz = atStop && (answered || line >= lines.length);
    const gateReady = !engine || !!st.eGate;
    const isMap = (st.view || 'map') === 'map';
    const lessonFlow = started && step === 'lesson' && gateReady;
    const lessonOpen = isMap && (lessonFlow || st.lessonView != null);
    const overOn = engine && st.eMode ? (st.eMode === 'overview' || (st.eMode === 'fly' && !!st.over)) : !!st.over;
    const finaleDone = step === 'outro' || (step === 'finale' && (!engine || typeof this._eFinale !== 'function' || !!st.eFinale));
    // explore mode (v0.6)
    const unsolved = (id) => id != null && !!this._uStop(id) && answers[id] == null;
    const exploring = started && step === 'explore';
    const seek = exploring && st.eSeek != null && this._uStop(st.eSeek) ? st.eSeek : null;
    const found = exploring && seek == null && unsolved(st.eFound) ? st.eFound : null;
    let mystery = null;
    if (exploring && seek == null && found == null) {
      if (unsolved(st.eMystery)) mystery = st.eMystery;
      else if (!this._uHas('_eExplore') && unsolved(st.eNear)) mystery = st.eNear;   // older engine: the nearby stop is the riddle
    }
    const hint = exploring && st.eHint != null && this._uStop(st.eHint) ? st.eHint : null;
    const nearOk = step === 'free' || (exploring && mystery == null && seek == null && found == null);
    const near = started && nearOk && st.eNear != null && this._uStop(st.eNear) ? st.eNear : null;
    return {
      engine: engine, started: started, step: step, cur: cur, atStop: atStop, traveling: traveling, lines: lines, line: line,
      answered: answered, linesLeft: linesLeft, quiz: quiz, gateReady: gateReady, isMap: isMap, lessonFlow: lessonFlow,
      lessonOpen: lessonOpen, overOn: overOn, finaleDone: finaleDone, finaleWait: started && step === 'finale' && !finaleDone,
      showOutro: started && isMap && finaleDone, near: near,
      explore: st.mode === 'explore', exploring: exploring, seek: seek, found: found, mystery: mystery, hint: hint,
      gateWait: started && (step === 'lesson' || step === 'gate') && !gateReady,
      gateChoice: started && step === 'gate' && gateReady,
      gathering: traveling && st.via === 'found'
    };
  }

  // ================================================================ FLOW ACTIONS
  // primary: explore the city and solve riddles
  _uStartExplore() {
    this.setState({ started: true, mode: 'explore', step: 'gate', gateLine: 0, lesson: 0, lessonView: null, target: null, via: null, line: 0, react: null, over: false, view: 'map', drawer: false });
    this._uClearE({ eGate: false, eArrived: null, eFinale: false, eFound: null, eSeek: null, eHint: null });
    this._uE('_eGate');
  }
  _uGateLines() { return this._uGuideLines('exploreIntro'); }
  _uGateNext() {
    const st = this._uSt();
    const n = this._uGateLines().length;
    this.setState({ gateLine: Math.min(Math.max(0, n - 1), (st.gateLine || 0) + 1) });
  }
  _uGateLessons() { this.setState({ step: 'lesson', lesson: 0, lessonView: null }); }
  _uDlgNext() { if (this._uFlow().gateChoice) this._uGateNext(); else this._uLineNext(); }
  _uExplore() {
    this.setState({ started: true, mode: 'explore', step: 'explore', target: null, via: null, line: 0, react: null, over: false, lessonView: null, view: 'map', drawer: false });
    this._uClearE({ eArrived: null, eFound: null, eSeek: null, eAim: 0 });
    if (this._uHas('_eExplore')) this._uE('_eExplore'); else this._uE('_eFree');
  }
  _uToExplore() {
    if (!this._uSt().started) { this._uStartExplore(); return; }
    this._uExplore();
  }
  _uSeek(id) {
    if (!this._uStop(id)) return;
    if (this._uHas('_eSeek') && this._uFlow().engine) this._uE('_eSeek', id);
    else this._uFound(id);
  }
  _uSeekStop() {
    this._uE('_eSeekStop');
    this._uClearE({ eSeek: null, eAim: 0 });
  }
  // reveal the clue; น้องส่อง flies to the source as a beacon (lead = asked from the riddle book)
  _uHint(id, lead) {
    if (!this._uStop(id)) return;
    const st = this._uSt();
    const F = this._uFlow();
    const clues = Object.assign({}, st.clues || {});
    clues[id] = true;
    this.setState({ clues: clues });
    this._uSave({ clues: clues });
    if (!F.engine) { if (lead) this._uFound(id); return; }
    if (this._uHas('_eHint')) this._uE('_eHint', id);
    else if (lead) this._uGo(id, 'explore');
  }
  _uHintOff() {
    this._uE('_eHint', null);
    this._uClearE({ eHint: null });
  }
  // found (or skipped to the question): the team gathers where the player stands, then the stop dialogue opens
  _uFound(id) {
    if (!this._uStop(id)) return;
    this.setState({ started: true, mode: 'explore', step: 'go', target: id, via: 'found', line: 0, react: null, tab: 'calc', over: false, lessonView: null, view: 'map', drawer: false });
    this._uClearE({ eArrived: null, eFound: null, eSeek: null, eAim: 0 });
    if (this._uHas('_eFoundHere')) this._uE('_eFoundHere', id);
    else if (this._uHas('_eTalkHere')) this._uE('_eTalkHere', id);
    else this._uE('_eTour', id);
  }
  // instructor shortcut: the team walks / flies there (guided travel)
  _uWarp(id) { this._uGo(id, 'explore'); }

  // secondary: the guided tour (for instructors)
  _uStartTour() {
    this.setState({ started: true, mode: 'tour', step: 'lesson', lesson: 0, lessonView: null, target: null, via: null, line: 0, react: null, over: false, view: 'map', drawer: false });
    this._uClearE({ eGate: false, eArrived: null, eFinale: false, eFound: null, eSeek: null, eHint: null });
    this._uE('_eGate');
  }
  _uStartFree() {
    this.setState({ started: true, mode: 'free', step: 'free', target: null, via: null, line: 0, react: null, over: false, view: 'map', lessonView: null, drawer: false });
    this._uE('_eFree');
  }
  _uStartOverview() {
    this.setState({ started: true, mode: 'free', step: 'free', target: null, via: null, line: 0, react: null, over: true, view: 'map', lessonView: null, drawer: false });
    this._uE('_eOverview');
  }
  _uLesson(d) {
    const st = this._uSt();
    const n = this._uLessons().length || 4;
    if (st.lessonView != null) {
      const j = st.lessonView + d;
      if (j < 0) return;
      this.setState({ lessonView: j >= n ? null : j });
      return;
    }
    const i = (st.lesson || 0) + d;
    if (i < 0) return;
    if (i >= n) { this._uEnterCity(); return; }
    this.setState({ lesson: i });
  }
  _uEnterCity() {
    if (this._uSt().mode === 'explore') { this._uExplore(); return; }
    this._uGo(this._uNext(0) || 1, 'tour');
  }
  _uGo(id, mode) {
    const st = this._uSt();
    if (!this._uStop(id)) return;
    this.setState({ started: true, mode: mode || st.mode || 'tour', step: 'go', target: id, via: 'tour', line: 0, react: null, tab: 'calc', over: false, lessonView: null, view: 'map', drawer: false });
    this._uClearE({ eArrived: null, eFound: null, eSeek: null });
    this._uE('_eTour', id);
  }
  _uLineNext() {
    const st = this._uSt();
    const s = this._uStop(st.target);
    if (!s) return;
    const n = this._uStopLines(s).length;
    const line = (st.line || 0) + 1;
    // 99 = "all lines read" (also tells the engine the card is open, whatever the line count)
    this.setState({ line: line >= n ? 99 : line });
  }
  _uLineSkip() {
    const st = this._uSt();
    if (!this._uStop(st.target)) return;
    this.setState({ line: 99 });
  }
  _uAnswer(i) {
    const st = this._uSt();
    const s = this._uStop(st.target);
    if (!s) return;
    const answers = Object.assign({}, st.answers || {});
    if (answers[s.id] != null) return;
    answers[s.id] = i;
    const ok = i === s.ans;
    const C = this._uC();
    const G = (C && C.guide) || {};
    const pool = ok ? this._uLines(G.correctLines, G.correct, 'owl', 'relieved') : this._uLines(G.wrongLines, G.wrong, 'owl', 'thinking');
    const generic = pool.length ? pool[(s.id * 3 + Object.keys(answers).length) % pool.length] : { who: 'owl', mood: ok ? 'relieved' : 'thinking', t: ok ? 'ถูกต้องครับ' : 'ยังไม่ถูกครับ ดูเฉลยในการ์ดได้เลย' };
    const own = ok ? (s.praiseLine || s.praise) : (s.hintLine || s.hint);
    const main = own ? this._uLine(own, 'owl', ok ? 'relieved' : 'thinking') : generic;
    this.setState({ answers: answers, react: { id: s.id, ok: ok, who: main.who, mood: main.mood, t: main.t }, tab: 'calc', line: 99 });
    this._uE('_eAnswered', s.id, ok);
    this._uE('_auSfx', ok ? 'ok' : 'bad');
    this._uSave({ answers: answers });
  }
  _uAfter() {
    const st = this._uSt();
    const answers = st.answers || {};
    const S = this._uStops();
    const all = S.length > 0 && S.every((s) => answers[s.id] != null);
    if (st.mode === 'explore') { if (all) this._uFinale(); else this._uExplore(); return; }
    if (st.mode === 'free') { this._uToFree(); return; }
    if (all) { this._uFinale(); return; }
    const next = this._uNext(st.target || 0, answers);
    if (next != null) this._uGo(next, 'tour'); else this._uFinale();
  }
  _uFinale() {
    this.setState({ step: 'finale', target: null, via: null, react: null, over: false, lessonView: null, drawer: false });
    this._uClearE({ eFinale: false });
    if (typeof this._eFinale === 'function' && this._uFlow().engine) this._uE('_eFinale');
    else this.setState({ step: 'outro' });
  }
  _uToFree() {
    this.setState({ started: true, mode: 'free', step: 'free', target: null, via: null, line: 0, react: null, over: false, lessonView: null, view: 'map' });
    this._uE('_eFree');
  }
  _uToTour() {
    const st = this._uSt();
    const F = this._uFlow();
    if (!st.started) { this._uStartTour(); return; }
    if (st.mode === 'tour' && (F.step === 'go' || F.step === 'lesson')) {
      if (F.overOn) this._uToggleOver();
      return;
    }
    const next = this._uNext(0);
    if (next != null) this._uGo(next, 'tour'); else this._uFinale();
  }
  _uToggleOver() {
    const st = this._uSt();
    if (!st.started) { this._uStartOverview(); return; }
    const on = !this._uFlow().overOn;
    this.setState({ over: on, lessonView: null });
    this._uE(on ? '_eOverview' : '_eBack');
  }
  _uTalkNear() {
    const st = this._uSt();
    const id = st.eNear;
    if (id == null || !this._uStop(id)) return;
    if (st.mode === 'explore') { this._uFound(id); return; }
    this.setState({ step: 'go', target: id, via: 'tour', line: 0, react: null, tab: 'calc', over: false });
    this._uClearE({ eArrived: null });
    if (typeof this._eTalkHere === 'function') this._uE('_eTalkHere', id); else this._uE('_eTour', id);
  }
  _uRestart() {
    this.setState({ started: false, mode: 'explore', step: 'intro', lesson: 0, lessonView: null, target: null, via: null, line: 0, gateLine: 0, answers: {}, clues: {}, react: null, tab: 'calc', over: false, view: 'map', drawer: false, fast: false, clearAsk: false });
    this.__uSpkKey = null;
    this.__uPos = null;
    this.__uTele = null;
    this._uClearE({ eSeek: null, eFound: null, eHint: null, eMystery: null, eAim: 0 });
    this._uE('_eRestart');
    this._uSave({ answers: {}, clues: {}, started: false });
  }
  _uWeather(n) { this.setState({ weather: n }); this._uE('_eWeather', n); this._uSave({ weather: n }); }
  _uLabelsOn() { const st = this._uSt(); return st.labels == null ? true : !!st.labels; }
  _uToggleLabels() { const on = !this._uLabelsOn(); this.setState({ labels: on, moreOpen: false }); this._uE('_eLabels', on); this._uSave({ labels: on }); }
  _uSoundOn() { const st = this._uSt(); return st.sound == null ? true : !!st.sound; }
  _uToggleSound() {
    const on = !this._uSoundOn();
    this.setState({ sound: on, moreOpen: false });
    this._uE('_eSound', on);
    if (!on) this._uSayStop();
    this._uE('_eNarr', on && this._uNarrPref() && !!this._uSt().ttsOk);
    this._uSave({ sound: on });
  }
  // fast travel (explore mode): back to roaming first, then น้องส่อง flies the drone there
  _uHop(where) {
    this.setState({ hopOpen: false, moreOpen: false, wxOpen: false });
    if (this._uFlow().step !== 'explore') this._uExplore();
    this._uE('_eHop', where);
    this._uSave();
  }
  _uHopStop(id) {
    if (!this._uStop(id)) return;
    if (this._uFlow().step !== 'explore') this._uExplore();
    this._uE('_eHopStop', id);
  }
  _uFastOn() { const st = this._uSt(); return st.eFast != null ? !!st.eFast : !!st.fast; }
  _uToggleFast() { const on = !this._uFastOn(); this.setState({ fast: on }); this._uE('_eFast', on); }

  // ================================================================ ENGINE CALLBACKS
  // E key, pin and minimap clicks
  _uiOpenStop(id) {
    if (!this._uStop(id)) return;
    const st = this._uSt();
    const F = this._uFlow();
    if (st.started && st.mode === 'explore' && F.engine) {
      const a = st.answers || {};
      if (a[id] != null) { this._uGo(id, 'explore'); return; }                   // solved: walk over to review it
      if (F.exploring && F.seek === id) return;                                 // already hunting this one
      if (F.exploring && (id === F.mystery || id === st.eMystery)) { this._uSeek(id); return; }
      this._uHint(id, true);                                                    // far away: น้องส่อง leads the way
      return;
    }
    this._uGo(id, st.started ? (st.mode || 'tour') : 'tour');
  }
  _uiKey(k) {
    const st = this._uSt();
    const F = this._uFlow();
    // the site-visit film: Space / Enter / Esc skip it, other keys wait
    if (st.eFilm != null) { if (k === 'next' || k === 'esc') this._uFilmSkip(); return; }
    if (k === 'next') {
      if (!st.started) { this._uStartExplore(); return; }
      if (F.lessonOpen) { this._uLesson(1); return; }
      if (F.gateChoice) {
        if ((st.gateLine || 0) < this._uGateLines().length - 1) this._uGateNext(); else this._uGateLessons();
        return;
      }
      if (F.found != null) { this._uFound(F.found); return; }
      if (F.mystery != null) { this._uSeek(F.mystery); return; }
      if (F.linesLeft) { this._uLineNext(); return; }
      if (F.atStop && F.answered) { this._uAfter(); return; }
      if (F.near != null) this._uTalkNear();
      return;
    }
    if (k === 'hint') {
      if (!F.exploring) return;
      const target = F.seek != null ? F.seek : F.mystery;
      if (target != null) { this._uHint(target); return; }
      if (F.hint != null) { this._uHintOff(); return; }
      const id = this._uNearestUnsolved();
      if (id != null) this._uHint(id, true);
      return;
    }
    if (k === 'esc') {
      if (st.wxOpen || st.helpOpen || st.hopOpen || st.moreOpen) { this.setState({ wxOpen: false, helpOpen: false, hopOpen: false, moreOpen: false }); return; }
      if (F.seek != null) this._uSeekStop();
      else if (st.lessonView != null) this.setState({ lessonView: null });
      else if (st.drawer) this.setState({ drawer: false });
      else if (F.overOn) this._uToggleOver();
      else if (F.hint != null) this._uHintOff();
      return;
    }
    if (k === 'map') { this._uToggleOver(); return; }
    // number keys 1-4 answer the open question
    if (/^a[1-4]$/.test(k)) {
      const s = F.cur;
      const n = +k[1] - 1;
      if (F.quiz && !F.answered && s && n < (s.opts || []).length) this._uAnswer(n);
      return;
    }
    if (k === 'free') this._uToExplore();
  }
  // a click / touch on the 3D view closes the small pop-over menus
  _uiCanvasDown() {
    const st = this._uSt();
    if (st.wxOpen || st.helpOpen || st.hopOpen || st.moreOpen) this.setState({ wxOpen: false, helpOpen: false, hopOpen: false, moreOpen: false });
  }
  // re-apply UI state to a (re)booted engine
  _uSync() {
    const st = this._uSt();
    if (st.weather) this._uE('_eWeather', st.weather);
    this._uE('_eLabels', this._uLabelsOn());
    this._uE('_eSound', this._uSoundOn());
    this._uE('_eFilmAuto', this._uFilmAutoOn());
    this._uE('_eNarr', this._uNarrOn());
    if (st.fast) this._uE('_eFast', true);
    const a = st.answers || {};
    for (const s of this._uStops()) if (a[s.id] != null) this._uE('_eAnswered', s.id, a[s.id] === s.ans);
    if (this.__mapEl) this._uE('_mapAttach', this.__mapEl);
    this.__uSpkKey = null;
    if (!st.started) return;
    if (st.step === 'lesson' || st.step === 'gate') this._uE('_eGate');
    else if (st.step === 'go' && st.target != null) this._uE(st.via === 'found' && this._uHas('_eFoundHere') ? '_eFoundHere' : '_eTour', st.target);
    else if (st.step === 'explore') {
      const tp = this.__uTele;
      this.__uTele = null;
      if (tp) this._uE('_eTeleport', tp[0], tp[1], tp[2]);
      this._uE(this._uHas('_eExplore') ? '_eExplore' : '_eFree');
    }
    else if (st.step === 'free') this._uE('_eFree');
    else if (st.step === 'finale' || st.step === 'outro') this._uE('_eFinale');
    if (st.over) this._uE('_eOverview');
  }

  // ================================================================ RENDER VALUES
  renderVals() {
    const st = this._uSt();
    const C = this._uC();
    const F = this._uFlow();
    const S = this._uStops();
    const SC = (C && C.SC) || {};
    const GAS = (C && C.GAS) || {};
    const ISO = (C && C.ISO) || {};
    const DIS = (C && C.districts) || {};
    const G = (C && C.guide) || {};
    const TEAM = this._uTeam();
    // outfit context for neutral-type portraits; lessons happen at the city gate (graduation / rain only)
    const CTX = this._uCtx(F);
    const CTX_G = CTX === 'grad' ? 'grad' : (st.weather === 'rain' ? 'rain' : null);
    const answers = st.answers || {};
    const clues = st.clues || {};
    const total = S.length;
    const nAns = S.filter((s) => answers[s.id] != null).length;
    const nOk = S.filter((s) => answers[s.id] === s.ans).length;
    const pct = total ? Math.round((nAns / total) * 100) : 0;
    const isMap = F.isMap;
    const isExplore = F.started && F.explore;
    const fmt = (x, d) => Number(x || 0).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    const sc = (k) => SC[k] || { label: String(k || ''), en: '', name: '', color: '#64748B', soft: '#EEF2F6', ink: '#334155' };
    // readable text colour on a filled colour
    const lum = (hex) => {
      const h = String(hex || '').replace('#', '');
      if (!/^[0-9a-fA-F]{6}$/.test(h)) return 0;
      const ch = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    };
    const onC = (hex) => (lum(hex) > 0.28 ? '#19261E' : '#FFFFFF');
    const STATUS = {
      pending: { c: '#E8590C', t: 'ยังไม่ตอบ', bg: '#FFEBDD', fg: '#8A3A08' },
      ok: { c: '#15803D', t: 'ตอบถูก', bg: '#E3F3E6', fg: '#14532D' },
      bad: { c: '#64748B', t: 'ตอบผิด', bg: '#EEF0F3', fg: '#334155' }
    };
    const statusOf = (s) => (answers[s.id] == null ? 'pending' : (answers[s.id] === s.ans ? 'ok' : 'bad'));
    const isoShort = (n) => ((ISO[n] && ISO[n].short) || ('หมวด ' + n));
    const isoName = (n) => ((ISO[n] && ISO[n].name) || '');
    const list = (a) => (Array.isArray(a) ? a : []).map((t) => ({ t: String(t) }));
    const seg = (on) => ({ on: on, bg: on ? '#0B7D43' : 'transparent', fg: on ? '#FFFFFF' : '#19261E' });
    const pic = (who, mood, k, extra) => this._uPic(who, mood, Object.assign({ k: k, team: TEAM, ctx: CTX }, extra || {}));
    const pickArr = (arr, k) => (Array.isArray(arr) && arr.length ? arr[((k % arr.length) + arr.length) % arr.length] : null);
    const lineView = (l, sz, ctx) => {
      const w = this._uWho(l.who);
      const m = TEAM[w];
      return { who: w, name: m.name, principle: m.principle, color: m.ink, t: l.t, pic: pic(w, l.mood, sz || 1.38, ctx !== undefined ? { ctx: ctx } : null) };
    };
    // tips (+ who says them)
    const tipList = (C && Array.isArray(C.tips) && C.tips.length) ? C.tips : [
      'มีเทน 1 kg ทำให้โลกร้อนได้เท่ากับ CO₂ ประมาณ 28 kg ในช่วง 100 ปี (GWP AR5)',
      'ไฟฟ้าที่ผลิตใช้เองจากเครื่องกำเนิดไฟฟ้า นับจากเชื้อเพลิงที่เผาในประเภทที่ 1 ไม่นับซ้ำในประเภทที่ 2',
      'CO₂ จากการเผาชีวมวลรายงานแยกเป็น biogenic แต่ CH₄ และ N₂O ต้องรวมในยอดการปล่อย'
    ];
    const tipAt = (idx) => {
      const n = tipList.length;
      const j = ((idx % n) + n) % n;
      const x = tipList[j];
      const tb = C && C.tipsBy;
      let who = 'firefly';
      if (Array.isArray(tb) && tb[j]) who = tb[j];
      else if (tb && typeof tb === 'object' && !Array.isArray(tb) && (tb[j] || tb[String(j)])) who = tb[j] || tb[String(j)];
      const l = this._uLine(x, who, 'curious');
      l.t = l.t.replace(/^รู้หรือไม่\s*[:：·\-]?\s*/, '');
      return l;
    };

    // engine sync after a (re)boot
    if (st.eReady && this._E && this.__uSyncE !== this._E) {
      this.__uSyncE = this._E;
      const self = this;
      Promise.resolve().then(() => self._uSync());
    }
    // found: a short celebration, then the team gathers where the player stands
    if (F.found != null && isMap) {
      if (this.__uFoundAt !== F.found) {
        this.__uFoundAt = F.found;
        const fid = F.found;
        if (this.__uFoundTimer) clearTimeout(this.__uFoundTimer);
        this.__uFoundTimer = setTimeout(() => { this.__uFoundTimer = null; if (this._uFlow().found === fid) this._uFound(fid); }, 1700);
      }
    } else if (F.found == null) this.__uFoundAt = null;

    // ---------- stop card
    const cur = F.cur;
    const b = cur || S[0] || { id: 0, scope: 's1', iso: 1, gases: [], opts: [], ans: 0, guide: [] };
    const chosen = cur && answers[cur.id] != null ? answers[cur.id] : null;
    const answered = chosen != null;
    const correct = answered && chosen === b.ans;
    const bc = sc(b.scope);
    // before the answer is in, chips that would give it away (gas questions, scope questions) show "?" instead
    const ansTxt = String((b.opts || [])[b.ans] != null ? b.opts[b.ans] : '');
    const askGas = !answered && /CO₂|CH₄|N₂O|HFCs|PFCs|SF₆|NF₃/.test(ansTxt.replace(/(?:t|kg)?CO₂e/g, ''));
    const askScope = !answered && /ประเภทที่\s*\d/.test(ansTxt);
    const cc = askScope ? { color: '#8C8270', soft: '#EEF2F0', ink: '#2E3B33' } : bc;
    const keys = ['ก', 'ข', 'ค', 'ง'];
    const opts = (b.opts || []).map((o, i) => {
      const isAns = i === b.ans;
      const mine = chosen === i;
      return {
        key: keys[i] || String(i + 1),
        t: String(o),
        pick: () => this._uAnswer(i),
        dis: answered,
        st: answered ? (isAns ? 'ok' : (mine ? 'bad' : 'dim')) : 'idle',
        bg: answered ? (isAns ? '#E3F3E6' : (mine ? '#FBE8E3' : '#FFFFFF')) : '#FFFFFF',
        bd: answered ? (isAns ? '#15803D' : (mine ? '#B42318' : 'rgba(25,38,30,.1)')) : 'rgba(25,38,30,.2)',
        fg: answered && !isAns && !mine ? '#55625A' : '#19261E',
        kbg: answered ? (isAns ? '#15803D' : (mine ? '#B42318' : '#EEF2F0')) : '#EEF2F0',
        kfg: answered && (isAns || mine) ? '#FFFFFF' : '#2E3B33',
        ok: answered && isAns,
        bad: answered && mine && !isAns
      };
    });
    const react = st.react && cur && st.react.id === cur.id ? st.react : null;
    // reaction line (after answering): stored react, else the stop's own praise / hint
    let fbLine = null;
    if (answered) {
      if (react) fbLine = { who: this._uWho(react.who), mood: react.mood || (react.ok ? 'relieved' : 'thinking'), t: String(react.t || react.main || '') };
      else {
        const own = correct ? (b.praiseLine || b.praise) : (b.hintLine || b.hint);
        fbLine = own ? this._uLine(own, 'owl', correct ? 'relieved' : 'thinking') : { who: 'owl', mood: correct ? 'relieved' : 'thinking', t: correct ? 'ถูกต้องครับ' : 'ดูเฉลยในการ์ดได้เลยครับ' };
      }
      if (!fbLine.t) fbLine.t = correct ? 'ถูกต้องครับ' : 'ดูเฉลยในการ์ดได้เลยครับ';
    }
    const nextId = cur ? this._uNext(cur.id, answers) : null;
    const allDone = total > 0 && nAns >= total;
    let afterLabel = 'เดินไปจุดถัดไปกับทีม';
    if (st.mode === 'explore') afterLabel = allDone ? 'ขึ้นจุดชมวิว ดูภาพรวมทั้งเมือง' : 'สำรวจต่อ';
    else if (st.mode === 'free') afterLabel = 'เดินสำรวจต่อ';
    else if (allDone) afterLabel = 'ขึ้นจุดชมวิว ดูภาพรวมทั้งเมือง';
    else if (nextId != null && this._uStop(nextId)) afterLabel = 'ไปจุดที่ ' + nextId + ' · ' + this._uStop(nextId).short;
    const fbWho = fbLine ? fbLine.who : 'owl';
    // v1.0: evidence photos from the site-visit film (per stop)
    const photos = st.photos || {};
    const photoOf = (id) => (typeof photos[id] === 'string' ? photos[id] : '');
    const canFilm = !!cur && this._uHas('_eFilm') && st.webgl !== false;
    const card = {
      n: String(b.id),
      color: cc.color, soft: cc.soft, ink: cc.ink, badgeFg: onC(cc.color),
      resultInk: bc.ink,
      pos: 'จุดที่ ' + b.id + ' จาก ' + total + ' · ' + (DIS[b.district] || ''),
      title: b.title || '', org: b.org ? 'องค์กรผู้รายงาน: ' + b.org : (b.place || ''),
      scopeLabel: askScope ? 'ประเภท ? · เฉลยหลังตอบ' : bc.label + (bc.en ? ' · ' + bc.en : ''),
      isoText: askScope ? 'ISO 14064-1 หมวด ?' : 'ISO 14064-1 ' + isoShort(b.iso),
      isoName: isoShort(b.iso) + ' ' + isoName(b.iso),
      gases: askGas ? [{ t: 'ก๊าซ ?', sub: 'เฉลยหลังตอบ', color: '#D69E2E' }] : (b.gases || []).map((g) => ({ t: (GAS[g] && GAS[g].t) || g, sub: 'GWP ' + ((GAS[g] && GAS[g].gwp) || ''), color: (GAS[g] && GAS[g].color) || '#475569' })),
      scene: b.scene || '', q: b.q || '',
      fbTitle: correct ? 'ถูกต้อง' : 'ยังไม่ถูก',
      fbSub: correct ? 'ได้ 1 คะแนน' : ('คำตอบที่ถูกคือข้อ ' + (keys[b.ans] || '')),
      fbBg: correct ? '#E3F3E6' : '#FBE8E3', fbFg: correct ? '#14532D' : '#7A1E12', fbIcon: correct ? '#15803D' : '#B42318',
      fbPic: pic(fbWho, fbLine ? fbLine.mood : 'neutral', 1.38, { bg: '#FFFFFF' }),
      fbName: TEAM[fbWho].name,
      fbLine: fbLine ? fbLine.t : '',
      why: b.why || '', owner: b.owner || '', formula: b.formula || '',
      ex: list(b.ex), result: b.result || '', hasExtra: !!b.extra, extra: b.extra || '',
      data: list(b.data), verify: list(b.verify), reduce: list(b.reduce), caution: list(b.caution),
      src: b.src || '', cat: b.cat || '', ipcc: b.ipcc || '', hasIpcc: !!b.ipcc,
      photo: photoOf(b.id), hasPhoto: !!photoOf(b.id), noPhoto: !photoOf(b.id),
      canFilm: canFilm, filmLbl: photoOf(b.id) ? 'ดูวิดีโอสำรวจอีกครั้ง' : 'ดูวิดีโอสำรวจหน้างาน'
    };
    const TH = Object.assign({ calc: 'owl', data: 'firefly', verify: 'owl', reduce: 'sapling', caution: 'firefly' }, (C && C.tabHost) || {});
    const TABS = [['calc', 'วิธีคำนวณ', 'calc', 'explain'], ['data', 'หลักฐาน', 'data', 'askdocs'], ['verify', 'มุมผู้ทวนสอบ', 'verify', 'inspect'], ['reduce', 'แนวทางลด', 'reduce', 'explain'], ['ref', 'ข้อควรระวัง', 'caution', 'curious']];
    // v1.0: optional real-world clip per stop (js/media.js → window.GHGTownMedia)
    const MEDIA = window.GHGTownMedia || {};
    const md = cur ? (MEDIA[cur.id] || MEDIA[String(cur.id)] || null) : null;
    let mediaV = null;
    if (md && md.video) {
      const ym = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/.exec(String(md.video));
      mediaV = {
        yt: !!ym, file: !ym,
        src: ym ? 'https://www.youtube-nocookie.com/embed/' + ym[1] + '?rel=0&modestbranding=1&playsinline=1' : String(md.video),
        title: md.title || ('วิดีโอจริง · ' + (cur.short || '')),
        note: [md.title || '', md.credit ? 'ที่มา: ' + md.credit : ''].filter(Boolean).join(' · '),
        hasNote: !!(md.title || md.credit)
      };
      TABS.push(['media', 'วิดีโอจริง', 'data', 'curious']);
    }
    const media = mediaV || { yt: false, file: false, src: '', title: '', note: '', hasNote: false };
    const tab = st.tab === 'media' && !mediaV ? 'calc' : (st.tab || 'calc');
    const tabs = TABS.map((p) => {
      const on = tab === p[0];
      return {
        key: p[0], label: p[1], on: on,
        bg: on ? '#0B7D43' : '#FFFFFF', fg: on ? '#FFFFFF' : '#0B7D43', bd: on ? '#0B7D43' : 'rgba(25,38,30,.2)',
        pic: pic(TH[p[2]], p[3], 1.38, { bg: on ? '#FFFFFF' : TEAM[this._uWho(TH[p[2]])].soft, raw: true }),
        pick: () => this.setState({ tab: p[0] })
      };
    });
    const tabDef = TABS.find((p) => p[0] === tab) || TABS[0];
    const hostWho = this._uWho(TH[tabDef[2]]);
    const host = {
      label: tabDef[1] + ' · ' + TEAM[hostWho].name,
      motto: TEAM[hostWho].principle + ' — “' + TEAM[hostWho].motto + '”',
      soft: TEAM[hostWho].soft, ink: TEAM[hostWho].ink,
      pic: pic(hostWho, tabDef[3], 1.38, { raw: true })
    };

    // ---------- compass to the hint beacon (engine: bearing in degrees, clockwise = right)
    const touchOn = !!st.touch || !!st.eTouch;
    const hAng = Number(st.eHintAng);
    const cmpOn = F.hint != null && st.eHintAng != null && isFinite(hAng);
    if (cmpOn) {
      // unwrap, so the CSS transition always turns the short way round
      const prev = this.__uCmp != null ? this.__uCmp : hAng;
      let dd = hAng - ((((prev + 180) % 360) + 360) % 360 - 180);
      while (dd > 180) dd -= 360;
      while (dd < -180) dd += 360;
      this.__uCmp = prev + dd;
    } else this.__uCmp = null;
    const hD = Math.max(0, Number(st.eHintD) || 0);
    const cmp = {
      on: cmpOn, off: !cmpOn,
      rot: 'rotate(' + Math.round(this.__uCmp || 0) + 'deg)',
      dist: hD < 8 ? 'ถึงแล้ว' : ('อีก ~' + fmt(hD, 0) + ' ม.'),
      say: hD < 8 ? 'อยู่ตรงนี้ มองรอบ ๆ' : (Math.abs(hAng) <= 15 ? 'ตรงไปข้างหน้า' : (Math.abs(hAng) >= 150 ? 'อยู่ข้างหลัง หันกลับ' : (hAng > 0 ? 'ไปทางขวา' : 'ไปทางซ้าย')))
    };

    // ---------- explore: riddle card, seek, found, hint
    const drawerOn = !!st.drawer && isMap;
    const riddleOf = (id) => {
      const s = this._uStop(id);
      const R = this._uRiddle(s);
      const rw = this._uWho(R.line.who);
      const tz = pickArr(this._uGuideLines('mysteryLines'), id) || { who: 'firefly', mood: 'curious', t: 'เอ๊ะ ตรงนี้มีอะไรแปลก ๆ นะ!' };
      const dist = Number(st.eMysteryD);
      return {
        id: id, line: R.line, t: R.line.t, name: TEAM[rw].name, color: TEAM[rw].ink, pic: pic(rw, R.line.mood, 1.38, { bg: '#FFFFFF' }),
        teaser: tz.t, teaserName: TEAM[this._uWho(tz.who)].name, teaserColor: TEAM[this._uWho(tz.who)].ink,
        seek: R.seek, clue: R.clue, area: R.area, showClue: !!(clues[id] && R.clue),
        hasDist: st.eMystery === id && isFinite(dist) && dist > 0, dist: 'ห่าง ~' + fmt(Math.max(0, Math.round(dist || 0)), 0) + ' ม.',
        cmp: cmpOn && F.hint === id
      };
    };
    const showRiddle = isMap && F.mystery != null && !F.lessonOpen && !F.overOn;
    const riddle = F.mystery != null ? riddleOf(F.mystery) : { id: null, line: null, t: '', name: '', color: '#19261E', pic: pic('firefly', 'curious', 1.38), teaser: '', teaserName: '', teaserColor: '#19261E', seek: '', clue: '', area: '', showClue: false, hasDist: false, dist: '', cmp: false };
    const showSeek = isMap && F.seek != null && !F.lessonOpen && !F.overOn;
    const aim = Math.max(0, Math.min(1, Number(st.eAim) || 0));
    const seekR = F.seek != null ? this._uRiddle(this._uStop(F.seek)) : { seek: '', area: '', clue: '' };
    const seek = {
      text: seekR.seek, area: seekR.area, clue: seekR.clue,
      how: 'ภารกิจตามหา · เล็งเป้ากลางจอค้างไว้ หรือ' + (touchOn ? 'แตะ' : 'คลิก') + 'ที่แหล่งปล่อย',
      cmp: cmpOn && F.hint === F.seek,
      hasClue: F.seek != null && !!(clues[F.seek] && seekR.clue),
      canHint: F.seek != null && !(clues[F.seek] && F.hint === F.seek),
      pct: Math.round(aim * 100) + '%',
      off: (351.86 * (1 - aim)).toFixed(2),
      label: aim > 0.02 ? 'ค้างไว้… ' + Math.round(aim * 100) + '%' : 'หันเป้ากลางจอไปที่แหล่งปล่อย',
      pic: pic('firefly', 'inspect', 1.38, { raw: true })
    };
    const foundId = F.found != null ? F.found : (F.gathering && cur ? cur.id : null);
    const showFound = isMap && foundId != null && !F.lessonOpen && !F.overOn;
    const fl = pickArr(this._uGuideLines('foundLines'), foundId || 0) || { who: 'firefly', mood: 'jump', t: 'เจอแล้ว!' };
    const found = {
      fig: pic('firefly', 'jump', 1, { raw: true, bg: 'transparent' }),
      name: TEAM[this._uWho(fl.who)].name, color: TEAM[this._uWho(fl.who)].ink, t: fl.t,
      canGo: F.found != null,
      sub: F.found != null ? 'อีกอึดใจเดียว ทีมมาสคอตจะมารวมตัวที่นี่' : 'ทีมมาสคอตกำลังมารวมตัวที่นี่…'
    };
    const showHintB = isMap && F.hint != null && F.seek == null && F.found == null && !F.lessonOpen && !F.overOn;
    // hint lines: "follow my light" while far away, "you're close, look around" once the riddle is in range
    const hPool = this._uGuideLines('hintLines');
    const hNear = F.hint != null && F.mystery === F.hint;
    const hSet = hPool.filter((l) => (hNear ? /ใกล้|เล็ง|รอบตัว|รอบ ๆ/ : /ตามแสง|บินนำ|นำทาง|รออยู่|แสง|เดินไป/).test(l.t));
    const hl = F.hint != null ? (pickArr(hSet.length ? hSet : hPool, F.hint) || { who: 'firefly', mood: 'explain', t: 'ตามแสงหนูไปเลย!' }) : { who: 'firefly', mood: 'explain', t: '' };
    const hintB = {
      area: F.hint != null ? this._uRiddle(this._uStop(F.hint)).area : '',
      far: cmpOn && hD > 70,
      name: TEAM[this._uWho(hl.who)].name, t: hl.t,
      pic: pic('firefly', 'run', 1.38, { raw: true }),
      tpic: pic(hl.who, hl.mood, 1.38)
    };
    const showRoam = isMap && F.exploring && F.mystery == null && F.seek == null && F.found == null && F.hint == null && F.near == null && !F.lessonOpen && !F.overOn && !drawerOn && nAns < total;
    const roam = { left: String(total - nAns), pic: pic('firefly', 'curious', 1.38) };

    // ---------- dialogue bar (+ which mascot speaks in 3D)
    const filmOn = isMap && st.eFilm != null && !!this._uStop(st.eFilm);
    const showCard = isMap && F.quiz && !F.lessonOpen && !F.showOutro && !F.overOn && !filmOn;
    const lineCount = F.lines.length;
    let dl = null;            // visible line {who, mood, t}
    let dctx;                 // outfit override for the dialogue portraits (undefined = live context)
    let spkKey = null;        // identity of the visible line (drives _eSpeaker once per line)
    const dlg = { text: '', sub: '', hasNext: false, nextLabel: 'ต่อไป', hasSkip: false, hasDots: false, dots: [] };
    let showDlg = false;
    const introL = this._uLines(G.introLines, G.intro, 'owl', 'wave');
    if (F.started && isMap && !F.lessonOpen && !F.showOutro && !F.overOn && !filmOn) {
      if (F.gateWait) {
        showDlg = true;
        // the welcome line that points at the city gate (else the last intro line)
        dl = introL.filter((l) => /ประตูเมือง/.test(l.t)).pop() || introL[introL.length - 1] || { who: 'owl', mood: 'wave', t: 'ไปที่ประตูเมืองกันก่อนนะครับ' };
        dlg.sub = 'กำลังพาไปที่ประตูเมือง';
        dctx = 'thai';
        spkKey = 'gate';
      } else if (F.gateChoice) {
        const gl = this._uGateLines();
        const gi = Math.max(0, Math.min(st.gateLine || 0, gl.length - 1));
        dl = gl[gi] || null;
        showDlg = !!dl;
        dlg.sub = 'ที่ประตูเมือง · ' + (gi + 1) + '/' + gl.length;
        dlg.hasNext = gi < gl.length - 1;
        dlg.nextLabel = 'ต่อไป';
        dlg.hasDots = gl.length > 1;
        dlg.dots = gl.map((x, i) => ({ bg: i <= gi ? TEAM[this._uWho(x.who)].color : '#DCE3DF', w: i === gi ? '20px' : '7px' }));
        dctx = 'thai';
        spkKey = 'g' + gi;
      } else if (F.traveling && !F.gathering) {
        const k = cur.id * 7;
        const walkL = this._uLines(G.walkLines, G.walk, 'owl', 'neutral');
        const flyL = this._uLines(G.flyLines, G.fly, 'firefly', 'wave');
        const facL = this._uLines(G.enterFactoryLines, G.enterFactory, 'owl', 'neutral');
        dl = st.eInside ? (pickArr(facL, cur.id) || pickArr(walkL, k)) : (st.eFly ? (pickArr(flyL, cur.id) || pickArr(walkL, k)) : pickArr(walkL, k));
        dlg.sub = 'กำลังพาไปจุดที่ ' + cur.id + ' · ' + cur.short;
        showDlg = !!dl;
      } else if (F.atStop) {
        showDlg = true;
        dlg.sub = 'จุดที่ ' + cur.id + ' · ' + cur.short;
        if (F.answered && fbLine) {
          dl = fbLine;
          spkKey = 'r' + cur.id + (correct ? 'ok' : 'bad');
        } else if (F.line < lineCount) {
          dl = F.lines[F.line];
          spkKey = 's' + cur.id + '-' + F.line;
          dlg.hasNext = true;
          dlg.nextLabel = F.line >= lineCount - 1 ? 'ไปที่คำถาม' : 'ต่อไป';
          dlg.hasSkip = F.line < lineCount - 1;
          dlg.hasDots = lineCount > 1;
          dlg.dots = F.lines.map((x, i) => ({ bg: i <= F.line ? TEAM[this._uWho(x.who)].color : '#DCE3DF', w: i === F.line ? '20px' : '7px' }));
        } else {
          dl = { who: 'owl', mood: 'curious', t: 'ลองตอบคำถามในการ์ดดูครับ คิดแบบผู้ทวนสอบนะ' };
          spkKey = 'q' + cur.id;
        }
      } else if (F.finaleWait) {
        showDlg = true;
        const O0 = (C && C.outro) || {};
        dl = pickArr(this._uLines(O0.lines, O0.guide, 'owl', 'wave'), 0) || { who: 'firefly', mood: 'wave', t: 'ขึ้นมาชมวิวทั้งเมืองกัน!' };
        dlg.sub = 'จุดชมวิวบนเนินป่าชุมชน';
        spkKey = 'fin';
      }
    }
    const dw = dl ? this._uWho(dl.who) : 'owl';
    const dm = TEAM[dw];
    const dx = dctx !== undefined ? { ctx: dctx } : null;
    dlg.text = dl ? dl.t : '';
    dlg.name = dm.name;
    dlg.nameColor = dm.ink;
    dlg.principle = dm.principle;
    dlg.chipBg = dm.soft;
    dlg.chipFg = dm.ink;
    dlg.ring = dl && F.answered && F.atStop ? (correct ? '#15803D' : '#E8590C') : dm.color;
    dlg.pic = pic(dw, dl ? dl.mood : 'neutral', 1.38, dx);
    dlg.listeners = ['owl', 'sapling', 'firefly'].filter((w) => w !== dw).map((w) => pic(w, 'neutral', 1.38, dx));
    if (!dlg.sub) dlg.sub = dm.role || '';
    // lessons, outro and explore moments also make a mascot speak
    const lessons = this._uLessons();
    const li = Math.max(0, Math.min(lessons.length - 1, st.lessonView != null ? st.lessonView : (st.lesson || 0)));
    const L = lessons[li] || { kicker: '', title: '', guide: [], points: [], visual: '', data: {} };
    const lesLines = this._uLines(L.lines, L.guide, 'owl', 'explain');
    if (!spkKey && F.lessonOpen && C && lessons.length && lesLines.length) { spkKey = 'L' + li; dl = lesLines[0]; }
    if (!spkKey && F.showOutro && C) { spkKey = 'out'; dl = { who: 'owl', mood: 'jump', t: '' }; }
    if (!spkKey && showFound) { spkKey = 'f' + foundId; dl = fl; }
    if (!spkKey && showRiddle) { spkKey = 'm' + F.mystery; dl = riddle.line; }
    if (!spkKey && showHintB) { spkKey = 'h' + F.hint; dl = hl; }
    if (filmOn) spkKey = null;
    if (spkKey !== this.__uSpkKey) {
      this.__uSpkKey = spkKey;
      if (spkKey && dl) {
        const w = dl.who, m = dl.mood;
        Promise.resolve().then(() => this._uSpeak(w, m, 4));
      }
      // v1.0 Thai narration of the visible line (the question itself when the card opens)
      const sayT = spkKey && spkKey[0] === 'q' && cur ? (cur.q || '') : (spkKey && dl ? (dl.t || '') : '');
      const sayW = spkKey && spkKey[0] === 'q' ? 'owl' : (dl ? this._uWho(dl.who) : 'owl');
      if (sayT) Promise.resolve().then(() => this._uSay(sayT, sayW));
      // sound cues: a riddle pops up, the certificate opens
      const cue = spkKey && spkKey[0] === 'm' ? 'riddle' : (spkKey === 'out' ? 'cert' : null);
      if (cue) Promise.resolve().then(() => this._uE('_auSfx', cue));
    }

    // ---------- travel banner (น้องส่อง runs ahead; helmets only in helmet interiors)
    const helmetIn = !!st.eInside && this._uHelmet();
    const travel = { n: '', short: '', place: '', color: '#E8590C', badgeFg: '#FFFFFF', mode: '', dist: '', hasDist: false, tip: '', tipName: '', pic: pic('firefly', 'run', 1.38, { raw: true }), tipPic: pic('firefly', 'curious', 1.38) };
    if (cur) {
      const tl = tipAt(cur.id - 1);
      travel.n = String(cur.id);
      travel.short = cur.short || '';
      travel.place = cur.place || '';
      travel.color = sc(cur.scope).color;
      travel.badgeFg = onC(travel.color);
      travel.mode = st.mode === 'explore' ? 'วาร์ปไปกับทีม · โหมดวิทยากร' : (st.eFly ? 'น้องส่องนำบินโดรนข้ามย่าน' : (st.eInside ? (helmetIn ? 'เดินในอาคารกับทีม · สวมหมวกนิรภัย' : 'เดินในอาคารกับทีม') : 'เดินไปกับทีมมาสคอต'));
      travel.hasDist = st.eDist != null && isFinite(st.eDist);
      travel.dist = travel.hasDist ? ('อีก ' + fmt(Math.max(0, Math.round(st.eDist)), 0) + ' ม.') : '';
      travel.tip = tl.t;
      travel.tipName = TEAM[this._uWho(tl.who)].name;
      travel.tipPic = pic(tl.who, 'curious', 1.38);
    }
    const fastOn = this._uFastOn();

    // ---------- near prompt (free mode; solved stops in explore mode)
    const nearStop = F.near != null ? this._uStop(F.near) : null;
    const nearPic = pic('firefly', 'inspect', 1.38, { raw: true });
    const near = nearStop
      ? { n: String(nearStop.id), short: nearStop.short || '', place: nearStop.place || '', color: sc(nearStop.scope).color, badgeFg: onC(sc(nearStop.scope).color), callout: st.mode === 'explore' ? 'จุดนี้ไขปริศนาแล้ว · คุยกับทีมอีกครั้งได้' : TEAM.firefly.name + 'เจออะไรบางอย่าง! ไปดูกันไหม', pic: nearPic }
      : { n: '', short: '', place: '', color: '#E8590C', badgeFg: '#FFFFFF', callout: '', pic: nearPic };

    // ---------- lessons (lesson 1 is the Thai-dress welcome at the gate)
    const LD = L.data || {};
    const isFlow = st.lessonView == null;
    const exs = LD.examples || {};
    const lesCtx = li === 0 ? 'thai' : CTX_G;
    const presenters = [];
    for (const l of lesLines) if (presenters.indexOf(l.who) < 0) presenters.push(l.who);
    const les = {
      kicker: L.kicker || ('บทนำ ' + (li + 1) + '/' + lessons.length),
      title: L.title || '',
      lines: lesLines.map((l) => lineView(l, 1.38, lesCtx)),
      presenters: (presenters.length ? presenters : ['owl']).map((w) => pic(w, 'explain', 1.38, { ctx: lesCtx })),
      points: list(L.points),
      isGases: L.visual === 'gases', isScopes: L.visual === 'scopes', isFormula: L.visual === 'formula', isEvidence: L.visual === 'evidence',
      gases: ['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3'].filter((k) => GAS[k]).map((k) => ({ t: GAS[k].t || k, name: GAS[k].name || '', gwp: GAS[k].gwp || '', color: GAS[k].color || '#475569', from: GAS[k].from || '' })),
      note: LD.note || '',
      scopes: ['s1', 's2', 's3'].map((k) => { const c = sc(k); return { label: c.label, en: c.en, name: c.name, color: c.color, soft: c.soft, ink: c.ink, items: list(exs[k]) }; }),
      removal: { label: sc('rm').label, name: sc('rm').name, soft: sc('rm').soft, ink: sc('rm').ink },
      boundary: list(LD.boundary),
      iso: (Array.isArray(LD.isoMap) ? LD.isoMap : []).map((m) => {
        const raw = String(m.scope || '');
        const k = raw.slice(0, 2);
        const c = SC[k] ? sc(k) : sc('s3');
        return { short: isoShort(m.iso), name: isoName(m.iso), scope: raw.replace(/^s([123])/, (x, d) => sc('s' + d).label), soft: c.soft, ink: c.ink };
      }),
      steps: (Array.isArray(LD.steps) ? LD.steps : []).map((t, i) => ({ n: String(i + 1), t: String(t) })),
      ex: { ad: (LD.example && LD.example.ad) || '', ef: (LD.example && LD.example.ef) || '', calc: (LD.example && LD.example.calc) || '', res: (LD.example && LD.example.res) || '' },
      gwpEx: (LD.gwpExample && LD.gwpExample.calc) || '',
      hasGwpEx: !!(LD.gwpExample && LD.gwpExample.calc),
      principles: ['owl', 'sapling', 'firefly'].map((w) => {
        const m = TEAM[w];
        return { name: m.name, principle: m.principle, en: m.principleEn, motto: m.motto, bio: m.bio || '', soft: m.soft, ink: m.ink, fig: pic(w, w === 'owl' ? 'inspect' : (w === 'sapling' ? 'explain' : 'curious'), 1, { raw: true, bg: 'transparent' }) };
      }),
      ladder: (Array.isArray(LD.ladder) ? LD.ladder : []).map((t, i, arr) => ({
        t: String(t), ex: String((LD.ladderEx || [])[i] || ''),
        w: Math.round(100 - i * (36 / Math.max(1, arr.length - 1))) + '%',
        color: ['#1E6B33', '#3F7A1E', '#9A6200', '#B42318'][i] || '#64748B',
        level: ['ความน่าเชื่อถือสูงสุด', 'สูง', 'ปานกลาง', 'ต้องอธิบายสมมติฐาน'][i] || ''
      })),
      checks: list(LD.checks),
      dots: lessons.map((x, i) => ({ bg: i === li ? '#0B7D43' : (i < li ? '#9CC59A' : '#DCE3DF'), w: i === li ? '24px' : '8px' })),
      hasPrev: li > 0, isFlow: isFlow, isView: !isFlow,
      skipLabel: st.mode === 'explore' ? 'ข้ามบทนำ ออกสำรวจเลย' : 'ข้ามบทนำ เข้าเมืองเลย',
      nextLabel: li >= lessons.length - 1 ? (isFlow ? (st.mode === 'explore' ? 'ออกสำรวจเมืองกันเลย' : 'เข้าเมืองกันเลย') : 'ปิดบทนำ') : 'บทถัดไป'
    };

    // ---------- drawer: riddle book (explore) or stop list
    const order = [];
    for (const s of S) if (order.indexOf(s.district) < 0) order.push(s.district);
    const dGroups = order.map((d) => {
      const items = S.filter((s) => s.district === d);
      const okn = items.filter((s) => answers[s.id] != null).length;
      return {
        name: DIS[d] || d, prog: okn + '/' + items.length,
        items: items.map((s) => {
          const stt = STATUS[statusOf(s)];
          const c = sc(s.scope);
          const on = !!cur && cur.id === s.id;
          return {
            n: String(s.id), short: s.short || '', place: s.place || '', badge: stt.c,
            bg: on ? '#FFF5DD' : '#FFFFFF', bd: on ? '#FFB703' : 'rgba(25,38,30,.1)',
            scopeLabel: c.label, scopeSoft: c.soft, scopeInk: c.ink, stText: stt.t, stFg: stt.fg,
            pick: () => this._uiOpenStop(s.id)
          };
        })
      };
    });
    const bGroups = order.map((d) => {
      const items = S.filter((s) => s.district === d);
      const okn = items.filter((s) => answers[s.id] != null).length;
      return {
        name: DIS[d] || d, prog: 'ไขแล้ว ' + okn + '/' + items.length,
        items: items.map((s) => {
          const solved = answers[s.id] != null;
          const good = solved && answers[s.id] === s.ans;
          const R = this._uRiddle(s);
          const c = sc(s.scope);
          const hinting = st.eHint === s.id;
          return {
            solved: solved, open: !solved, ok: good, bad: solved && !good,
            n: String(s.id), title: s.short || s.title || '', scopeLabel: c.label, scopeSoft: c.soft, scopeInk: c.ink,
            res: good ? 'ตอบถูก' : 'ตอบผิด', resFg: good ? '#14532D' : '#7A1E12', badge: good ? '#15803D' : '#64748B',
            area: R.area, riddle: R.line.t, pic: pic(R.line.who, R.line.mood, 1.38, { raw: true }),
            hinting: hinting, bd: hinting ? '#FFB703' : 'rgba(25,38,30,.24)', bg: hinting ? '#FFF5DD' : '#FFFFFF',
            photo: photoOf(s.id), hasPhoto: solved && !!photoOf(s.id), noPhoto: !(solved && photoOf(s.id)),
            hint: () => this._uHint(s.id, true), warp: () => this._uWarp(s.id), review: () => this._uGo(s.id, 'explore')
          };
        })
      };
    });
    const lessonsList = lessons.map((x, i) => {
      const ls = this._uLines(x.lines, x.guide, 'owl', 'explain');
      const w = ls.length ? ls[0].who : 'owl';
      return { n: String(i + 1), title: x.title || '', pic: pic(w, 'explain', 1.38, { raw: true }), pick: () => this.setState({ lessonView: i, drawer: false }) };
    });
    const exProg = 'ไขปริศนาแล้ว ' + nAns + '/' + total + ' · ตอบถูก ' + nOk;
    // ---------- fast travel list: the city gate + every district that has riddles (remaining count)
    const curD = this._uDistrictId(st.eDistrict);
    const hops = [{ id: 'gate', name: DIS.gate || 'ประตูเมือง', prog: 'จุดเริ่มต้น · ประตูเมือง', left: 1 }].concat(order.map((d) => {
      const items = S.filter((s) => s.district === d);
      const left = items.filter((s) => answers[s.id] == null).length;
      return { id: d, name: DIS[d] || d, prog: left ? ('เหลือ ' + left + ' จาก ' + items.length + ' ปริศนา') : ('ไขครบ ' + items.length + ' ปริศนาแล้ว'), left: left };
    })).map((h) => {
      const here = h.id === curD;
      return {
        name: h.name + (here ? ' · อยู่ที่นี่' : ''), prog: h.prog, go: () => this._uHop(h.id),
        bg: here ? '#FFF5DD' : 'transparent', dot: h.id === 'gate' ? '#0B7D43' : (h.left ? '#E8590C' : '#15803D'),
        ring: h.left || h.id === 'gate' ? 'rgba(232,89,12,.18)' : 'rgba(21,128,61,.2)', subFg: h.left || h.id === 'gate' ? '#55625A' : '#14532D'
      };
    });

    // ---------- outro certificate & table
    const O = (C && C.outro) || { title: 'สรุปการเดินทาง', guide: [], takeaways: [] };
    const sGroups = ['s1', 's2', 's3', 'rm'].map((k) => {
      const c = sc(k);
      const items = S.filter((s) => s.scope === k);
      const okn = items.filter((s) => answers[s.id] === s.ans).length;
      return { label: c.label, color: c.color, soft: c.soft, ink: c.ink, score: okn + ' / ' + items.length, w: (items.length ? Math.round((okn / items.length) * 100) : 0) + '%' };
    });
    const TKC = [['#42B236', '#19261E'], ['#10C0E5', '#19261E'], ['#FFB703', '#19261E']];
    const tks = (Array.isArray(O.takeaways) ? O.takeaways : []).map((x, i) => ({ n: String(i + 1), t: x.t || '', d: x.d || '', bg: TKC[i % 3][0], fg: TKC[i % 3][1] }));
    const outro = {
      title: O.title || 'สรุปการเดินทาง',
      scoreTitle: nOk >= Math.ceil(total * 0.85) ? 'ยอดเยี่ยม! คิดแบบผู้ทวนสอบได้เลย' : (nOk >= Math.ceil(total * 0.6) ? 'ทำได้ดีมาก' : 'ลองทบทวนจุดที่ตอบผิดอีกครั้ง'),
      lines: this._uLines(O.lines, O.guide, 'owl', 'relieved').map((l) => lineView(l, 1.38, 'grad')),
      takeaways: tks,
      tkCount: String(tks.length)
    };
    // today's date, Buddhist era (Arabic digits, like every other number on the certificate)
    const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const now = new Date();
    const cert = {
      date: now.getDate() + ' ' + MONTHS[now.getMonth()] + ' พ.ศ. ' + (now.getFullYear() + 543),
      answered: nAns >= total ? ('ตอบครบทั้ง ' + total + ' จุด') : ('ตอบแล้ว ' + nAns + ' จาก ' + total + ' จุด')
    };
    const BOB = ['gBob 3.4s ease-in-out infinite', 'gBob 3.4s ease-in-out -1.1s infinite', 'gBob 3.4s ease-in-out -2.2s infinite'];
    const outroFigs = [['sapling', 1, '100px'], ['owl', 0, '118px'], ['firefly', 2, '100px']].map((p) => Object.assign(pic(p[0], 'grad', 1, { raw: true, bg: 'transparent' }), { anim: BOB[p[1]], sz: p[2] }));
    const rows = S.map((s) => {
      const c = sc(s.scope);
      const stt = STATUS[statusOf(s)];
      return {
        n: String(s.id), color: c.color, badgeFg: onC(c.color), soft: c.soft, ink: c.ink, scope: c.label, iso: isoShort(s.iso),
        title: s.title || '', org: (s.org || '') + (s.place && s.org && s.place.indexOf(s.org) < 0 ? ' · ' + s.place : ''),
        gases: (s.gases || []).map((g) => ({ t: (GAS[g] && GAS[g].t) || g })),
        ad: s.ad || '', ef: s.ef || '', res: s.res || '', stText: stt.t, stBg: stt.bg, stFg: stt.fg,
        pick: () => this._uiOpenStop(s.id)
      };
    });
    const totals = ['s1', 's2', 's3', 'rm'].map((k) => {
      const c = sc(k);
      const items = S.filter((s) => s.scope === k);
      const sum = items.reduce((a, s) => a + (Number(s.t) || 0), 0);
      return { label: c.label, color: c.color, soft: c.soft, ink: c.ink, n: items.length + ' จุด', sum: fmt(sum, 2) + (k === 'rm' ? ' tCO₂' : ' tCO₂e') };
    });

    // ---------- top bar
    const wx = st.weather || 'day';
    const modeExplore = F.started && st.mode === 'explore' && !F.overOn;
    const modeTour = F.started && st.mode === 'tour' && !F.overOn;
    const labelsOn = this._uLabelsOn();
    const town = (C && C.town) || { name: 'เมืองคาร์บอน', tagline: '' };
    let locSub = 'เดินกับทีม · ' + TEAM.owl.name + 'นำทาง';
    if (F.overOn) locSub = 'มุมสูง · คลิกหมุดเพื่อให้ทีมพาไป';
    else if (st.eFly) locSub = 'น้องส่องนำบินโดรนข้ามย่าน';
    else if (st.mode === 'explore') locSub = F.gateWait || F.gateChoice ? 'ประตูเมือง · จุดเริ่มสำรวจ' : (F.seek != null ? 'กำลังตามหาแหล่งปล่อย · เล็งเป้ากลางจอ' : 'สำรวจเอง · ทีมมาสคอตเดินตามคุณ');
    else if (st.mode === 'free') locSub = 'เดินอิสระ · เดินไปใกล้กิจกรรมเพื่อคุยกับทีม';
    const loc = { name: st.eDistrict || town.name || 'เมืองคาร์บอน', sub: locSub, inside: st.eInside || '', hasInside: !!st.eInside };
    const webglBad = st.webgl === false;
    // intro: the team welcomes in Thai dress; the first line greets with a wai
    const teamCards = [['owl', 0], ['sapling', 1], ['firefly', 2]].map((p) => {
      const m = TEAM[p[0]];
      return { name: m.name, species: m.species, role: m.role, motto: m.motto, principle: m.principle, en: m.principleEn, soft: m.soft, ink: m.ink, line: m.color, anim: BOB[p[1]], fig: pic(p[0], 'thai', 1, { raw: true, bg: 'transparent' }) };
    });
    const introLines = introL.map((l, i) => lineView(i === 0 ? { who: l.who, mood: 'wai', t: l.t } : l, 1.38, 'thai'));
    // saved progress on the intro screen
    const nm = String(st.trainee || '').trim();
    const resume = {
      has: !F.started && nAns > 0, done: String(nAns), ok: String(nOk), who: nm ? ' คุณ' + nm : '',
      ask: !!st.clearAsk, clear: () => this._uClearProgress(), keep: () => this.setState({ clearAsk: false }),
      clearLabel: st.clearAsk ? 'ลบเลย เริ่มนับใหม่' : 'ล้างความคืบหน้าแล้วเริ่มนับใหม่', clearFg: st.clearAsk ? '#B42318' : '#4A574F'
    };
    const soundOn = this._uSoundOn();
    const menuBtn = (on) => ({ bg: on ? '#0B7D43' : '#FFFFFF', fg: on ? '#FFFFFF' : '#19261E' });
    // ---------- v1.0 site-visit film (letterbox, captions, AR tag)
    const fStop = filmOn ? this._uStop(st.eFilm) : null;
    const narrOn = this._uNarrOn();
    let film = { on: false, shot: '0', n: '', total: String(total), place: '', org: '', color: '#0B7D43', short: '', gases: [], hasAd: false, ad: '', isTitle: false, hasSub: false, sub: '', saved: false, narr: narrOn, narrOff: !narrOn };
    if (fStop) {
      const shot = st.eFilmShot != null ? st.eFilmShot : 0;
      const solved = answers[fStop.id] != null;
      const fAns = String((fStop.opts || [])[fStop.ans] != null ? fStop.opts[fStop.ans] : '');
      const fHide = !solved && /CO₂|CH₄|N₂O|HFCs|PFCs|SF₆|NF₃/.test(fAns.replace(/(?:t|kg)?CO₂e/g, ''));
      film = {
        on: true, shot: String(shot), n: String(fStop.id), total: String(total),
        place: fStop.place || fStop.title || '', org: fStop.org ? 'องค์กรผู้รายงาน: ' + fStop.org : '',
        color: sc(fStop.scope).color, short: fStop.short || fStop.title || '',
        gases: fHide ? [{ t: 'ก๊าซ ?', bg: '#B7791F' }] : (fStop.gases || []).map((g) => ({ t: (GAS[g] && GAS[g].t) || g, bg: (GAS[g] && GAS[g].color) || '#475569' })),
        hasAd: solved && !!fStop.ad, ad: fStop.ad || '',
        isTitle: shot === 0, hasSub: shot >= 1 && shot <= 3 && !!fStop.scene, sub: fStop.scene || '', saved: shot === 3,
        narr: narrOn, narrOff: !narrOn
      };
    }

    return {
      canvasRef: this._canvasRef(),
      mapRef: this._mapRef(),
      joyRef: this._joyRef(),
      filmRef: this._filmRef(),
      film: film,
      filmKey: film.on ? '1' : '0',
      filmSkip: () => this._uFilmSkip(),
      filmNarr: () => this._uToggleNarr(),
      filmReplay: () => this._uFilmReplay(),
      filmAutoOn: this._uFilmAutoOn(),
      toggleFilmAuto: () => this._uToggleFilmAuto(),
      ttsOk: !!st.ttsOk,
      narrSw: this._uNarrPref(),
      toggleNarr: () => this._uToggleNarr(),
      tabMedia: tab === 'media', media: media,
      nameRef: this._nameRef(),
      touchKey: touchOn ? '1' : '0', touchOn: touchOn, touchOff: !touchOn,
      resume: resume,
      resumeGo: () => this._uResume(),
      introMainCls: resume.has ? 'g-btn2' : 'g-btn',
      introMainLabel: resume.has ? 'เริ่มที่ประตูเมือง (ความคืบหน้ายังอยู่)' : ('เริ่มสำรวจเมือง · ไขปริศนา ' + total + ' จุด'),
      cmp: cmp,
      hopNear: () => { if (F.hint != null) this._uHopStop(F.hint); },
      showHop: isExplore && !F.overOn && !F.finaleWait,
      hops: hops,
      hopOpen: !!st.hopOpen,
      hopBtn: menuBtn(!!st.hopOpen),
      toggleHop: () => this.setState({ hopOpen: !st.hopOpen, wxOpen: false, helpOpen: false, moreOpen: false }),
      soundOn: soundOn, soundOff: !soundOn,
      soundText: soundOn ? 'ปิดเสียง' : 'เปิดเสียง',
      soundMenu: soundOn ? 'เสียง: เปิดอยู่ (แตะเพื่อปิด)' : 'เสียง: ปิดอยู่ (แตะเพื่อเปิด)',
      soundBtn: { bg: soundOn ? '#FFFFFF' : '#0B7D43', fg: soundOn ? '#19261E' : '#FFFFFF' },
      toggleSound: () => this._uToggleSound(),
      moreOpen: !!st.moreOpen,
      moreBtn: menuBtn(!!st.moreOpen),
      toggleMore: () => this.setState({ moreOpen: !st.moreOpen, wxOpen: false, helpOpen: false, hopOpen: false }),
      goTableM: () => this.setState({ view: 'table', drawer: false, moreOpen: false }),
      printCert: () => { try { window.print(); } catch (err) { /* printing unavailable */ } },
      webglBad: webglBad && isMap,
      sadFig: pic('firefly', 'surprised', 1, { raw: true, bg: 'transparent' }),
      loading: isMap && !webglBad && typeof this._boot === 'function' && !st.eReady && !(this._E && this._E.alive),
      loadFigs: [['owl', 'wave', 0], ['sapling', 'wave', 1], ['firefly', 'wave', 2]].map((p) => Object.assign(pic(p[0], p[1], 1, { raw: true, bg: 'transparent' }), { anim: BOB[p[2]] })),
      noContent: !C,
      total: String(total), score: String(nOk), done: String(nAns), progress: pct + '%',
      headProg: (isExplore ? 'ไขปริศนาแล้ว ' : 'ตอบแล้ว ') + nAns + ' จาก ' + total + ' จุด',
      isMap: isMap, isTable: !isMap, viewKey: isMap ? 'map' : 'table',
      mapDisplay: isMap ? 'block' : 'none',
      brandPics: ['owl', 'sapling', 'firefly'].map((w) => pic(w, 'hero', 1.38, { raw: true })),
      tabMap: { bg: isMap ? '#FFFFFF' : 'transparent', fg: isMap ? '#19261E' : '#3A463F', sh: isMap ? '0 1px 3px rgba(25,38,30,.18)' : 'none' },
      tabTable: { bg: isMap ? 'transparent' : '#FFFFFF', fg: isMap ? '#3A463F' : '#19261E', sh: isMap ? 'none' : '0 1px 3px rgba(25,38,30,.18)' },
      goMap: () => this.setState({ view: 'map' }),
      goTable: () => this.setState({ view: 'table', drawer: false }),
      tablePic: pic('owl', 'desk', 1.38, { raw: true }),
      // intro
      showIntro: !F.started && isMap && !!C,
      town: { name: town.name || 'เมืองคาร์บอน', tagline: town.tagline || '' },
      teamCards: teamCards,
      introLines: introLines,
      lessonCount: String(lessons.length || 4),
      districtCount: String(Object.keys(DIS).length || 9),
      startExplore: () => this._uStartExplore(),
      startTour: () => this._uStartTour(),
      startOverview: () => this._uStartOverview(),
      // top bar
      showTop: F.started && isMap && !F.lessonOpen && !F.showOutro,
      loc: loc,
      isExplore: isExplore,
      notExplore: !isExplore,
      exProg: exProg,
      drawerLbl: isExplore ? 'สมุดปริศนา' : 'จุดเรียนรู้',
      drawerTip: isExplore ? ('สมุดปริศนา · ' + exProg) : ('จุดเรียนรู้ · ตอบแล้ว ' + nAns + '/' + total),
      doneOf: nAns + '/' + total,
      toggleDrawer: () => this.setState({ drawer: !st.drawer, wxOpen: false, helpOpen: false }),
      // no 3D city: the plain stop list (free mode) is the way through the lessons
      openDrawer: () => this.setState({ drawer: true, started: true, mode: 'free', step: st.started && st.step && st.step !== 'explore' && st.step !== 'gate' ? st.step : 'free' }),
      closeDrawer: () => this.setState({ drawer: false }),
      drawerOn: drawerOn,
      drawerBtn: { bg: drawerOn ? '#0B7D43' : '#FFFFFF', fg: drawerOn ? '#FFFFFF' : '#19261E', cbg: drawerOn ? 'rgba(255,255,255,.18)' : '#EEF2F0' },
      mExplore: seg(modeExplore), mTour: seg(modeTour), mOver: seg(F.overOn),
      setExplore: () => this._uToExplore(),
      setTour: () => this._uToTour(),
      toggleOver: () => this._uToggleOver(),
      wDay: seg(wx === 'day'), wEvening: seg(wx === 'evening'), wNight: seg(wx === 'night'), wRain: seg(wx === 'rain'), wAuto: seg(wx === 'auto'),
      setDay: () => { this._uWeather('day'); this.setState({ wxOpen: false, moreOpen: false }); },
      setEvening: () => { this._uWeather('evening'); this.setState({ wxOpen: false, moreOpen: false }); },
      setNight: () => { this._uWeather('night'); this.setState({ wxOpen: false, moreOpen: false }); },
      setRain: () => { this._uWeather('rain'); this.setState({ wxOpen: false, moreOpen: false }); },
      setAuto: () => { this._uWeather('auto'); this.setState({ wxOpen: false, moreOpen: false }); },
      // weather + controls live in small pop-overs (closed by default, Esc closes them)
      wxOpen: !!st.wxOpen,
      toggleWx: () => this.setState({ wxOpen: !st.wxOpen, helpOpen: false, hopOpen: false, moreOpen: false }),
      wxLabel: ({ day: 'กลางวัน', evening: 'ตอนเย็น', night: 'กลางคืน', rain: 'ฝนตก', auto: 'ตามเวลาจริง' })[wx] || 'กลางวัน',
      wxBtn: { bg: st.wxOpen ? '#0B7D43' : '#FFFFFF', fg: st.wxOpen ? '#FFFFFF' : '#19261E' },
      helpOn: !!st.helpOpen,
      toggleHelp: () => this.setState({ helpOpen: !st.helpOpen, wxOpen: false, hopOpen: false, moreOpen: false }),
      helpBtn: { bg: st.helpOpen ? '#0B7D43' : '#FFFFFF', fg: st.helpOpen ? '#FFFFFF' : '#19261E' },
      labelsOn: labelsOn,
      labelsText: labelsOn ? 'ซ่อนป้ายชื่อจุด' : 'แสดงป้ายชื่อจุด',
      labelsBtn: { bg: labelsOn ? '#FFFFFF' : '#0B7D43', fg: labelsOn ? '#19261E' : '#FFFFFF' },
      toggleLabels: () => this._uToggleLabels(),
      // banners
      showGateWait: isMap && F.gateWait,
      gateText: st.mode === 'explore' ? 'ทีมมาสคอตกำลังพาไปที่ประตูเมือง · จุดเริ่มสำรวจ' : ('ทีมมาสคอตกำลังพาไปที่ประตูเมือง เตรียมเรียนบทนำ ' + (lessons.length || 4) + ' บท'),
      showGateChoice: isMap && F.gateChoice && !F.lessonOpen && !F.overOn,
      gatePics: ['owl', 'sapling', 'firefly'].map((w) => pic(w, 'thai', 1.38, { raw: true })),
      gateLessons: () => this._uGateLessons(),
      gateGo: () => this._uExplore(),
      showFinaleWait: isMap && F.finaleWait,
      finFig: pic('firefly', 'grad', 1.38, { raw: true }),
      showTravel: isMap && F.traveling && !F.gathering && !F.lessonOpen,
      travel: travel,
      fastOn: fastOn,
      fastBtn: { bg: fastOn ? '#FFB703' : 'transparent', fg: fastOn ? '#19261E' : '#FFFFFF' },
      toggleFast: () => this._uToggleFast(),
      skip: () => this._uE('_eSkip'),
      // explore: riddle, seek, found, hint, roam
      showRiddle: showRiddle,
      riddle: riddle,
      riddleSeek: () => { if (F.mystery != null) this._uSeek(F.mystery); },
      riddleHint: () => { if (F.mystery != null) this._uHint(F.mystery); },
      riddleSkip: () => { if (F.mystery != null) this._uFound(F.mystery); },
      showSeek: showSeek,
      seek: seek,
      seekStop: () => this._uSeekStop(),
      seekHint: () => { if (F.seek != null) this._uHint(F.seek); },
      showFound: showFound,
      found: found,
      foundGo: () => { if (F.found != null) this._uFound(F.found); },
      showHintB: showHintB,
      hintB: hintB,
      hintOff: () => this._uHintOff(),
      showRoam: showRoam,
      roam: roam,
      roamHint: () => this._uiKey('hint'),
      // map & hints
      showMap: F.started && isMap && !webglBad && !F.lessonOpen && !F.showOutro,
      mapTodo: isExplore ? 'ปริศนา' : 'ยังไม่ตอบ',
      showHint: !!st.helpOpen && F.started && isMap && !webglBad && !F.lessonOpen && !F.showOutro,
      showOverTip: F.overOn && !st.helpOpen && F.started && isMap && !webglBad && !showCard && !F.lessonOpen && !F.showOutro && !drawerOn,
      hintWalk: !F.overOn,
      hintOver: F.overOn,
      // near prompt
      showNear: isMap && F.near != null && !F.lessonOpen && !drawerOn,
      near: near,
      talkNear: () => this._uTalkNear(),
      // dialogue (the question card shows the mascot's line itself, so the bar steps aside while it is open)
      showDlg: showDlg && !showCard,
      dlgCard: showCard ? '1' : '0',
      dlg: dlg,
      dlgNext: () => this._uDlgNext(),
      dlgSkip: () => this._uLineSkip(),
      // drawer
      showDrawer: drawerOn,
      drawerTitle: isExplore ? 'สมุดปริศนา' : 'จุดเรียนรู้ในเมือง',
      drawerSub: isExplore ? exProg : ('ตอบแล้ว ' + nAns + '/' + total + ' · คลิกเพื่อให้ทีมมาสคอตพาไป'),
      showBook: isExplore,
      showStopList: !isExplore,
      bGroups: bGroups,
      bookFly: pic('firefly', 'wave', 1.38, { raw: true }),
      lessonsList: lessonsList,
      dGroups: dGroups,
      restart: () => this._uRestart(),
      // card
      showCard: showCard,
      card: card,
      opts: opts,
      answered: answered,
      notAnswered: !answered,
      askPic: pic('owl', 'curious', 1.38),
      cardOk: answered && correct,
      cardBad: answered && !correct,
      tabs: tabs,
      host: host,
      tabCalc: tab === 'calc', tabData: tab === 'data', tabVerify: tab === 'verify', tabReduce: tab === 'reduce', tabRef: tab === 'ref',
      after: () => this._uAfter(),
      afterLabel: afterLabel,
      // lesson
      showLesson: F.lessonOpen && !!C && lessons.length > 0,
      les: les,
      lesNext: () => this._uLesson(1),
      lesPrev: () => this._uLesson(-1),
      lesSkip: () => this._uEnterCity(),
      lesClose: () => this.setState({ lessonView: null }),
      // outro (certificate)
      showOutro: F.showOutro && !!C,
      outro: outro,
      outroFigs: outroFigs,
      sGroups: sGroups,
      cert: cert,
      confetti: this._uConfetti(),
      keepWalking: () => this._uToExplore(),
      // table
      rows: rows,
      totals: totals
    };
  }

  // ================================================================ LIFECYCLE
  componentDidMount() {
    this._uRestore();
    try { if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) this.setState({ touch: true }); } catch (err) { /* ignore */ }
    // keep where the player stands when the tab is hidden or closed
    this.__uVis = () => { if (document.hidden) { this._uSayStop(); if (this._uSt().started) this._uSave(); } };
    document.addEventListener('visibilitychange', this.__uVis);
    // Thai narration needs a Thai voice on this device (the voice list loads asynchronously)
    const ss = window.speechSynthesis;
    if (ss) {
      this.__uVoices = () => {
        this.__uVoiceN = -1;
        const ok = !!this._uTtsVoice();
        if (ok !== !!this._uSt().ttsOk) { this.setState({ ttsOk: ok }); this._uE('_eNarr', ok && this._uNarrPref() && this._uSoundOn()); }
      };
      try { ss.addEventListener('voiceschanged', this.__uVoices); } catch (err) { ss.onvoiceschanged = this.__uVoices; }
      this.__uVoices();
    }
  }
  componentWillUnmount() {
    if (this.__uFoundTimer) { clearTimeout(this.__uFoundTimer); this.__uFoundTimer = null; }
    if (this.__uVis) { document.removeEventListener('visibilitychange', this.__uVis); this.__uVis = null; }
    if (this.__uVoices && window.speechSynthesis) { try { window.speechSynthesis.removeEventListener('voiceschanged', this.__uVoices); } catch (err) { /* ignore */ } }
    this._uSayStop();
    if (this._uSt().started) this._uSave();
    if (typeof this._dispose === 'function') this._dispose();
  }

  // ================================================================ v1.0 SITE-VISIT FILM + THAI NARRATION
  // the film overlay's engine-driven part (timecode, AR tag, dips) is a kept element
  _filmRef() {
    if (!this.__fref) this.__fref = (el) => { if (typeof this._fmAttach === 'function') this._fmAttach(el || null); };
    return this.__fref;
  }
  _uFilmAutoOn() { const st = this._uSt(); return st.filmAuto == null ? true : !!st.filmAuto; }
  _uToggleFilmAuto() { const on = !this._uFilmAutoOn(); this.setState({ filmAuto: on }); this._uE('_eFilmAuto', on); this._uSave({ filmAuto: on }); }
  _uFilmSkip() { this._uSayStop(); this._uE('_eFilmSkip'); }
  _uFilmReplay() {
    const st = this._uSt();
    if (st.target == null || st.eFilm != null) return;
    this._uSayStop();
    this._uE('_eFilm', st.target);
  }
  // engine → UI: the evidence photo taken in the close-up (kept per stop, also across reloads)
  _uPhoto(id, url) {
    if (!this._uStop(id) || typeof url !== 'string') return;
    const photos = Object.assign({}, this._uSt().photos || {});
    photos[id] = url;
    this.setState({ photos: photos });
    try { window.localStorage.setItem(this._uStoreKey() + ':photos', JSON.stringify(photos)); } catch (err) { /* storage full or blocked: the photo lives in this tab only */ }
  }
  _uLoadPhotos() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(this._uStoreKey() + ':photos') : null;
      const d = raw ? JSON.parse(raw) : null;
      const out = {};
      if (!d || typeof d !== 'object') return out;
      for (const s of this._uStops()) if (typeof d[s.id] === 'string' && d[s.id].indexOf('data:image/') === 0) out[s.id] = d[s.id];
      return out;
    } catch (err) { return {}; }
  }
  // engine → UI at each shot: the narrator reads the place, then what we see
  _uFilmCue(id, shot) {
    const s = this._uStop(id);
    if (!s) return;
    if (shot === 0) this._uSay('จุดที่ ' + s.id + ' ' + (s.place || s.title || ''), 'narrator');
    else if (shot === 1 && s.scene) this._uSay(s.scene, 'narrator', true);
  }
  _uNarrPref() { const st = this._uSt(); return st.narr == null ? true : !!st.narr; }
  _uNarrOn() { return this._uNarrPref() && this._uSoundOn() && !!this._uSt().ttsOk; }
  _uToggleNarr() {
    const on = !this._uNarrPref();
    this.setState({ narr: on });
    if (!on) this._uSayStop();
    this._uE('_eNarr', on && this._uSoundOn() && !!this._uSt().ttsOk);
    this._uSave({ narr: on });
  }
  // best Thai voice on this device (Edge's natural voices, then Google, then the system voice)
  _uTtsVoice() {
    const ss = window.speechSynthesis;
    if (!ss || typeof window.SpeechSynthesisUtterance !== 'function') return null;
    const vs = ss.getVoices() || [];
    if (this.__uVoiceN === vs.length) return this.__uVoice || null;
    const th = vs.filter((v) => /^th([-_]|$)/i.test(v.lang || ''));
    const rank = (v) => (/Premwadee|Niwat|Natural|Neural/i.test(v.name) ? 0 : (/Google/i.test(v.name) ? 1 : (/Kanya|Narisa|Pattara/i.test(v.name) ? 2 : 3)));
    th.sort((a, b) => rank(a) - rank(b));
    this.__uVoiceN = vs.length;
    this.__uVoice = th[0] || null;
    return this.__uVoice;
  }
  // formulas and units read as words
  _uSayText(t) {
    const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
    let s = String(t || '').replace(/[₀-₉]/g, (c) => SUB[c]).replace(/\(ข้อมูลสมมติเพื่อการสอน\)/g, '');
    const R = [
      [/tCO2e/g, ' ตันคาร์บอนไดออกไซด์เทียบเท่า '], [/kgCO2e/g, ' กิโลกรัมคาร์บอนไดออกไซด์เทียบเท่า '], [/CO2e/g, ' คาร์บอนไดออกไซด์เทียบเท่า '],
      [/CO2/g, ' คาร์บอนไดออกไซด์ '], [/CH4/g, ' มีเทน '], [/N2O/g, ' ไนตรัสออกไซด์ '], [/SF6/g, ' เอสเอฟหก '], [/NF3/g, ' เอ็นเอฟสาม '],
      [/HFC-?(\d+\w*)/g, ' เอชเอฟซี $1 '], [/HFCs?/g, ' เอชเอฟซี '], [/PFCs?/g, ' พีเอฟซี '], [/R-(\d+)/g, ' อาร์ $1 '],
      [/LPG/g, ' แอลพีจี '], [/GWP/g, ' จีดับเบิลยูพี '], [/ISO/g, ' ไอเอสโอ '], [/CFO/g, ' ซีเอฟโอ '], [/IPCC/g, ' ไอพีซีซี '], [/AWD/g, ' เอดับเบิลยูดี '],
      [/BOD/g, ' บีโอดี '], [/\bEF/g, ' อีเอฟ '], [/\bAD\b/g, ' เอดี '], [/TJ\b/g, ' เทราจูล '], [/kWh/g, ' กิโลวัตต์ชั่วโมง '],
      [/(\d)\s*kg\b/g, '$1 กิโลกรัม '], [/(\d)\s*km\b/g, '$1 กิโลเมตร '], [/(\d)\s*ha\b/g, '$1 เฮกตาร์ '], [/(\d)\s*L\b/g, '$1 ลิตร '], [/(\d)\s*t\b/g, '$1 ตัน '],
      [/m³/g, ' ลูกบาศก์เมตร '], [/%/g, ' เปอร์เซ็นต์ '], [/×/g, ' คูณ '], [/÷/g, ' หาร '], [/=/g, ' เท่ากับ '], [/[→“”"]/g, ' ']
    ];
    for (const r of R) s = s.replace(r[0], r[1]);
    return s.replace(/\s+/g, ' ').trim();
  }
  _uSay(text, who, queue) {
    if (!this._uNarrOn()) return;
    const ss = window.speechSynthesis;
    const v = this._uTtsVoice();
    const s = this._uSayText(text);
    if (!ss || !v || !s) return;
    try {
      if (!queue) ss.cancel();
      const pitch = { owl: 0.9, sapling: 1.08, firefly: 1.22 }[who] || 1;
      // short chunks: some voices stop reading after ~15 s
      const parts = [];
      let cur = '';
      for (const w of s.split(' ')) {
        if (cur && (cur + ' ' + w).length > 110) { parts.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
      }
      if (cur) parts.push(cur);
      for (const p of parts) {
        const u = new window.SpeechSynthesisUtterance(p);
        u.voice = v; u.lang = v.lang; u.rate = 1.05; u.pitch = pitch; u.volume = 1;
        ss.speak(u);
      }
    } catch (err) { /* speech unavailable */ }
  }
  _uSayStop() { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (err) { /* ignore */ } }

  // touch joystick ring: the engine moves it (no re-render per finger move)
  _joyRef() {
    if (!this.__jref) {
      this.__jref = (el) => {
        this.__joyEl = el || null;
        if (el && this._E && typeof this._pJoyDraw === 'function') this._pJoyDraw();
      };
    }
    return this.__jref;
  }
  // trainee name on the certificate (kept element: typing never re-renders it)
  _nameRef() {
    if (!this.__nref) {
      this.__nref = (el) => {
        if (!el) return;
        el.value = String(this._uSt().trainee || '');
        el.addEventListener('input', () => {
          const v = el.value.slice(0, 80);
          this.setState({ trainee: v });
          if (this.__uNameT) clearTimeout(this.__uNameT);
          this.__uNameT = setTimeout(() => { this.__uNameT = null; this._uSave({ trainee: v }); }, 400);
        });
      };
    }
    return this.__nref;
  }

  _canvasRef() {
    if (!this.__cref) {
      this.__cref = (el) => {
        if (el) {
          if (this._E && this._E.canvas === el) return;
          if (typeof this._dispose === 'function') this._dispose();
          if (typeof this._boot === 'function') this._boot(el);
          else this.setState({ webgl: false });
        } else if (typeof this._dispose === 'function') {
          this._dispose();
        }
      };
    }
    return this.__cref;
  }

  _mapRef() {
    if (!this.__mref) {
      this.__mref = (el) => {
        this.__mapEl = el || null;
        if (typeof this._mapAttach === 'function') {
          try { this._mapAttach(el || null); } catch (err) { console.error('[GHG UI] _mapAttach', err); }
        }
      };
    }
    return this.__mref;
  }
}

if (window.GHGTownMixin) {
  const P = window.GHGTownMixin.prototype;
  for (const k of Object.getOwnPropertyNames(P)) {
    if (k !== 'constructor' && !Object.prototype.hasOwnProperty.call(Component.prototype, k)) Component.prototype[k] = P[k];
  }
}
window.GHGApp = window.DCLite.mount(document.getElementById("app"), window.__DC_TPL, Component);
