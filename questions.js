/* Question provenance is part of the data, never inferred from a badge. */
const muscle={title:'OpenStax · Anatomy and Physiology 2e, §10.3',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation',level:'开放教材（CC BY 4.0）；本题为原创，不是考研原题'};
const gases={title:'OpenStax · Anatomy and Physiology 2e, §22.5',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-5-transport-of-gases',level:'开放教材（CC BY 4.0）；本题为原创，不是考研原题'};
const blood={title:'OpenStax · Anatomy and Physiology 2e, §18.5',url:'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-5-hemostasis',level:'开放教材（CC BY 4.0）；本题为原创，不是考研原题'};
const used={title:'Cambridge · English Grammar Today: used to / be used to',url:'https://dictionary.cambridge.org/grammar/british-grammar/word-choice-used-to-and-be-used-to',level:'出版社语法参考；句子为原创练习，不是考研原题'};
const despite={title:'Cambridge · English Grammar Today: in spite of / despite',url:'https://dictionary.cambridge.org/grammar/british-grammar/despite-and-in-spite-of',level:'出版社语法参考；句子为原创练习，不是考研原题'};
const sooner={title:'Cambridge · English Grammar Today: no sooner',url:'https://dictionary.cambridge.org/grammar/british-grammar/no-sooner',level:'出版社语法参考；句子为原创练习，不是考研原题'};
const hardly={title:'Oxford Learner’s Dictionaries · hardly',url:'https://www.oxfordlearnersdictionaries.com/us/definition/english/hardly',level:'出版社词典/语法参考；句子为原创练习'};
const past=(number,url)=>({kind:'adapted',year:2019,number:String(number),source:{title:`2019 年西综第 ${number} 题 · 公开整理版`,url,level:'第三方真题整理；仅据考点重新编题，非官方试卷、非原题原文'}});
function q(id,subject,chapter,stem,options,answer,explanation,source,extra={}){return{id,subject,chapter,stem,options,answer,explanation,source,kind:'original',...extra}}
export const QUESTIONS=[
 q('med-2019-2','west','生理 · 兴奋与收缩','骨骼肌被兴奋后，直接启动肌丝收缩的胞内变化是哪一项？',['游离 Ca²⁺ 短暂增多','细胞内 K⁺ 全部耗尽','DNA 开始复制','胞内 Na⁺ 永久不变'],[0],'肌质网释放 Ca²⁺，随后钙与肌钙蛋白结合，改变薄肌丝调节状态。本题改变了题干和干扰项。',muscle,past(2,'https://info.medkaoyan.net/archives/3894')),
 q('med-2019-3','west','生理 · 血液','临床上在体内和体外均可用于抗凝血的物质是',['肝素','草酸钾','华法林','前列环素'],[0],'公开整理版参考答案为 A。考查体内与体外抗凝的区别；此处保留整理页的题干及四个选项，不把整理页称为官方答案。',{title:'233 网校：2019 年西综第 3 题',url:'https://www.233.com/kaoyan/lkzh/zhenti/202109/03180538932819.html',level:'真题公开整理版；题干、选项和参考答案已对照页面，非官方扫描件',checkedAt:'2026-09-23'},{kind:'past',year:2019,number:'3'}),
 q('med-2019-31','west','病理 · 血栓','严重休克伴弥散性血管内凝血时，微循环内的典型微血栓主要是哪一种？',['透明血栓','只含红细胞的血栓','心腔附壁血栓','动脉粥样硬化斑块'],[0],'这种微血栓主要由纤维蛋白构成，常见于微循环。对应 2019 年第 31 题考点，非逐字转载。',blood,past(31,'https://info.medkaoyan.net/archives/3894/7')),
 q('med-2019-101','west','外科 · 肿瘤','有直肠癌手术史，随后肝脏出现新结节且 CEA 升高。四个选项中首先考虑哪种性质？',['单纯肝囊肿','肝转移瘤','正常肝小叶','胆囊息肉'],[1],'既往结直肠恶性肿瘤病史与新发肝占位共同提示肝转移可能。实际诊断还需完整检查；本题仅为考点训练。',blood,past(101,'https://info.medkaoyan.net/archives/3894/21')),
 q('med-oxygen-1','west','生理 · 呼吸','局部组织温度升高、pH 降低时，血红蛋白对氧的亲和力及释氧倾向通常怎样变化？',['亲和力升高，释氧减少','亲和力下降，释氧增加','两者必定不变','血红蛋白失去全部结合位点'],[1],'升温和酸化均使氧解离曲线向右移动，有利于向组织释放氧。',gases),
 q('med-oxygen-2','west','生理 · 呼吸','哪些改变通常使氧解离曲线右移？（多选）',['温度升高','pH 降低','2,3-BPG 增多','pH 升高'],[0,1,2],'前三项降低血红蛋白对氧的亲和力；pH 升高通常使曲线左移。多选题只有全部选对、且无多选才记为正确。',gases),
 q('med-muscle-1','west','生理 · 肌肉','骨骼肌兴奋—收缩耦联中，Ca²⁺ 大量释放自何处？',['高尔基体','细胞核','肌质网','溶酶体'],[2],'肌质网储存 Ca²⁺，兴奋后释放到肌浆中。',muscle),
 q('med-muscle-2','west','生理 · 肌肉','神经—骨骼肌接头处，运动神经末梢释放的主要递质是什么？',['乙酰胆碱','胰岛素','甲状腺素','血红蛋白'],[0],'乙酰胆碱作用于终板上的受体，引起终板电位。',muscle),
 q('med-muscle-3','west','生理 · 肌肉','横桥与肌动蛋白分离，直接需要哪一步？',['新 ATP 与肌球蛋白头结合','DNA 复制','钙彻底从全身消失','肌动蛋白被分解'],[0],'新的 ATP 结合肌球蛋白头，促使其与肌动蛋白分离；ATP 随后的水解又为下个循环供能。',muscle),
 q('med-blood-1','west','生理 · 血液','使凝血块形成网架的不溶性蛋白是哪种？',['白蛋白','纤维蛋白','血红蛋白','肌红蛋白'],[1],'纤维蛋白原在凝血过程中转变为纤维蛋白，构成血凝块网架。',blood),
 q('med-blood-2','west','生理 · 血液','下列哪项更准确描述“栓子”？',['固定不动的正常心瓣膜','随血流运行的异常物质，可堵塞下游血管','所有红细胞的总称','正常溶解的氧分子'],[1],'从血管壁脱落的血栓片段可成为栓子，被血流携带后阻塞远处血管。',blood),
 q('med-oxygen-3','west','生理 · 呼吸','成熟红细胞没有线粒体，其 ATP 主要通过什么途径获得？',['糖酵解','自身线粒体氧化磷酸化','光合作用','直接消化血红蛋白'],[0],'缺乏线粒体意味着不能依靠自身线粒体的氧化磷酸化；红细胞主要通过糖酵解供能。',gases),
 q('eng-used-1','eng','语法 · 非谓语','She is used to ___ research notes before breakfast.',['review','reviewing','reviewed','reviews'],[1],'be used to 表示“习惯于”，这里的 to 是介词，后接动名词 reviewing。',used),
 q('eng-used-2','eng','语法 · 过去习惯','He used to ___ late, but his routine has changed.',['studies','studied','studying','study'],[3],'used to 后接动词原形，表示过去的习惯或状态。',used),
 q('eng-used-3','eng','语法 · 疑问句','___ you use to take handwritten notes?',['Did','Were','Are','Have'],[0],'用 did 构成一般疑问句，后面的 use 保持原形。',used),
 q('eng-despite-1','eng','语法 · 让步','___ the heavy rain, the laboratory remained open.',['Although','Despite','Even though','Because'],[1],'空格后为名词短语，用 despite；although 和 even though 通常引导从句。',despite),
 q('eng-despite-2','eng','语法 · 介词','The team kept working despite ___ tired.',['be','was','being','were'],[2],'despite 后可以接名词或动名词结构，故选 being。',despite),
 q('eng-sooner-1','eng','语法 · 固定搭配','No sooner had the seminar ended ___ the discussion began.',['when','than','that','as'],[1],'no sooner … than … 是固定搭配。前置 no sooner 时，助动词置于主语之前。',sooner),
 q('eng-sooner-2','eng','语法 · 倒装','Which beginning is correct before “the lecture started”?',['No sooner we had arrived than','No sooner had we arrived than','No sooner did we had arrived when','No sooner we arrived that'],[1],'句首 no sooner 引出部分倒装：had + 主语 + 过去分词；后面与 than 配对。',sooner),
 q('eng-hardly-1','eng','语法 · 固定搭配','Hardly had the experiment begun ___ the alarm sounded.',['than','when','that','which'],[1],'hardly … when … 是常见搭配。不要与 no sooner … than … 混用。',hardly)
];
export function available(bank,attempts,{subject='all',mode='all',kind='all',protect=true}={}){const latest=new Map();for(const a of [...attempts].sort((a,b)=>a.at-b.at))latest.set(a.questionId,a);return bank.filter(q=>(subject==='all'||q.subject===subject)&&(kind==='all'||q.kind===kind)&&!(protect&&q.subject==='eng'&&[2022,2024,2026].includes(+q.year))&&(mode!=='wrong'||latest.get(q.id)?.correct===false)&&(mode!=='unseen'||!latest.has(q.id)))}
export function grade(q,answer){return [...new Set(answer)].sort((a,b)=>a-b).join(',')===[...q.answer].sort((a,b)=>a-b).join(',')}
export function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
