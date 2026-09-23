(() => {
  const SUBJECTS = {
    xizong: { name: '西综', color: '#33756d', soft: '#e5f1ee', icon: '西', hint: '真题 · 生化导图 · 背诵' },
    english: { name: '英语', color: '#6258a5', soft: '#eeeaf9', icon: '英', hint: '单词 · 作文 · 订正' },
    politics: { name: '政治', color: '#a36039', soft: '#f7ece4', icon: '政', hint: '固定学习 · 复盘' }
  };
  const WEEK = ['日','一','二','三','四','五','六'];
  const STORE = 'yantu_kaoyan_v1';

  const DEFAULT_TEMPLATES = [
    { id:'tpl-xz-video', subject:'xizong', title:'10年真题录播 × 2节', chapter:'真题录播', duration:90, days:[0,1,2,3,4,5,6], enabled:true },
    { id:'tpl-xz-biochem', subject:'xizong', title:'生化导图 × 3张 + 做题', chapter:'生化整理', duration:60, days:[0,1,2,3,4,5,6], enabled:true },
    { id:'tpl-xz-memory', subject:'xizong', title:'葫芦丝背诵', chapter:'每日背诵', duration:120, days:[0,1,2,3,4,5,6], enabled:true },
    { id:'tpl-en-essay', subject:'english', title:'作文模板背诵', chapter:'作文', duration:30, days:[0,1,2,3,4,5,6], enabled:true },
    { id:'tpl-en-words', subject:'english', title:'红宝书单词 1 Unit', chapter:'红宝书', duration:30, days:[0,1,2,3,4,5,6], enabled:true },
    { id:'tpl-en-correct', subject:'english', title:'英语订正 / 阅读复盘', chapter:'阅读 · 完形 · 翻译按当天调整', duration:60, days:[0,1,2,3,4,5,6], enabled:true },
    { id:'tpl-po-daily', subject:'politics', title:'政治学习 1h', chapter:'按当前章节推进', duration:60, days:[0,1,2,3,4,5,6], enabled:true }
  ];

  const DEFAULT_WEEKLY = [
    { id:'w1', title:'完成 1 套西综真题', completed:false },
    { id:'w2', title:'完成 1 套英语整卷', completed:false },
    { id:'w3', title:'检查 2 套大作文 + 小作文背诵', completed:false },
    { id:'w4', title:'整理本周错题与下周重点', completed:false }
  ];

  const TIPS = [
    { subject:'记忆', title:'“看懂了”不等于“能想起来”', body:'复习完一个知识点后，合上资料，尝试用自己的话写出框架。主动提取本身就是强化记忆的过程。', source:'参考：Karpicke & Roediger, Science, 2008（检索练习）' },
    { subject:'安排', title:'同样的总学习量，分散练通常比突击更耐久', body:'对高频考点可以在当天、隔天、一周后再次短复习；不要只靠一次长时间重复阅读。', source:'参考：Cepeda et al., Psychological Bulletin, 2006（间隔效应元分析）' },
    { subject:'真题', title:'做完真题后，解释“为什么错”比只记答案更值钱', body:'把错误归到知识缺口、审题、选项辨析或时间分配，下一轮复习才能针对真正的原因。', source:'参考：Dunlosky et al., Psychological Science in the Public Interest, 2013（学习技术综述）' },
    { subject:'英语', title:'背作文模板时，最好同时练“无提示回忆”', body:'看着模板读很多遍容易产生熟悉感。遮住原文，按逻辑骨架复述或默写，才更接近考场调用。', source:'依据：检索练习与生成效应相关实验研究' },
    { subject:'专注', title:'休息不是中断计划，而是计划的一部分', body:'高负荷学习后，短时离开材料并做真正的休息，有利于下一段学习保持注意质量。', source:'参考：Lim & Dinges, Sleep, 2010（睡眠剥夺与认知表现元分析）' },
    { subject:'复盘', title:'把“明天做什么”写具体，会降低重新启动成本', body:'例如不要只写“英语”，而是写“红宝书 Unit 15 + 阅读订正 2 篇”。任务越可执行，开始越容易。', source:'参考：Gollwitzer, American Psychologist, 1999（实施意图）' },
    { subject:'节奏', title:'先完成高价值任务，再追求任务数量', body:'进度条是反馈工具，不是目标本身。若当天状态有限，优先保住真题、核心背诵和订正。', source:'设计原则：优先级与可执行计划结合' },
    { subject:'错题', title:'错题复习不要只重看，最好重新作答', body:'如果只是看解析，容易误以为已经掌握。隔一段时间重新做，才能检测这个错误是否真正消失。', source:'参考：Roediger & Karpicke, Psychological Science, 2006（测试效应）' }
  ];

  const today = formatDate(new Date());
  let state = loadState();
  let activeDate = today;
  let activeTipIndex = tipIndexForDate(activeDate);
  let focus = { taskId:null, startedAt:null, elapsedBefore:0, paused:false, timer:null, targetSeconds:0 };

  const $ = id => document.getElementById(id);
  const els = {
    globalSearch:$('globalSearch'), searchPanel:$('searchPanel'), dateLabel:$('dateLabel'), progressRing:$('progressRing'), progressPercent:$('progressPercent'), doneCount:$('doneCount'), focusTime:$('focusTime'), examCountdown:$('examCountdown'), subjectProgress:$('subjectProgress'), tipSubject:$('tipSubject'), tipTitle:$('tipTitle'), tipBody:$('tipBody'), tipSource:$('tipSource'), weekStrip:$('weekStrip'), activeDate:$('activeDate'), subjectGrid:$('subjectGrid'), weeklyChecklist:$('weeklyChecklist'), dailyNote:$('dailyNote'), noteSaved:$('noteSaved'), templateList:$('templateList'), focusDock:$('focusDock'), focusSubject:$('focusSubject'), focusTaskTitle:$('focusTaskTitle'), focusClock:$('focusClock'), pauseFocus:$('pauseFocus'), toast:$('toast')
  };

  function loadState(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORE));
      if(saved) return { tasks:saved.tasks||[], templates:saved.templates||DEFAULT_TEMPLATES, weekly:saved.weekly||{}, focusLogs:saved.focusLogs||[], notes:saved.notes||{}, settings:saved.settings||{} };
    }catch(e){}
    return { tasks:[], templates:structuredClone(DEFAULT_TEMPLATES), weekly:{}, focusLogs:[], notes:{}, settings:{} };
  }
  function saveState(){ localStorage.setItem(STORE, JSON.stringify(state)); }
  function uid(prefix='id'){ return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`; }
  function formatDate(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
  function parseDate(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
  function addDays(s,n){ const d=parseDate(s); d.setDate(d.getDate()+n); return formatDate(d); }
  function mondayOf(s){ const d=parseDate(s); const day=d.getDay(); const diff=(day===0?-6:1-day); d.setDate(d.getDate()+diff); return formatDate(d); }
  function weekKey(s){ return mondayOf(s); }
  function dateText(s){ const d=parseDate(s); return `${d.getMonth()+1}月${d.getDate()}日 星期${WEEK[d.getDay()]}`; }
  function htmlSafe(v=''){ return String(v).replace(/[&<>'"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }
  function dayLabel(days){ if(days.length===7) return '每天'; if(days.length===5 && [1,2,3,4,5].every(x=>days.includes(x))) return '工作日'; return days.slice().sort().map(d=>`周${WEEK[d]}`).join(' · '); }

  function ensureDateTasks(date){
    const dow=parseDate(date).getDay();
    state.templates.filter(t=>t.enabled && t.days.includes(dow)).forEach(t=>{
      if(!state.tasks.some(task=>task.date===date && task.templateId===t.id)){
        state.tasks.push({ id:uid('task'), date, subject:t.subject, title:t.title, chapter:t.chapter||'', duration:Number(t.duration)||0, completed:false, templateId:t.id, createdAt:Date.now() });
      }
    });
    saveState();
  }

  function tasksFor(date,subject){ ensureDateTasks(date); return state.tasks.filter(t=>t.date===date && (!subject || t.subject===subject)); }

  function render(){
    ensureDateTasks(activeDate);
    els.activeDate.value=activeDate;
    els.dateLabel.textContent=dateText(activeDate).toUpperCase();
    renderTip(); renderProgress(); renderWeek(); renderSubjects(); renderWeekly(); renderNote(); renderTemplates();
  }

  function renderProgress(){
    const tasks=tasksFor(activeDate); const done=tasks.filter(t=>t.completed).length; const pct=tasks.length?Math.round(done/tasks.length*100):0;
    els.progressRing.style.background=`conic-gradient(var(--brand) ${pct*3.6}deg,#e6ebe7 0deg)`;
    els.progressPercent.textContent=`${pct}%`; els.doneCount.textContent=`${done} / ${tasks.length}`;
    const minutes=Math.round(state.focusLogs.filter(x=>x.date===activeDate).reduce((s,x)=>s+x.seconds,0)/60);
    els.focusTime.textContent=minutes>=60?`${Math.floor(minutes/60)}h ${minutes%60}m`:`${minutes} min`;
    if(state.settings.examDate){ const diff=Math.ceil((parseDate(state.settings.examDate)-parseDate(activeDate))/86400000); els.examCountdown.textContent=diff>=0?`${diff} 天`:'已结束'; } else els.examCountdown.textContent='未设置';
    els.subjectProgress.innerHTML=Object.entries(SUBJECTS).map(([key,s])=>{ const list=tasks.filter(t=>t.subject===key), c=list.filter(t=>t.completed).length, p=list.length?Math.round(c/list.length*100):0; return `<div class="subject-progress-row"><span>${s.name}</span><div class="bar"><div class="bar-fill" style="width:${p}%;background:${s.color}"></div></div><strong>${p}%</strong></div>`; }).join('');
  }

  function renderTip(){ const tip=TIPS[activeTipIndex%TIPS.length]; els.tipSubject.textContent=`今日备考冷知识 · ${tip.subject}`; els.tipTitle.textContent=tip.title; els.tipBody.textContent=tip.body; els.tipSource.textContent=tip.source; }
  function tipIndexForDate(date){ return [...date].reduce((a,c)=>a+c.charCodeAt(0),0)%TIPS.length; }

  function renderWeek(){
    const start=mondayOf(activeDate); let html='';
    for(let i=0;i<7;i++){ const date=addDays(start,i); const d=parseDate(date); const tasks=tasksFor(date); const done=tasks.filter(t=>t.completed).length; const p=tasks.length?Math.round(done/tasks.length*100):0;
      html+=`<button class="week-day ${date===activeDate?'active':''}" data-date="${date}"><div class="week-top"><span class="weekday">周${WEEK[d.getDay()]}</span><span class="day-num">${d.getDate()}</span></div><span class="week-count">${done}/${tasks.length} 完成</span><div class="week-mini"><span style="width:${p}%"></span></div></button>`;
    }
    els.weekStrip.innerHTML=html;
  }

  function renderSubjects(){
    els.subjectGrid.innerHTML=Object.entries(SUBJECTS).map(([key,s])=>{
      const tasks=tasksFor(activeDate,key); const done=tasks.filter(t=>t.completed).length;
      const rows=tasks.length?tasks.map(t=>`<div class="task-row ${t.completed?'completed':''}" data-task-id="${t.id}">
        <button class="task-check" data-action="toggle" title="${t.completed?'取消完成':'标记完成'}">${t.completed?'✓':''}</button>
        <div class="task-copy"><div class="task-title">${htmlSafe(t.title)}</div><div class="task-meta">${t.chapter?`<span class="meta-pill">${htmlSafe(t.chapter)}</span>`:''}${t.duration?`<span class="meta-pill">${t.duration} min</span>`:''}${t.templateId?'<span class="meta-pill">模板</span>':''}</div></div>
        <div class="task-actions"><button class="mini-btn" data-action="focus" title="开始计时">▶</button><button class="mini-btn" data-action="edit" title="编辑">✎</button><button class="mini-btn" data-action="delete" title="删除">×</button></div></div>`).join(''):`<div class="empty-state">今天还没有 ${s.name} 任务。</div>`;
      return `<article class="subject-panel"><div class="subject-head" style="background:linear-gradient(180deg,${s.soft},#fff)"><div class="subject-title-row"><div class="subject-name"><span class="subject-dot" style="background:${s.color}"></span><h2>${s.name}</h2></div><span class="subtle">${done}/${tasks.length}</span></div><small>${s.hint}</small></div><div class="subject-task-list">${rows}</div><div class="subject-footer"><button class="add-inline" data-add-subject="${key}">＋ 添加 ${s.name} 任务</button></div></article>`;
    }).join('');
  }

  function currentWeekly(){ const key=weekKey(activeDate); if(!state.weekly[key]) state.weekly[key]=structuredClone(DEFAULT_WEEKLY); return state.weekly[key]; }
  function renderWeekly(){ const items=currentWeekly(); els.weeklyChecklist.innerHTML=items.length?items.map(item=>`<label class="weekly-row ${item.completed?'completed':''}" data-weekly-id="${item.id}"><input type="checkbox" ${item.completed?'checked':''}/><span>${htmlSafe(item.title)}</span><button class="delete-text" type="button">删除</button></label>`).join(''):`<div class="weekly-empty">本周还没有固定检查事项。</div>`; saveState(); }

  function renderNote(){ els.dailyNote.value=state.notes[activeDate]||''; }
  function renderTemplates(){ els.templateList.innerHTML=state.templates.map(t=>{ const s=SUBJECTS[t.subject]; return `<div class="template-row ${t.enabled?'':'disabled'}" data-template-id="${t.id}"><div class="template-icon" style="background:${s.soft};color:${s.color}">${s.icon}</div><div><strong>${htmlSafe(t.title)}</strong><small>${dayLabel(t.days)}${t.duration?` · ${t.duration} min`:''}${t.chapter?` · ${htmlSafe(t.chapter)}`:''}</small></div><div class="template-actions"><button class="mini-btn" data-template-action="toggle" title="启用/停用">${t.enabled?'●':'○'}</button><button class="mini-btn" data-template-action="edit" title="编辑">✎</button><button class="mini-btn" data-template-action="delete" title="删除">×</button></div></div>`; }).join(''); }

  function setActiveDate(date){ activeDate=date; activeTipIndex=tipIndexForDate(date); render(); }
  function openModal(id){ $(id).classList.remove('hidden'); }
  function closeModal(id){ $(id).classList.add('hidden'); }
  function toast(msg){ els.toast.textContent=msg; els.toast.classList.remove('hidden'); clearTimeout(toast.t); toast.t=setTimeout(()=>els.toast.classList.add('hidden'),2200); }

  function openTaskModal(subject='xizong', task=null){
    $('taskModalTitle').textContent=task?'编辑任务':'添加任务'; $('taskId').value=task?.id||''; $('taskSubject').value=task?.subject||subject; $('taskDate').value=task?.date||activeDate; $('taskTitle').value=task?.title||''; $('taskChapter').value=task?.chapter||''; $('taskDuration').value=task?.duration||''; openModal('taskModal'); setTimeout(()=>$('taskTitle').focus(),50);
  }
  function openTemplateModal(t=null){
    $('templateModalTitle').textContent=t?'编辑模板':'新建模板'; $('templateId').value=t?.id||''; $('templateSubject').value=t?.subject||'xizong'; $('templateTitle').value=t?.title||''; $('templateChapter').value=t?.chapter||''; $('templateDuration').value=t?.duration||'';
    $('weekdayPills').innerHTML=[1,2,3,4,5,6,0].map(d=>`<label class="weekday-pill"><input type="checkbox" value="${d}" ${(t?.days||[0,1,2,3,4,5,6]).includes(d)?'checked':''}><span>周${WEEK[d]}</span></label>`).join(''); openModal('templateModal');
  }

  function startFocus(task){
    stopFocusTimer(); focus={ taskId:task.id, startedAt:Date.now(), elapsedBefore:0, paused:false, timer:null, targetSeconds:(Number(task.duration)||0)*60 };
    els.focusSubject.textContent=`${SUBJECTS[task.subject].name} · 专注中`; els.focusTaskTitle.textContent=task.title; els.pauseFocus.textContent='暂停'; els.focusDock.classList.remove('hidden'); updateFocusClock(); focus.timer=setInterval(updateFocusClock,1000);
  }
  function elapsedSeconds(){ if(!focus.taskId) return 0; return focus.elapsedBefore + (focus.paused?0:Math.floor((Date.now()-focus.startedAt)/1000)); }
  function updateFocusClock(){ const elapsed=elapsedSeconds(); let shown=elapsed; if(focus.targetSeconds>0) shown=Math.max(0,focus.targetSeconds-elapsed); const m=Math.floor(shown/60), s=shown%60; els.focusClock.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; if(focus.targetSeconds>0 && shown===0){ els.focusClock.textContent='完成'; } }
  function pauseFocus(){ if(!focus.taskId) return; if(focus.paused){ focus.startedAt=Date.now(); focus.paused=false; els.pauseFocus.textContent='暂停'; } else { focus.elapsedBefore=elapsedSeconds(); focus.paused=true; els.pauseFocus.textContent='继续'; } }
  function stopFocusTimer(){ if(focus.timer) clearInterval(focus.timer); }
  function finishFocus(markDone){ if(!focus.taskId) return; const seconds=Math.max(1,elapsedSeconds()); const task=state.tasks.find(t=>t.id===focus.taskId); if(task){ state.focusLogs.push({id:uid('focus'),taskId:task.id,date:task.date,seconds,endedAt:Date.now()}); if(markDone) task.completed=true; } saveState(); stopFocusTimer(); focus={taskId:null,startedAt:null,elapsedBefore:0,paused:false,timer:null,targetSeconds:0}; els.focusDock.classList.add('hidden'); render(); toast(markDone?'已记录专注时间并完成任务':'已记录本次专注时间'); }

  function runSearch(q){
    q=q.trim().toLowerCase(); if(!q){ els.searchPanel.classList.add('hidden'); return; }
    const results=state.tasks.filter(t=>`${t.title} ${t.chapter} ${t.date} ${SUBJECTS[t.subject].name}`.toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,18);
    els.searchPanel.innerHTML=results.length?results.map(t=>`<button class="search-result" data-search-task="${t.id}"><span class="dot" style="background:${SUBJECTS[t.subject].color}"></span><span><strong>${htmlSafe(t.title)}</strong><small>${t.date} · ${SUBJECTS[t.subject].name}${t.chapter?` · ${htmlSafe(t.chapter)}`:''}</small></span><span>${t.completed?'✓':'→'}</span></button>`).join(''):`<div class="search-empty">没有找到相关任务。</div>`;
    els.searchPanel.classList.remove('hidden');
  }

  $('taskForm').addEventListener('submit',e=>{ e.preventDefault(); const id=$('taskId').value; const data={ subject:$('taskSubject').value,date:$('taskDate').value,title:$('taskTitle').value.trim(),chapter:$('taskChapter').value.trim(),duration:Number($('taskDuration').value)||0 };
    if(id){ const t=state.tasks.find(x=>x.id===id); Object.assign(t,data); } else state.tasks.push({id:uid('task'),...data,completed:false,createdAt:Date.now()}); saveState(); closeModal('taskModal'); setActiveDate(data.date); toast(id?'任务已更新':'任务已添加'); });

  $('templateForm').addEventListener('submit',e=>{ e.preventDefault(); const id=$('templateId').value; const days=[...$('weekdayPills').querySelectorAll('input:checked')].map(x=>Number(x.value)); if(!days.length){ toast('至少选择一天'); return; } const data={subject:$('templateSubject').value,title:$('templateTitle').value.trim(),chapter:$('templateChapter').value.trim(),duration:Number($('templateDuration').value)||0,days,enabled:true}; if(id){ const t=state.templates.find(x=>x.id===id); const enabled=t.enabled; Object.assign(t,data,{enabled}); } else state.templates.push({id:uid('tpl'),...data}); saveState(); closeModal('templateModal'); render(); toast(id?'模板已更新；已生成任务不会被改动':'模板已添加'); });

  $('weeklyForm').addEventListener('submit',e=>{ e.preventDefault(); const title=$('weeklyTitle').value.trim(); if(!title)return; currentWeekly().push({id:uid('weekly'),title,completed:false}); $('weeklyTitle').value=''; saveState(); closeModal('weeklyModal'); renderWeekly(); });
  $('examForm').addEventListener('submit',e=>{ e.preventDefault(); state.settings.examDate=$('examDateInput').value; saveState(); closeModal('examModal'); renderProgress(); toast('考试日已保存'); });

  els.subjectGrid.addEventListener('click',e=>{ const add=e.target.closest('[data-add-subject]'); if(add){ openTaskModal(add.dataset.addSubject); return; } const row=e.target.closest('[data-task-id]'); if(!row)return; const task=state.tasks.find(t=>t.id===row.dataset.taskId); const action=e.target.closest('[data-action]')?.dataset.action; if(action==='toggle'){ task.completed=!task.completed; saveState(); render(); } if(action==='focus')startFocus(task); if(action==='edit')openTaskModal(task.subject,task); if(action==='delete'){ if(confirm(`删除任务“${task.title}”？`)){ state.tasks=state.tasks.filter(t=>t.id!==task.id); saveState(); render(); } } });
  els.weekStrip.addEventListener('click',e=>{ const b=e.target.closest('[data-date]'); if(b)setActiveDate(b.dataset.date); });
  els.weeklyChecklist.addEventListener('click',e=>{ const row=e.target.closest('[data-weekly-id]'); if(!row)return; const item=currentWeekly().find(x=>x.id===row.dataset.weeklyId); if(e.target.matches('input')){ item.completed=e.target.checked; saveState(); renderWeekly(); } if(e.target.matches('.delete-text')){ const list=currentWeekly(); state.weekly[weekKey(activeDate)]=list.filter(x=>x.id!==item.id); saveState(); renderWeekly(); } });
  els.templateList.addEventListener('click',e=>{ const row=e.target.closest('[data-template-id]'); if(!row)return; const t=state.templates.find(x=>x.id===row.dataset.templateId); const action=e.target.closest('[data-template-action]')?.dataset.templateAction; if(action==='toggle'){ t.enabled=!t.enabled; saveState(); renderTemplates(); } if(action==='edit')openTemplateModal(t); if(action==='delete'){ if(confirm(`删除模板“${t.title}”？已生成的历史任务会保留。`)){ state.templates=state.templates.filter(x=>x.id!==t.id); saveState(); renderTemplates(); } } });

  els.activeDate.addEventListener('change',()=>setActiveDate(els.activeDate.value)); $('prevDay').onclick=()=>setActiveDate(addDays(activeDate,-1)); $('nextDay').onclick=()=>setActiveDate(addDays(activeDate,1)); $('todayBtn').onclick=()=>setActiveDate(today); $('addTaskTop').onclick=()=>openTaskModal(); $('addTemplateBtn').onclick=()=>openTemplateModal(); $('addWeeklyBtn').onclick=()=>openModal('weeklyModal'); $('dataBtn').onclick=()=>openModal('dataModal');
  $('examDateBtn').onclick=()=>{ $('examDateInput').value=state.settings.examDate||''; openModal('examModal'); };
  $('shuffleTip').onclick=()=>{ activeTipIndex=(activeTipIndex+1)%TIPS.length; renderTip(); };
  els.pauseFocus.onclick=pauseFocus; $('finishFocus').onclick=()=>finishFocus(true); $('closeFocus').onclick=()=>finishFocus(false);
  els.dailyNote.addEventListener('input',()=>{ state.notes[activeDate]=els.dailyNote.value; saveState(); els.noteSaved.textContent='已保存'; clearTimeout(renderNote.t); renderNote.t=setTimeout(()=>els.noteSaved.textContent='自动保存',1300); });

  els.globalSearch.addEventListener('input',()=>runSearch(els.globalSearch.value)); els.searchPanel.addEventListener('click',e=>{ const b=e.target.closest('[data-search-task]'); if(!b)return; const t=state.tasks.find(x=>x.id===b.dataset.searchTask); if(t){ els.globalSearch.value=''; els.searchPanel.classList.add('hidden'); setActiveDate(t.date); setTimeout(()=>{ const row=document.querySelector(`[data-task-id="${t.id}"]`); row?.scrollIntoView({behavior:'smooth',block:'center'}); row?.animate([{background:'#fff5c9'},{background:'transparent'}],{duration:1300}); },80); } });
  document.addEventListener('click',e=>{ if(!e.target.closest('.search-box'))els.searchPanel.classList.add('hidden'); });
  document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); els.globalSearch.focus(); } if(e.key==='Escape'){ document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(x=>x.classList.add('hidden')); els.searchPanel.classList.add('hidden'); } });
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
  document.querySelectorAll('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{ if(e.target===m)closeModal(m.id); }));

  $('exportBtn').onclick=()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`研途备份-${today}.json`; a.click(); URL.revokeObjectURL(a.href); toast('备份已导出'); };
  $('importFile').addEventListener('change',async e=>{ const file=e.target.files[0]; if(!file)return; try{ const data=JSON.parse(await file.text()); if(!data.tasks||!data.templates)throw new Error(); if(confirm('导入会覆盖当前浏览器中的计划数据，继续吗？')){ state=data; saveState(); closeModal('dataModal'); render(); toast('备份已导入'); } }catch(err){ toast('备份文件格式不正确'); } e.target.value=''; });

  render();
})();
