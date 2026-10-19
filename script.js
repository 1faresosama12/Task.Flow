const $ = (id) => document.getElementById(id);
const form = $("taskForm");
const taskList = $("taskList");
let tasks = [
  {id:1,title:"مراجعة أساسيات JavaScript",description:"مراجعة المتغيرات والدوال والأحداث.",priority:"high",due:"",completed:false},
  {id:2,title:"تجهيز تصميم صفحة المشاريع",description:"تنسيق بطاقات المشاريع والتأكد من توافقها مع الموبايل.",priority:"medium",due:"",completed:false},
  {id:3,title:"تحديث السيرة الذاتية",description:"إضافة المهارات والمشاريع الجديدة.",priority:"low",due:"",completed:true}
];
let currentFilter = "all";
let editingId = null;
let nextId = 4;
const priorityLabels = {high:"أولوية عالية",medium:"أولوية متوسطة",low:"أولوية منخفضة"};

$("todayDate").textContent = new Intl.DateTimeFormat("ar-EG",{weekday:"long",day:"numeric",month:"long"}).format(new Date());

function safe(value=""){
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function dateLabel(value){
  if(!value) return "";
  const d = new Date(value+"T00:00:00");
  return "الاستحقاق: "+new Intl.DateTimeFormat("ar-EG",{day:"numeric",month:"short"}).format(d);
}
function updateStats(){
  const done = tasks.filter(t=>t.completed).length;
  const active = tasks.length-done;
  $("allCount").textContent = tasks.length;
  $("activeCount").textContent = active;
  $("completedCount").textContent = done;
  $("totalStat").textContent = tasks.length;
  $("activeStat").textContent = active;
  $("doneStat").textContent = done;
  const percent = tasks.length ? Math.round(done/tasks.length*100) : 0;
  $("progressPercent").textContent = percent+"%";
  $("progressBar").style.width = percent+"%";
}
function render(){
  updateStats();
  const query = $("searchInput").value.trim().toLowerCase();
  const priority = $("priorityFilter").value;
  const shown = tasks.filter(t=>{
    const matchesFilter = currentFilter==="all" || (currentFilter==="active"&&!t.completed) || (currentFilter==="completed"&&t.completed);
    const matchesQuery = (t.title+" "+t.description).toLowerCase().includes(query);
    return matchesFilter && matchesQuery && (priority==="all"||t.priority===priority);
  });
  taskList.innerHTML = shown.map(t=>`
    <article class="task-card ${t.completed?"is-completed":""}">
      <input class="task-check" type="checkbox" aria-label="تحديد اكتمال المهمة" data-action="toggle" data-id="${t.id}" ${t.completed?"checked":""}>
      <div class="task-body">
        <h3 class="task-title">${safe(t.title)}</h3>
        ${t.description?`<p class="task-description">${safe(t.description)}</p>`:""}
        <div class="task-meta"><span class="priority ${t.priority}">${priorityLabels[t.priority]}</span>${t.due?`<span class="due-chip">${dateLabel(t.due)}</span>`:""}${t.completed?'<span class="status-chip">مكتملة</span>':""}</div>
      </div>
      <div class="task-actions"><button class="icon-btn" title="تعديل المهمة" aria-label="تعديل المهمة" data-action="edit" data-id="${t.id}">✎</button><button class="icon-btn" title="حذف المهمة" aria-label="حذف المهمة" data-action="delete" data-id="${t.id}">⌫</button></div>
    </article>`).join("");
  $("emptyState").classList.toggle("hidden",shown.length!==0);
  taskList.classList.toggle("hidden",shown.length===0);
}
function showForm(task=null){
  form.classList.remove("hidden");
  editingId = task ? task.id : null;
  $("formHeading").textContent = task ? "تعديل المهمة" : "إضافة مهمة جديدة";
  $("taskTitle").value = task?.title || "";
  $("taskDescription").value = task?.description || "";
  $("taskPriority").value = task?.priority || "medium";
  $("taskDue").value = task?.due || "";
  $("taskTitle").focus();
  form.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function closeForm(){form.classList.add("hidden");form.reset();editingId=null;}
$("openFormBtn").addEventListener("click",()=>showForm());
$("emptyAddBtn").addEventListener("click",()=>showForm());
$("closeFormBtn").addEventListener("click",closeForm);
$("cancelBtn").addEventListener("click",closeForm);
form.addEventListener("submit",e=>{
  e.preventDefault();
  const title=$("taskTitle").value.trim();
  if(!title)return;
  const data={title,description:$("taskDescription").value.trim(),priority:$("taskPriority").value,due:$("taskDue").value};
  if(editingId!==null){tasks=tasks.map(t=>t.id===editingId?{...t,...data}:t);}
  else{tasks.unshift({id:nextId++,...data,completed:false});}
  closeForm();render();
});
taskList.addEventListener("click",e=>{
  const control=e.target.closest("[data-action]");
  if(!control)return;
  const id=Number(control.dataset.id);
  const action=control.dataset.action;
  if(action==="toggle"){tasks=tasks.map(t=>t.id===id?{...t,completed:control.checked}:t);render();}
  if(action==="edit"){const task=tasks.find(t=>t.id===id);if(task)showForm(task);}
  if(action==="delete"){if(confirm("هل تريد حذف هذه المهمة؟")){tasks=tasks.filter(t=>t.id!==id);render();}}
});
taskList.addEventListener("change",e=>{
  if(e.target.matches('[data-action="toggle"]')){const id=Number(e.target.dataset.id);tasks=tasks.map(t=>t.id===id?{...t,completed:e.target.checked}:t);render();}
});
document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
  currentFilter=btn.dataset.filter;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b===btn));
  render();
}));
$("searchInput").addEventListener("input",render);
$("priorityFilter").addEventListener("change",render);
render();
