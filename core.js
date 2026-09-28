/* Study Desk data model. Task dates are plans, not evidence of completion. */
export const VERSION = '4.0.0';
export const SUBJECTS = {west:{name:'西综',en:'MEDICINE',icon:'＋',quiz:true},eng:{name:'英语',en:'ENGLISH',icon:'Aa',quiz:true},pol:{name:'政治',en:'POLITICS',icon:'◎',quiz:true},misc:{name:'杂事',en:'MISC',icon:'杂',quiz:false}};
export const BASE = {start:'2026-09-24',xzAnchor:'2026-09-24',enAnchor:'2026-09-24',enStartYear:2025,redbookDone:8,bioMapsDone:29,ankiDone:0,hulusiBlock:'10',historyLeft:4,xiaoMarxDone:3,essayAlt:true,examDate:'',name:'',protectReserved:true};
export const uid = () => crypto.randomUUID();
export const esc = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function link(s){try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return ''}}
export function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T12:00:00');return !isNaN(d)&&dateKey(d)===s}
export function pd(k){return new Date(k+'T12:00:00')}
export function addDays(k,n){const d=pd(k);d.setDate(d.getDate()+n);return dateKey(d)}
export function daysBetween(a,b){return Math.round((Date.UTC(...a.split('-').map((n,i)=>+n-(i===1?1:0)))-Date.UTC(...b.split('-').map((n,i)=>+n-(i===1?1:0))))/86400000)}
export function weekDays(k){let w=pd(k).getDay()||7;return Array.from({length:7},(_,i)=>addDays(k,i-w+1))}
export function mins(s){s=Math.max(0,Math.floor(s));return s>=3600?`${Math.floor(s/3600)}h ${Math.floor(s%3600/60)}m`:`${Math.floor(s/60)} min`}
export function clock(s){s=Math.max(0,Math.floor(s));return (s>=3600?String(Math.floor(s/3600)).padStart(2,'0')+':':'')+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
const BUCKETS=new Set(['task','day','note','cfg','attempt','focus','question','bookmark']);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const key=(b,id)=>`${b}:${id}`;
export class Store extends EventTarget{
 constructor(){super();this.scope='guest';this.switchScope('guest');this.migrate()}
 switchScope(scope){this.scope=scope;this.key='kaoyanfuxi:v4:'+scope;this.error='';try{const raw=JSON.parse(localStorage.getItem(this.key)||'null');this.records=raw?.records||{};this.conflicts=raw?.conflicts||{}}catch{this.records={};this.conflicts={};this.error='本机数据读取失败，请先检查备份，不要清除浏览器数据。'}this.emit()}
 emit(){this.dispatchEvent(new Event('change'))}
 persist(){try{localStorage.setItem(this.key,JSON.stringify({version:4,records:this.records,conflicts:this.conflicts}));this.error=''}catch{this.error='本机保存失败（存储空间或浏览器权限）。请立即导出备份。'}this.emit()}
 get(b,id){const r=this.records[key(b,id)];return r&&!r.deleted?r.payload:null}
 all(b){return Object.values(this.records).filter(r=>r.bucket===b&&!r.deleted).map(r=>r.payload)}
 put(b,id,payload,deleted=false){if(!BUCKETS.has(b)||!id||id.length>180)throw Error('无效记录');const k=key(b,id),old=this.records[k];if(old&&eq(old.payload,payload)&&old.deleted===deleted)return;this.records[k]={bucket:b,record_id:id,payload,deleted,revision:old?.revision||0,dirty:true,mutation:uid()};this.persist()}
 del(b,id){const old=this.get(b,id);if(old)this.put(b,id,old,true)}
 pending(){return Object.values(this.records).filter(r=>r.dirty&&!this.conflicts[key(r.bucket,r.record_id)])}
 accept(remote,sent=null){const k=key(remote.bucket,remote.record_id),local=this.records[k];if(sent&&local?.mutation===sent.mutation){this.records[k]={...remote,dirty:false};delete this.conflicts[k]}
 else if(!local||!local.dirty){this.records[k]={...remote,dirty:false}}
 else if(eq(local.payload,remote.payload)&&local.deleted===remote.deleted){this.records[k]={...remote,dirty:false};delete this.conflicts[k]}
 else if(sent){local.revision=remote.revision}
 else if(remote.revision>local.revision){this.conflicts[k]={local:structuredClone(local),remote}}
 }
 resolve(k,choice){const c=this.conflicts[k];if(!c)return;if(choice==='remote')this.records[k]={...c.remote,dirty:false};else this.records[k]={...this.records[k],revision:c.remote.revision,dirty:true,mutation:uid()};delete this.conflicts[k];this.persist()}
 migrate(){if(this.scope!=='guest'||Object.keys(this.records).length)return;let old=null,source='';for(const k of ['kaoyan-v3','kaoyan-v2','yantu_kaoyan_v1']){try{old=JSON.parse(localStorage.getItem(k)||'null');if(old){source=k;break}}catch{}}
 if(!old)return;this.importLegacy(old);try{localStorage.setItem('kaoyanfuxi:legacy-backup:'+source,JSON.stringify(old))}catch{} }
 importLegacy(old){const convert=(t,date)=>({id:t.id||uid(),date,subject:({xizong:'west',english:'eng',politics:'pol',other:'misc',misc:'misc'})[t.subject]||t.subject,title:String(t.title||'未命名任务'),detail:String(t.detail??t.chapter??''),dur:Math.max(0,Number(t.dur??t.duration)||0),done:!!(t.done??t.completed),pri:t.pri||'normal'});
 const grouped=old.days||{};for(const t of old.tasks||[]){if(!grouped[t.date])grouped[t.date]=[];grouped[t.date].push(t)}
 for(const [d,tasks]of Object.entries(grouped)){if(!validDate(d)||!Array.isArray(tasks))continue;for(const t of tasks){const x=convert(t,d);if(SUBJECTS[x.subject])this.put('task',x.id,x)}this.put('day',d,{id:d})}
 for(const[d,text]of Object.entries(old.rev||old.notes||{}))if(validDate(d))this.put('note',d,{id:d,text:String(text)});
 for(const[d,s]of Object.entries(old.focus||{}))if(validDate(d))this.put('focus','legacy-'+d,{id:'legacy-'+d,date:d,seconds:Math.max(0,+s||0),title:'旧版专注记录'});
 for(const f of old.focusLogs||[]){const id=f.id||uid();this.put('focus',id,{...f,id,seconds:Math.max(0,+f.seconds||0),title:'旧版专注记录'})}
 this.put('cfg','plan',{...BASE,...old.cfg,examDate:old.exam||old.settings?.examDate||'',legacyTemplates:old.templates||[]});
 }
 export(){return{app:'kaoyanfuxi',version:4,exportedAt:new Date().toISOString(),records:Object.values(this.records),conflicts:this.conflicts}}
 import(data){if(data?.version===4&&Array.isArray(data.records)){for(const r of data.records){if(BUCKETS.has(r.bucket)&&typeof r.record_id==='string'&&r.record_id.length<=180&&r.payload&&typeof r.payload==='object'&&!Array.isArray(r.payload))this.put(r.bucket,r.record_id,r.payload,!!r.deleted)}}else if(data?.days||data?.tasks)this.importLegacy(data);else throw Error('不是有效的研途备份文件')}
}
export function cfg(store){const c={...BASE,...store.get('cfg','plan')};for(const [k,max]of Object.entries({redbookDone:57,bioMapsDone:34,ankiDone:1202,historyLeft:100,xiaoMarxDone:16})){const n=Number(c[k]);c[k]=Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):BASE[k]}for(const k of ['start','xzAnchor','enAnchor'])if(!validDate(c[k]))c[k]=BASE[k];if(!validDate(c.examDate))c.examDate='';c.name=String(c.name||'').slice(0,100);c.hulusiBlock=String(c.hulusiBlock||'10').slice(0,100);c.essayAlt=c.essayAlt!==false;c.protectReserved=c.protectReserved!==false;return c}
export function completedUnits(store,keyName,baseline=0,beforeDate=''){
 const set=new Set(Array.from({length:Math.max(0,+baseline||0)},(_,i)=>i+1));
 for(const task of store.all('task')){
  if(!task.done)continue;
  if(beforeDate&&validDate(task.date)&&task.date>=beforeDate)continue;
  if(keyName==='words'){
   const m=String(task.title||'').match(/红宝书\s*[·:：]?\s*Unit\s*(\d{1,2})/i);
   if(m){const n=+m[1];if(n>=1&&n<=57)set.add(n);continue}
  }
  const arr=task.units?.[keyName];
  if(Array.isArray(arr))for(const v of arr){const n=+v;if(Number.isInteger(n)&&n>0)set.add(n)}
 }
 return set
}
function missingRange(set,max,count){const out=[];for(let n=1;n<=max&&out.length<count;n++)if(!set.has(n))out.push(n);return out}
export function sequentialState(store,date,c=cfg(store)){
 const words=completedUnits(store,'words',c.redbookDone,date);
 const maps=completedUnits(store,'maps',c.bioMapsDone,date);
 const anki=completedUnits(store,'anki',c.ankiDone,date);
 return{
  words:missingRange(words,57,1),
  maps:missingRange(maps,34,3),
  mapsComplete:maps.size>=34,
  anki:missingRange(anki,1202,10)
 }
}
const LEG_CLASS_PLAN={
 '2026-09-28':['马原选择题技巧1','2026-09-21'],
 '2026-09-29':['马原选择题技巧2','2026-09-22'],
 '2026-09-30':['马原选择题技巧3','2026-09-23'],
 '2026-10-01':['马原选择题技巧4','2026-09-28'],
 '2026-10-02':['马原分析题模板1','2026-09-29'],
 '2026-10-03':['马原分析题模板2','2026-09-30'],
 '2026-10-05':['史纲选择题技巧1','2026-10-05'],
 '2026-10-06':['史纲选择题技巧2','2026-10-06'],
 '2026-10-07':['史纲分析题模板1','2026-10-07'],
 '2026-10-12':['史纲分析题模板2','2026-10-12'],
 '2026-10-13':['思修法基选择题技巧1','2026-10-13'],
 '2026-10-14':['思修法基选择题技巧2','2026-10-14'],
 '2026-10-15':['思修法基分析题模板','2026-10-15'],
 '2026-10-19':['毛中特 · 新思想选择题技巧1','2026-10-19'],
 '2026-10-20':['毛中特 · 新思想选择题技巧2','2026-10-20'],
 '2026-10-21':['新思想选择题技巧3','2026-10-21'],
 '2026-10-22':['新思想选择题技巧4','2026-10-22'],
 '2026-10-26':['新思想选择题技巧5','2026-10-26'],
 '2026-10-27':['毛中特 · 新思想分析题模板1','2026-10-27'],
 '2026-10-28':['毛中特 · 新思想分析题模板2','2026-10-28']
};
const LEG_EXTRAS={
 '2026-10-01':[['leg-homework','腿姐 · 马原课后作业3','作业任务 · 按原计划日期完成',60]],
 '2026-10-02':[['leg-homework','腿姐 · 马原课后作业4','作业任务 · 按原计划日期完成',60]],
 '2026-10-03':[['leg-homework','腿姐 · 马原课后作业5','作业任务 · 按原计划日期完成',60]],
 '2026-10-04':[['leg-review','腿姐 · 复盘任务','复盘任务 · 按原计划自由安排',0]],
 '2026-10-08':[['leg-homework','腿姐 · 史纲课后作业1','作业任务 · 按原计划日期完成',60]],
 '2026-10-09':[['leg-homework','腿姐 · 史纲课后作业2','作业任务 · 按原计划日期完成',60]],
 '2026-10-10':[['leg-review','腿姐 · 复盘任务','复盘任务 · 按原计划自由安排',0]],
 '2026-10-11':[['leg-review','腿姐 · 复盘任务','复盘任务 · 按原计划自由安排',0]],
 '2026-10-16':[['leg-homework','腿姐 · 史纲课后作业3 + 背诵','作业 + 背诵任务 · 原计划合计约 2h',120]],
 '2026-10-17':[['leg-homework','腿姐 · 史纲法基课后作业1 + 背诵','作业 + 背诵任务 · 按图中原计划执行',120]],
 '2026-10-18':[['leg-recitation','腿姐 · 背诵任务','背诵任务 · 按原计划执行',0]],
 '2026-10-19':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0]],
 '2026-10-20':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0]],
 '2026-10-21':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0]],
 '2026-10-22':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0]],
 '2026-10-23':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0],['leg-homework','腿姐 · 新思想课后作业1 + 背诵','作业 + 背诵任务 · 原计划合计约 2h',120]],
 '2026-10-24':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0],['leg-homework','腿姐 · 新思想课后作业2 + 背诵','作业 + 背诵任务 · 原计划合计约 2h',120]],
 '2026-10-25':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0],['leg-recitation','腿姐 · 背诵任务','背诵任务 · 按原计划执行',0]],
 '2026-10-26':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0]],
 '2026-10-27':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0]],
 '2026-10-28':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0]],
 '2026-10-29':[['leg-carry','腿姐 · 带背任务','带背任务 · 按原计划执行',0],['leg-homework','腿姐 · 新思想课后作业3 + 背诵','作业 + 背诵任务 · 原计划合计约 2h',120]]
};
export function generate(date,c,seq=null){const out=[];if(!validDate(date)||date<c.start)return out;const n=Math.max(0,daysBetween(date,c.start));
 const add=(id,subject,title,detail,dur=0,extra={})=>out.push({id:date+'-'+id,date,subject,title,detail,dur,done:false,pri:'normal',...extra});
 const cycle=(anchor,years)=>{const d=daysBetween(date,anchor);return d<0?{year:null,phase:0}:{year:years[Math.floor(d/4)],phase:d%4}};
 const x=cycle(c.xzAnchor,[2019,2018,2017,2016]);
 if(x.year){if(!x.phase)add('xz-paper','west',`${x.year} 年西综真题`,'上午 · 完整作答 · 四日循环第 1 天',150,{units:{xz:[x.year]},pri:'high'});else{const p=['生理 + 生化','病理 + 外科','内科 + 人文'][x.phase-1];add('xz-correct','west',`${x.year} 真题订正 · ${p}`,'四日循环：一天作答，三天订正');add('xz-class','west',`天天师兄带背 · ${p}`,`${x.year} 年课程 · 第 ${x.phase}/3 天`)}}
 add('hulusi','west','葫芦丝背诵',`当前板块 ${c.hulusiBlock} · 每日 ≥2h；导图→讲义→连贯滚动，总目标四遍`,120,{pri:'high'});
 add('med-questions','west','医考帮 · 对应章节刷题','葫芦丝之后 · 2000–2026 年 · 章节可自行填写');
 if(seq){
  if(seq.maps.length){const arr=seq.maps;add('bio-maps','west',`生化导图 · 第 ${arr.join('、')} 张`,'按实际完成推进；没勾选完成，下一天继续这组导图',0,{units:{maps:arr}})}
  else{add('bio-notes','west','生化讲义 + 对应章节题','导图阶段之后：讲义与导图持续滚动');if(seq.anki.length){const arr=seq.anki;add('anki','west',`Anki · 第 ${arr[0]}–${arr.at(-1)} 张`,'按实际完成推进；未完成的卡片范围不会被日历跳过',0,{units:{anki:arr}})}else add('anki-review','west','Anki · 旧卡滚动复习','新增卡完成后继续复习，不重复累计卡片数')}
  if(seq.words.length){const unit=seq.words[0];add('redbook','eng',`红宝书 · Unit ${unit}`,'完成才进入下一 Unit；今天没完成，明天仍从这一 Unit 开始',45,{units:{words:[unit]},pri:'high'})}else add('words-review','eng','红宝书 · 重点单词复习','首遍完成后持续回顾易错词',45)
 }else{
  const remain=34-c.bioMapsDone,start=c.bioMapsDone+n*3+1;
  if(start<=34){const arr=Array.from({length:Math.min(3,35-start)},(_,i)=>start+i);add('bio-maps','west',`生化导图 · 第 ${arr.join('、')} 张`,'完成后做对应章节 2000–2026 年题目',0,{units:{maps:arr}})}
  else{const ankiStart=c.ankiDone+Math.max(0,n-Math.ceil(remain/3))*10+1;add('bio-notes','west','生化讲义 + 对应章节题','导图阶段之后：讲义与导图持续滚动');if(ankiStart<=1202){const arr=Array.from({length:Math.min(10,1203-ankiStart)},(_,i)=>ankiStart+i);add('anki','west',`Anki · 第 ${ankiStart}–${arr.at(-1)} 张`,'按连续小章节，可调整卡片数量；此为计划范围，勾选才计入完成',0,{units:{anki:arr}})}else add('anki-review','west','Anki · 旧卡滚动复习','新增卡完成后继续复习，不重复累计卡片数')}
  const unit=c.redbookDone+n+1;if(unit<=57)add('redbook','eng',`红宝书 · Unit ${unit}`,'一天开始时背词；按实际完成打勾',45,{units:{words:[unit]},pri:'high'});else add('words-review','eng','红宝书 · 重点单词复习','首遍计划结束，持续回顾易错词',45)
 }
 if(!c.essayAlt||n%2===0)add('essay','eng','作文模板背诵','30 分钟 · 默认隔天，可在设置中调整',30);
 const years=[2025,2023,2021,2020,2019,2018,2017,2016];const e=cycle(c.enAnchor,years.slice(Math.max(0,years.indexOf(+c.enStartYear))));
 if(e.year){const phases=['下午套题作答','阅读订正','完型 + 新题型订正','翻译 + 作文订正'];add('en-paper','eng',`${e.year} 年英语 · ${phases[e.phase]}`,'2022 / 2024 / 2026 年保留考前模拟',e.phase===0?180:0,{pri:'high'})}
 const m=pd(date).getMonth()+1;let t='政治 · 当日复习',detail='按实际安排调整';
 if(m===9){t=n<c.historyLeft?'史纲视频 1 节 + 徐涛选择题':'史纲 / 马原复盘 + 选择题';detail='9 月政治约 1h；按现有选择题与复盘安排推进'}
 if(m===10){t='肖1000 · 当日章节';detail=`保留肖1000主线 · 马原起点 ${c.xiaoMarxDone}/16 章 · 史纲 20 章；按实际章节推进`}
 if(m===11){t='政治背诵 + 已发布模拟题';detail='肖四 / 肖八等按实际到书时间安排，不把预计出版月份当作已发布'}
 if(m===12){t='冲刺背诵 + 大牙材料训练';detail='按实际资料和剩余时间微调；保留错题回顾'}
 add('politics','pol',t,detail,60);
 const legClass=LEG_CLASS_PLAN[date];
 if(legClass){const [lesson,original]=legClass;const catchup=original!==date;add('leg-class','pol',`腿姐技巧班 · ${lesson}`,catchup?`补课 · 原计划 ${original.slice(5).replace('-','/')} · 追赶至 10/3，之后恢复原表`:'上课任务 · 按腿姐原计划日期执行',120,{pri:'high'})}
 for(const [id,title,d,mins] of LEG_EXTRAS[date]||[])add(id,'pol',title,d,mins);
 return out;
}
const SEQ_SUFFIXES=['-redbook','-words-review','-bio-maps','-bio-notes','-anki','-anki-review'];
function isSeqTask(t,date){return SEQ_SUFFIXES.some(s=>t.id===date+s)}
function reconcileSequential(saved,planned,date){
 const savedSeq=saved.filter(t=>isSeqTask(t,date)),savedOther=saved.filter(t=>!isSeqTask(t,date));
 if(savedSeq.some(t=>t.done))return saved;
 return [...savedOther,...planned.filter(t=>isSeqTask(t,date))]
}
function isPoliticsPlanTask(t,date){return t.id===date+'-politics'||t.id.startsWith(date+'-leg-')}
function reconcilePolitics(saved,planned,date){
 const wanted=planned.filter(t=>isPoliticsPlanTask(t,date)),wantedIds=new Set(wanted.map(t=>t.id));
 const out=saved.filter(t=>!(t.id.startsWith(date+'-leg-')&&!t.done&&!wantedIds.has(t.id)));
 const byId=new Map(out.map((x,i)=>[x.id,i]));
 for(const p of wanted){
  const i=byId.get(p.id);
  if(i===undefined){byId.set(p.id,out.length);out.push(p);continue}
  const old=out[i];
  if(!old.done&&(p.id===date+'-politics'&&old.title==='肖1000 + 腿姐技巧班'||p.id.startsWith(date+'-leg-')))out[i]=p
 }
 return out
}
export function tasksFor(store,date){
 const c=cfg(store),planned=generate(date,c,sequentialState(store,date,c));
 if(!store.get('day',date))return planned;
 let saved=store.all('task').filter(t=>t.date===date);
 saved=reconcileSequential(saved,planned,date);
 return reconcilePolitics(saved,planned,date)
}
export function materialize(store,date){
 const c=cfg(store),planned=generate(date,c,sequentialState(store,date,c));
 if(!store.get('day',date)){for(const t of planned)store.put('task',t.id,t);store.put('day',date,{id:date});return}
 const saved=store.all('task').filter(t=>t.date===date),savedSeq=saved.filter(t=>isSeqTask(t,date));
 if(!savedSeq.some(t=>t.done)){
  const wanted=planned.filter(t=>isSeqTask(t,date)),wantedIds=new Set(wanted.map(t=>t.id));
  for(const t of savedSeq)if(!wantedIds.has(t.id))store.del('task',t.id);
  for(const t of wanted)store.put('task',t.id,t)
 }
 const wantedPolitics=planned.filter(t=>isPoliticsPlanTask(t,date)),wantedPoliticsIds=new Set(wantedPolitics.map(t=>t.id));
 for(const old of store.all('task').filter(t=>t.date===date&&t.id.startsWith(date+'-leg-')&&!t.done))if(!wantedPoliticsIds.has(old.id))store.del('task',old.id);
 for(const p of wantedPolitics){
  const old=store.get('task',p.id);
  if(!old)store.put('task',p.id,p);
  else if(!old.done&&(p.id===date+'-politics'&&old.title==='肖1000 + 腿姐技巧班'||p.id.startsWith(date+'-leg-')))store.put('task',p.id,p)
 }
}
export function stats(tasks){const done=tasks.filter(t=>t.done).length;return{done,total:tasks.length,pct:tasks.length?Math.round(done/tasks.length*100):0,minutes:tasks.reduce((n,t)=>n+(+t.dur||0),0)}}
export function progress(store){
 const c=cfg(store),sets={xz:new Set([2020,2021,2022,2023,2024,2025,2026]),maps:completedUnits(store,'maps',c.bioMapsDone),words:completedUnits(store,'words',c.redbookDone),anki:completedUnits(store,'anki',c.ankiDone)};
 for(const task of store.all('task').filter(t=>t.done))for(const[k,a]of Object.entries(task.units||{}))if(k!=='words'&&sets[k]&&Array.isArray(a))a.forEach(v=>sets[k].add(v));
 return Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,v.size]))
}
export function timerElapsed(t,now=Date.now()){if(!t)return 0;const s=t.base+(t.running?Math.max(0,(now-t.since)/1000):0);return t.mode==='down'?Math.min(s,t.target):s}
export function splitInterval(start,end){const out=[];while(start<end){const d=new Date(start),k=dateKey(d),next=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime(),e=Math.min(end,next);out.push({date:k,seconds:(e-start)/1000});start=e}return out}
export function validateQuestions(input){const data=Array.isArray(input)?input:input?.questions;if(!Array.isArray(data)||!data.length||data.length>5000)throw Error('一次导入 1–5000 道题；格式请参考模板');return data.map((q,i)=>{if(!SUBJECTS[q.subject]||SUBJECTS[q.subject].quiz===false||typeof q.stem!=='string'||q.stem.length>10000||!q.stem.trim()||!Array.isArray(q.options)||q.options.length<2||q.options.length>8||!q.options.every(x=>typeof x==='string'&&x.length<=4000)||!Array.isArray(q.answer)||!q.answer.length||!q.answer.every(n=>Number.isInteger(n)&&n>=0&&n<q.options.length)||new Set(q.answer).size!==q.answer.length||(typeof q.explanation!=='string'||q.explanation.length>12000))throw Error(`第 ${i+1} 道题字段不完整或答案编号有误`);const kind=q.kind==='past'?'past':q.kind==='adapted'?'adapted':'original';if(kind==='past'&&(!Number.isInteger(Number(q.year))||Number(q.year)<1900||Number(q.year)>2100||!q.number||!q.source?.title))throw Error(`第 ${i+1} 道真题缺年份、题号或来源`);return{id:'import-'+(String(q.id||uid()).slice(0,90)),subject:q.subject,chapter:String(q.chapter||''),stem:q.stem,options:q.options,answer:q.answer,explanation:q.explanation,kind,year:q.year?Number(q.year):null,number:String(q.number||''),source:{title:String(q.source?.title||'用户提供的练习题'),url:link(q.source?.url||''),level:'用户导入，未独立核验'},imported:true}})}
