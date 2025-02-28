// ==UserScript==
// @name         Naurok Solver
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Solves Naurok questions
// @author       scar17off
// @match        https://naurok.com.ua/*
// @icon         https://naurok.com.ua/favicon.ico
// @grant        none
// ==/UserScript==

var EntryPoint;(()=>{"use strict";class e{constructor(){this.storageKey="naurok_solver_config",this.defaultConfig={delay:1e3,useRandomDelay:!0,minDelay:2e3,maxDelay:6e3,autoClick:!0,highlight:!0,highlightColor:"#90EE90",highlightDuration:2e3,locale:"en_US",provider:"gpt24",openaiApiKey:"",corsApiKey:""},this.initConfig()}initConfig(){const e=localStorage.getItem(this.storageKey);if(e)try{const t=JSON.parse(e);window.solveConfig={...this.defaultConfig,...t},this.saveConfig()}catch(e){console.error("Error parsing saved config:",e),window.solveConfig={...this.defaultConfig},this.saveConfig()}else localStorage.setItem(this.storageKey,JSON.stringify(this.defaultConfig)),window.solveConfig={...this.defaultConfig}}getValue(e){return window.solveConfig[e]}setValue(e,t){return e in this.defaultConfig&&(window.solveConfig[e]=t,this.saveConfig(),!0)}saveConfig(){localStorage.setItem(this.storageKey,JSON.stringify(window.solveConfig))}resetToDefault(){window.solveConfig={...this.defaultConfig},this.saveConfig()}}class t{constructor(t,n=new e){this.isVisible=!1,this.elements=new Map,this.title=t,this.configManager=n,this.container=this.createContainer(),this.styleElement=this.createStyles(),this.setupDragging()}createContainer(){const e=document.createElement("div");return e.className="solver-ui",e.innerHTML=`\n            <button class="close-btn">×</button>\n            <h2>${this.title}</h2>\n            <div class="content"></div>\n            <div class="footer"></div>\n        `,e.querySelector(".close-btn").addEventListener("click",(()=>this.hide())),e}createStyles(){const e=document.createElement("style");return e.textContent='\n.solver-ui {\n    position: fixed;\n    top: 50%;\n    left: 50%;\n    margin-left: -150px;\n    margin-top: -150px;\n    background: #1a1a1a;\n    color: #fff;\n    padding: 20px;\n    border-radius: 8px;\n    font-family: Arial, sans-serif;\n    z-index: 10000;\n    min-width: 300px;\n    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n    display: none;\n    user-select: none;\n}\n\n.solver-ui.visible {\n    display: block;\n}\n\n.solver-ui h2 {\n    margin: 0 0 15px 0;\n    font-size: 18px;\n    color: #fff;\n    border-bottom: 2px solid #333;\n    padding-bottom: 8px;\n    cursor: move;\n}\n\n.solver-ui .setting-row {\n    margin: 10px 0;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n.solver-ui label {\n    margin-right: 10px;\n    font-size: 14px;\n}\n\n.solver-ui input[type="number"] {\n    width: 80px;\n    padding: 4px;\n    border: 1px solid #333;\n    background: #2a2a2a;\n    color: #fff;\n    border-radius: 4px;\n}\n\n.solver-ui input[type="checkbox"] {\n    width: 16px;\n    height: 16px;\n    accent-color: #4CAF50;\n}\n\n.solver-ui input[type="color"] {\n    width: 40px;\n    height: 25px;\n    padding: 0 2px;\n    border: none;\n    border-radius: 4px;\n    background: #2a2a2a;\n}\n\n.solver-ui .close-btn {\n    position: absolute;\n    top: 10px;\n    right: 10px;\n    background: none;\n    border: none;\n    color: #fff;\n    cursor: pointer;\n    font-size: 18px;\n    opacity: 0.7;\n}\n\n.solver-ui .close-btn:hover {\n    opacity: 1;\n}\n\n.solver-ui .keybind-info {\n    margin: 0;\n    padding: 0;\n    border: none;\n    font-size: 12px;\n    color: #888;\n}\n\n.solver-ui .reveal-row {\n    justify-content: space-between;\n    margin-top: 20px;\n    gap: 10px;\n}\n\n.solver-ui .reveal-btn {\n    flex: 1;\n    background: #4CAF50;\n    color: white;\n    border: none;\n    padding: 8px 16px;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 14px;\n    transition: background 0.2s;\n}\n\n.solver-ui .reveal-btn:hover {\n    background: #45a049;\n}\n\n.solver-ui .author {\n    display: block;\n    margin-top: 5px;\n    font-style: italic;\n    color: #666;\n    text-align: center;\n}\n\n.solver-ui .setting-group {\n    border: 1px solid #333;\n    border-radius: 4px;\n    padding: 10px;\n    margin: 15px 0;\n}\n\n.solver-ui .delay-row {\n    opacity: 1;\n    transition: opacity 0.3s;\n}\n\n.solver-ui .delay-row.disabled {\n    opacity: 0.5;\n}\n\n.solver-ui .delay-row input[disabled] {\n    cursor: not-allowed;\n    background: #222;\n}\n\n.solver-ui select {\n    padding: 4px;\n    border: 1px solid #333;\n    background: #2a2a2a;\n    color: #fff;\n    border-radius: 4px;\n    cursor: pointer;\n}\n\n.solver-ui select:focus {\n    outline: none;\n    border-color: #4CAF50;\n}\n\n.solver-ui .buttons-container {\n    margin-top: 20px;\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n}\n\n.solver-ui .button-row {\n    display: flex;\n    gap: 10px;\n    justify-content: space-between;\n    width: 100%;\n}\n\n.solver-ui .button-row:last-child {\n    margin-top: 5px;\n}\n\n.solver-ui .reveal-btn {\n    flex: 1;\n    width: 100%;\n    background: #4CAF50;\n    color: white;\n    border: none;\n    padding: 8px 16px;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 14px;\n    transition: background 0.2s;\n}\n\n.solver-ui .reveal-btn:hover {\n    background: #45a049;\n}\n\n.solver-ui .search-btn {\n    background: #2196F3;\n}\n\n.solver-ui .search-btn:hover {\n    background: #1976D2;\n}\n\n.solver-ui .api-key-row.hidden {\n    display: none;\n}\n\n.solver-ui input[type="password"] {\n    width: 200px;\n    padding: 4px;\n    border: 1px solid #333;\n    background: #2a2a2a;\n    color: #fff;\n    border-radius: 4px;\n}\n\n.solver-ui .footer-divider {\n    border: none;\n    border-top: 1px solid #333;\n    margin: 15px 0 10px 0;\n}\n\n.solver-ui .footer-content {\n    text-align: center;\n    font-size: 12px;\n    color: #888;\n}\n',e}addToggle(e,t,n,o){const i=this.configManager.getValue(e)??n,s=document.createElement("div");s.className="setting-row",s.innerHTML=`\n            <label>${t}</label>\n            <input type="checkbox" id="${e}" ${i?"checked":""}>\n        `;const a=s.querySelector("input");return a.addEventListener("change",(t=>{this.configManager.setValue(e,t.target.checked),o?.(t.target.checked)})),this.container.querySelector(".content").appendChild(s),this.elements.set(e,a),this}addSelect(e,t,n,o,i){const s=this.configManager.getValue(e)??o,a=document.createElement("div");a.className="setting-row",a.innerHTML=`\n            <label>${t}</label>\n            <select id="${e}">\n                ${Object.entries(n).map((([e,t])=>`\n                    <option value="${e}" ${e===s?"selected":""}>\n                        ${t}\n                    </option>\n                `)).join("")}\n            </select>\n        `;const r=a.querySelector("select");return r.addEventListener("change",(t=>{this.configManager.setValue(e,t.target.value),i?.(t.target.value)})),this.container.querySelector(".content").appendChild(a),this.elements.set(e,r),this}addNumberInput(e,t,n,o,i,s,a){const r=this.configManager.getValue(e)??n,l=document.createElement("div");l.className="setting-row",l.innerHTML=`\n            <label>${t}</label>\n            <input type="number" id="${e}" \n                value="${r}"\n                min="${o||0}"\n                max="${i||""}"\n                step="${s||1}">\n        `;const c=l.querySelector("input");return c.addEventListener("change",(t=>{const n=parseInt(t.target.value);this.configManager.setValue(e,n),a?.(n)})),this.container.querySelector(".content").appendChild(l),this.elements.set(e,c),this}addColorPicker(e,t,n,o){const i=this.configManager.getValue(e)??n,s=document.createElement("div");s.className="setting-row",s.innerHTML=`\n            <label>${t}</label>\n            <input type="color" id="${e}" value="${i}">\n        `;const a=s.querySelector("input");return a.addEventListener("change",(t=>{this.configManager.setValue(e,t.target.value),o?.(t.target.value)})),this.container.querySelector(".content").appendChild(s),this.elements.set(e,a),this}addButton(e,t,n,o=""){const i=document.createElement("button");return i.id=e,i.className=`reveal-btn ${o}`,i.textContent=t,i.addEventListener("click",n),this.container.querySelector(".content").appendChild(i),this.elements.set(e,i),this}addButtonRow(e){const t=document.createElement("div");return t.className="button-row",e.forEach((({id:e,text:n,onClick:o,className:i=""})=>{const s=document.createElement("button");s.id=e,s.className=`reveal-btn ${i}`,s.textContent=n,s.addEventListener("click",o),t.appendChild(s),this.elements.set(e,s)})),this.container.querySelector(".content").appendChild(t),this}addGroup(e){const t=document.createElement("div");return t.className="setting-group",t.id=e,this.container.querySelector(".content").appendChild(t),{addToggle:(e,n,o,i)=>{const s=this.configManager.getValue(e)??o,a=document.createElement("div");a.className="setting-row",a.innerHTML=`\n                    <label>${n}</label>\n                    <input type="checkbox" id="${e}" ${s?"checked":""}>\n                `;const r=a.querySelector("input");return r.addEventListener("change",(t=>{this.configManager.setValue(e,t.target.checked),i?.(t.target.checked)})),t.appendChild(a),this.elements.set(e,r),this},addNumberInput:(e,n,o,i,s,a,r)=>{const l=this.configManager.getValue(e)??o,c=document.createElement("div");c.className="setting-row delay-row",c.innerHTML=`\n                    <label>${n}</label>\n                    <input type="number" id="${e}" \n                        value="${l}"\n                        min="${i||0}"\n                        max="${s||""}"\n                        step="${a||1}">\n                `;const d=c.querySelector("input");return d.addEventListener("change",(t=>{const n=parseInt(t.target.value);this.configManager.setValue(e,n),r?.(n)})),t.appendChild(c),this.elements.set(e,d),this}}}addPasswordInput(e,t,n,o,i){const s=this.configManager.getValue(e)??n,a=document.createElement("div");a.className="setting-row",a.innerHTML=`\n            <label>${t}</label>\n            <input type="password" id="${e}" \n                value="${s}"\n                placeholder="${o}">\n        `;const r=a.querySelector("input");return r.addEventListener("change",(t=>{this.configManager.setValue(e,t.target.value),i?.(t.target.value)})),this.container.querySelector(".content").appendChild(a),this.elements.set(e,r),a}addFooter(e){return this.container.querySelector(".footer").innerHTML=`\n            <hr class="footer-divider">\n            <div class="footer-content">\n                ${e}\n            </div>\n        `,this}getElement(e){return this.elements.get(e)}show(){this.container.classList.add("visible"),this.isVisible=!0}hide(){this.container.classList.remove("visible"),this.isVisible=!1}toggle(){this.isVisible?this.hide():this.show()}mount(){return document.head.querySelector("#solver-styles")||(this.styleElement.id="solver-styles",document.head.appendChild(this.styleElement)),document.body.appendChild(this.container),this}setupDragging(){let e,t,n,o,i=!1;const s=this.container.querySelector("h2");s.style.cursor="move",s.addEventListener("mousedown",(e=>{if("input"===e.target.tagName.toLowerCase()||"select"===e.target.tagName.toLowerCase()||"close-btn"===e.target.className)return;const t=this.container.getBoundingClientRect();n=e.clientX-t.left,o=e.clientY-t.top,e.target===this.container.querySelector("h2")&&(i=!0)})),document.addEventListener("mousemove",(s=>{i&&(s.preventDefault(),e=s.clientX-n,t=s.clientY-o,this.container.style.left=`${e}px`,this.container.style.top=`${t}px`,this.container.style.margin="0")})),document.addEventListener("mouseup",(()=>{i=!1}))}}const n={settings:{title:"Solver Settings",autoClick:"Auto Click",randomDelay:"Random Delay",fixedDelay:"Fixed Delay (ms)",minDelay:"Min Delay (ms)",maxDelay:"Max Delay (ms)",highlight:"Highlight Answer",highlightColor:"Highlight Color",highlightDuration:"Highlight Duration (ms)",revealAnswer:"Reveal Answer",language:"Language",keybindInfo:"Press 'X' to toggle settings",author:"by scar17off",copyPrompt:"Copy Prompt",promptCopied:"Prompt copied to clipboard!",searchGoogle:"Search in Google",provider:"AI Service Provider",openaiApiKey:"OpenAI API Key"}},o={settings:{title:"Налаштування",autoClick:"Авто Клік",randomDelay:"Випадкова Затримка",fixedDelay:"Фіксована Затримка (мс)",minDelay:"Мін. Затримка (мс)",maxDelay:"Макс. Затримка (мс)",highlight:"Підсвічування Відповіді",highlightColor:"Колір Підсвічування",highlightDuration:"Тривалість Підсвічування (мс)",revealAnswer:"Показати Відповідь",language:"Мова",keybindInfo:"Натисніть 'X' щоб відкрити налаштування",author:"Розробник: scar17off",copyPrompt:"Скопіювати Запитання",promptCopied:"Запитання скопійовано!",searchGoogle:"Шукати в Google",provider:"Провайдер AI",openaiApiKey:"OpenAI API Ключ"}};class i{constructor(){this.locales={en_US:n,uk_UA:o},this.defaultLocale="en_US"}setLocale(e){this.locales[e]?this.currentLocale=e:this.currentLocale=this.defaultLocale}t(e){const t=e.split(".");let n=this.locales[this.currentLocale];for(const e of t){if(!n||!n[e]){n=this.locales[this.defaultLocale];for(const e of t)n=n&&n[e];break}n=n[e]}return n||e}}class s{constructor(){this.configManager=new e,this.i18n=new i,this.i18n.setLocale(this.configManager.getValue("locale")),this.lastAnswer=null,this.lastPrompt=null,this.window=new t(this.i18n.t("settings.title"),this.configManager),this.init(),this.setupKeyboardShortcut()}setupKeyboardShortcut(){document.removeEventListener("keydown",this.handleKeyPress),this.handleKeyPress=e=>{"x"===e.key.toLowerCase()&&this.window.toggle()},document.addEventListener("keydown",this.handleKeyPress)}init(){this.window.addSelect("provider",this.i18n.t("settings.provider"),{gpt24:"GPT-24",openai:"OpenAI",mulai:"Mulai"},"gpt24",(()=>{this.updateApiKeyVisibility(),document.dispatchEvent(new Event("providerChanged"))}));const e=this.window.addPasswordInput("openaiApiKey",this.i18n.t("settings.openaiApiKey"),"","sk-...");e.classList.toggle("hidden","openai"!==this.configManager.getValue("provider"));const t=this.window.addPasswordInput("corsApiKey","CORS.SH API Key","","temp_...");t.classList.toggle("hidden","mulai"!==this.configManager.getValue("provider")),this.updateApiKeyVisibility=()=>{const n=this.configManager.getValue("provider");e.classList.toggle("hidden","openai"!==n),t.classList.toggle("hidden","mulai"!==n)},this.window.addSelect("locale",this.i18n.t("settings.language"),{en_US:"English",uk_UA:"Українська"},"en_US",(()=>this.updateUI())),this.window.addToggle("autoClick",this.i18n.t("settings.autoClick"),!0);const n=this.window.addGroup("delay-settings");n.addToggle("useRandomDelay",this.i18n.t("settings.randomDelay"),!1,(e=>this.updateDelayInputs(e))),n.addNumberInput("delay",this.i18n.t("settings.fixedDelay"),1e3,0,null,100),n.addNumberInput("minDelay",this.i18n.t("settings.minDelay"),500,0,null,100,(()=>this.validateDelayRange())),n.addNumberInput("maxDelay",this.i18n.t("settings.maxDelay"),2e3,0,null,100,(()=>this.validateDelayRange())),this.window.addToggle("highlight",this.i18n.t("settings.highlight"),!0),this.window.addColorPicker("highlightColor",this.i18n.t("settings.highlightColor"),"#90EE90"),this.window.addNumberInput("highlightDuration",this.i18n.t("settings.highlightDuration"),2e3,0,null,100),this.window.addButtonRow([{id:"copy-prompt",text:this.i18n.t("settings.copyPrompt"),onClick:async()=>{if(this.lastPrompt)try{await navigator.clipboard.writeText(this.lastPrompt);const e=this.window.getElement("copy-prompt"),t=e.textContent;e.textContent=this.i18n.t("settings.promptCopied"),setTimeout((()=>{e.textContent=t}),2e3)}catch(e){console.error("Failed to copy prompt:",e)}}},{id:"search-google",text:this.i18n.t("settings.searchGoogle"),onClick:()=>{if(this.lastPrompt){const e=this.lastPrompt.split("\n")[0],t=`https://www.google.com/search?q=${encodeURIComponent(e)}`;window.open(t,"_blank")}},className:"search-btn"}]),this.window.addButtonRow([{id:"reveal-answer",text:this.i18n.t("settings.revealAnswer"),onClick:()=>{this.lastAnswer&&window.highlightAnswer(this.lastAnswer)}}]),this.window.addFooter(`\n            <div class="keybind-info">${this.i18n.t("settings.keybindInfo")}</div>\n            <span class="author">${this.i18n.t("settings.author")}</span>\n        `),this.window.mount(),this.updateDelayInputs(this.configManager.getValue("useRandomDelay"))}updateDelayInputs(e){const t=this.window.getElement("delay"),n=this.window.getElement("minDelay"),o=this.window.getElement("maxDelay");t.parentElement.classList.toggle("disabled",e),n.parentElement.classList.toggle("disabled",!e),o.parentElement.classList.toggle("disabled",!e),n.disabled=!e,o.disabled=!e,this.window.container.querySelectorAll(".delay-row").forEach((t=>{(t.contains(n)||t.contains(o))&&t.classList.toggle("disabled",!e)}))}validateDelayRange(){const e=this.configManager.getValue("minDelay");e>this.configManager.getValue("maxDelay")&&(this.configManager.setValue("maxDelay",e),this.window.getElement("maxDelay").value=e)}updateUI(){this.i18n.setLocale(this.configManager.getValue("locale"));const e=this.window,n=e.isVisible;this.window=new t(this.i18n.t("settings.title"),this.configManager),this.init(),n&&this.window.show(),e.container.remove()}setLastAnswer(e){this.lastAnswer=e}setLastPrompt(e){this.lastPrompt=e}updateApiKeyVisibility(){const e=this.window.getElement("openaiApiKey")?.parentElement;e&&e.classList.toggle("hidden","openai"!==this.configManager.getValue("provider"))}}class a{constructor(e){this.letters=e}async getAnswer(e){throw new Error("getAnswer must be implemented by provider")}}class r extends a{constructor(){super(),this.userId=`#/chat/${Date.now()}`,this.systemMessage="You are an AI assistant helping with test questions.\n\nInstructions:\n1. You will receive test questions with multiple choice answers\n2. The question type will be specified (single choice or multiple choice)\n3. For single answer questions, select and copy-paste exactly one answer text from the given options\n4. For multiple answer questions, copy-paste each correct answer text from the given options on a new line\n5. Be concise and respond only with the exact answer text(s) from the options\n6. Do not explain, rephrase, or add any other text"}async getAnswer(e){const t=`${e}\n\nRemember:\n- Select and copy-paste the exact answer text(s) from the given options\n- For single choice questions, provide exactly one answer\n- For multiple choice questions, put each answer on a new line\n- Do not add any explanations or extra text`,n=await fetch("https://gpt24-ecru.vercel.app/api/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"},body:JSON.stringify({messages:[{role:"system",content:this.systemMessage},{role:"user",content:t}],stream:!0,model:"gpt-4o-mini",temperature:.5,presence_penalty:0,frequency_penalty:0,top_p:1,max_tokens:4e3})});if(!n.ok)throw new Error(`API request failed: ${n.statusText}`);const o=n.body.getReader();let i="",s="";for(;;){const{value:e,done:t}=await o.read();if(t)break;s+=(new TextDecoder).decode(e);const n=s.split("\n");s=n.pop()||"";for(const e of n)if(e.startsWith("data: ")){const t=e.slice(6);if("[DONE]"===t)continue;try{const e=JSON.parse(t);e.choices[0].delta.content&&(i+=e.choices[0].delta.content)}catch(e){continue}}}i=i.replace(/\*\*/g,"").replace(/<\|endoftext\|>/g,"").replace(/\\n/g," ").replace(/\n+/g," ").replace(/\s+/g," ").trim(),console.log("GPT24 edited response:",i);const a=i.split("\n").map((e=>e.replace(/\*\*/g,"").replace(/<\|endoftext\|>/g,"").replace(/\\n/g," ").replace(/\s+/g," ").trim())).filter((e=>e.length>0));return 1===a.length?a[0]:a}}class l extends a{constructor(){super(),this.systemMessage="You are an AI assistant helping with test questions.\n\nInstructions:\n1. You will receive test questions with multiple choice answers\n2. The question type will be specified (single choice or multiple choice)\n3. For single answer questions, select and copy-paste exactly one answer text from the given options\n4. For multiple answer questions, copy-paste each correct answer text from the given options on a new line\n5. Be concise and respond only with the exact answer text(s) from the options\n6. Do not explain, rephrase, or add any other text"}async getAnswer(e){const t=`${e}\n\nRemember:\n- Select and copy-paste the exact answer text(s) from the given options\n- For single choice questions, provide exactly one answer\n- For multiple choice questions, put each answer on a new line\n- Do not add any explanations or extra text`,n=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${window.solveConfig.openaiApiKey||""}`},body:JSON.stringify({model:"gpt-4",messages:[{role:"system",content:this.systemMessage},{role:"user",content:t}],temperature:.7,max_tokens:150,stream:!0})});if(!n.ok){if(401===n.status)throw new Error("Invalid OpenAI API key");throw new Error(`API request failed: ${n.statusText}`)}const o=n.body.getReader();let i="",s="";for(;;){const{value:e,done:t}=await o.read();if(t)break;s+=(new TextDecoder).decode(e);const n=s.split("\n");s=n.pop()||"";for(const e of n)if(e.startsWith("data: ")){const t=e.slice(6);if("[DONE]"===t)continue;try{const e=JSON.parse(t);e.choices[0].delta.content&&(i+=e.choices[0].delta.content)}catch(e){continue}}}i=i.replace(/\*\*/g,"").replace(/<\|endoftext\|>/g,"").replace(/\\n/g," ").replace(/\n+/g," ").replace(/\s+/g," ").trim(),console.log("OpenAI edited response:",i);const a=i.split("\n").map((e=>e.replace(/\*\*/g,"").replace(/<\|endoftext\|>/g,"").replace(/\\n/g," ").replace(/\s+/g," ").trim())).filter((e=>e.length>0));return 1===a.length?a[0]:a}}class c extends a{constructor(){super(),this.systemMessage="You are an AI assistant helping with test questions.\n\nInstructions:\n1. You will receive test questions with multiple choice answers\n2. The question type will be specified (single choice or multiple choice)\n3. For single answer questions, select and copy-paste exactly one answer text from the given options\n4. For multiple answer questions, copy-paste each correct answer text from the given options on a new line\n5. Be concise and respond only with the exact answer text(s) from the options\n6. Do not explain, rephrase, or add any other text"}async getAnswer(e){const t=`${e}\n\nRemember:\n- Select and copy-paste the exact answer text(s) from the given options\n- For single choice questions, provide exactly one answer\n- For multiple choice questions, put each answer on a new line\n- Do not add any explanations or extra text`,n=await fetch("https://proxy.cors.sh/https://mulai.vercel.app/api/chat",{method:"POST",headers:{"Content-Type":"application/json","x-cors-api-key":window.solveConfig.corsApiKey},body:JSON.stringify({messages:[{role:"user",content:this.systemMessage},{role:"user",content:t}]})});if(!n.ok)throw new Error(`API request failed: ${n.statusText}`);const o=n.body.getReader();let i="",s="";for(;;){const{value:e,done:t}=await o.read();if(t)break;s+=(new TextDecoder).decode(e);const n=s.split("\n");s=n.pop()||"";for(const e of n)if(e.startsWith('0:"')){const t=e.slice(3,-1);t&&(i+=t)}}if(i=i.replace(/<end_of_turn>/g,"").replace(/<\|endoftext\|>/g,"").replace(/\\n/g,"\n").replace(/\s*\n\s*/g,"\n").replace(/\s+/g," ").trim(),console.log("Cleaned response:",JSON.stringify(i)),i.includes("\n")){const e=i.split("\n").map((e=>e.replace(/\*\*/g,"").replace(/\s+/g," ").trim())).filter((e=>e.length>0));return console.log("Multiple answers:",JSON.stringify(e)),e}const a=i.replace(/\*\*/g,"").replace(/\s+/g," ").trim();return console.log("Single answer:",JSON.stringify(a)),a}}!function(){const t=new e,n=new s;function o(){switch(t.getValue("provider")){case"openai":return new l;case"mulai":return new c;default:return new r}}let i=o(),a="",d=!1,u=null,p=null;async function g(e){const n=document.querySelector(".test-options-grid");if(!n)return;const o=null!==document.querySelector(".question-option-inner-multiple"),i=o?".question-option-inner-multiple":".question-option-inner.ng-scope",s=Array.from(n.querySelectorAll(i)),a=Array.isArray(e)?e:[e];t.getValue("highlight")&&s.forEach((e=>{e.style.backgroundColor=""}));const r=[];for(const e of a){const n=s.find((t=>{const n=t.querySelector(".question-option-inner-content");return(n?n.innerText:t.innerText).trim()===e.trim()}));n&&(t.getValue("highlight")&&(n.style.backgroundColor=t.getValue("highlightColor"),r.push(n)),console.log("Highlighted answer:",e))}if(t.getValue("highlight")&&setTimeout((()=>{r.forEach((e=>{e.style.backgroundColor=""}))}),t.getValue("highlightDuration")),t.getValue("autoClick")){await new Promise((e=>setTimeout(e,300)));for(const e of r){const n=t.getValue("useRandomDelay")?Math.random()*(t.getValue("maxDelay")-t.getValue("minDelay"))+t.getValue("minDelay"):t.getValue("delay");await new Promise((e=>setTimeout(e,n))),e.click(),console.log("Clicked answer:",e.innerText)}o&&(await new Promise((e=>setTimeout(e,500))),await async function(){const e=document.querySelector(".test-multiquiz-save-button");e&&(e.click(),console.log("Clicked save button"))}())}}document.addEventListener("providerChanged",(()=>{i=o()})),window.highlightAnswer=g,setTimeout((function(){setInterval((()=>{if(d)return;const e=function(){const e=document.getElementsByClassName("test-content-text")[0]?.childNodes[1]?.childNodes[0];if(!e)return null;const t=e.innerText,n=null!==document.querySelector(".question-option-inner-multiple"),o=n?".question-option-inner-multiple":".question-option-inner.ng-scope";return{question:t,answers:Array.from(document.querySelectorAll(o)).map((e=>{const t=e.querySelector(".question-option-inner-content");return t?t.innerText.trim():e.innerText.trim()})),isMultipleChoice:n}}();e&&e.question!==a&&(u&&(u.style.backgroundColor="",u=null),p&&(clearTimeout(p),p=null),d=!0,a=e.question,async function(e){if(!e)return;let t=`${e.question}\n\n`;for(const n of e.answers)t+=`${n}\n`;n.setLastPrompt(t);let o=`${e.question}\n\n`;o+=`Тип запитання: ${e.isMultipleChoice?"множинний вибір (декілька правильних відповідей)":"одиночний вибір (одна правильна відповідь)"}\n\n`,o+="Варіанти відповідей:\n";for(const t of e.answers)o+=`${t}\n`;try{const t=await i.getAnswer(o);if(Array.isArray(t)){const o=t.filter((t=>{const n=t.replace(/\s+/g," ").trim();return e.answers.includes(n)}));o.length>0?(n.setLastAnswer(o),await g(o)):console.log("No valid answers found in array response")}else{console.log("Processing single answer...");const o=t.replace(/\s+/g," ").trim();console.log("Trimmed response:",JSON.stringify(o)),console.log("Available answers:",e.answers.map((e=>JSON.stringify(e))));const i=e.answers.includes(o);if(console.log(`Checking answer "${o}": ${i?"valid":"invalid"}`),i)n.setLastAnswer(o),await g(o);else{console.log("No valid answer found in single response");const t=e.answers.find((e=>e.toLowerCase().includes(o.toLowerCase())||o.toLowerCase().includes(e.toLowerCase())));t&&(console.log("Found fuzzy match:",t),n.setLastAnswer(t),await g(t))}}}catch(e){console.error("Error getting answer:",e)}}(e).finally((()=>{d=!1})))}),1e3)}),1e3)}(),EntryPoint={}})();