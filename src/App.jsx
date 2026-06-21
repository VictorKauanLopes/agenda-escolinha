import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Plus,
  School,
  Search,
  Trash2,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { initialData as blankData } from "./data/sampleData";
import {
  createClass,
  createEvent,
  createNotice,
  createStudent,
  deleteClass,
  deleteEvent,
  deleteNotice,
  deleteStudent,
  fetchAgendaData,
  getDataSourceLabel,
  updateNoticePin
} from "./services/agendaRepository";

const tabs = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "students", label: "Alunos", icon: UsersRound },
  { id: "classes", label: "Turmas", icon: GraduationCap },
  { id: "notices", label: "Avisos", icon: Megaphone }
];

const priorityOrder = {
  urgent: 0,
  important: 1,
  normal: 2
};

const priorityLabels = {
  urgent: "Urgente",
  important: "Importante",
  normal: "Normal"
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short"
  }).format(new Date(`${date}T12:00:00`));
}

function dateBadgeParts(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return {
    day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(parsed),
    label: new Intl.DateTimeFormat("pt-BR", { weekday: "short", month: "short" }).format(parsed)
  };
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function App() {
  const [data, setData] = useState(blankData);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [eventForm, setEventForm] = useState({
    title: "",
    date: todayISO(),
    time: "08:00",
    className: "Jardim I",
    type: "Aula",
    note: ""
  });
  const [studentForm, setStudentForm] = useState({ name: "", guardian: "", className: "Maternal", phone: "" });
  const [noticeForm, setNoticeForm] = useState({ title: "", text: "", priority: "normal" });
  const [classForm, setClassForm] = useState({ name: "", teacher: "", room: "", schedule: "" });

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    setIsLoading(true);
    try {
      setData(await fetchAgendaData());
      setFeedback("");
    } catch (error) {
      setFeedback(error.message || "Nao foi possivel carregar os dados.");
    } finally {
      setIsLoading(false);
    }
  }

  async function runMutation(action, successMessage) {
    setIsSaving(true);
    setFeedback("");
    try {
      await action();
      setFeedback(successMessage);
    } catch (error) {
      setFeedback(error.message || "Nao foi possivel salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  const upcomingEvents = useMemo(
    () =>
      [...data.events]
        .filter((event) => event.date >= todayISO())
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .slice(0, 5),
    [data.events]
  );

  const filteredStudents = data.students.filter((student) =>
    [student.name, student.guardian, student.className].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  function addEvent(event) {
    event.preventDefault();
    if (!eventForm.title.trim()) return;
    runMutation(async () => {
      const created = await createEvent(eventForm);
      setData((current) => ({ ...current, events: [created, ...current.events] }));
      setEventForm({ ...eventForm, title: "", note: "" });
    }, "Evento salvo.");
  }

  function addStudent(event) {
    event.preventDefault();
    if (!studentForm.name.trim()) return;
    runMutation(async () => {
      const created = await createStudent(studentForm);
      setData((current) => ({ ...current, students: [created, ...current.students] }));
      setStudentForm({ name: "", guardian: "", className: studentForm.className, phone: "" });
    }, "Aluno cadastrado.");
  }

  function addNotice(event) {
    event.preventDefault();
    if (!noticeForm.title.trim()) return;
    runMutation(async () => {
      const created = await createNotice(noticeForm);
      setData((current) => ({ ...current, notices: [created, ...current.notices] }));
      setNoticeForm({ title: "", text: "", priority: "normal" });
    }, "Aviso publicado.");
  }

  function addClass(event) {
    event.preventDefault();
    if (!classForm.name.trim()) return;
    runMutation(async () => {
      const created = await createClass(classForm);
      setData((current) => ({ ...current, classes: [...current.classes, created] }));
      setClassForm({ name: "", teacher: "", room: "", schedule: "" });
    }, "Turma cadastrada.");
  }

  function removeStudent(id) {
    runMutation(async () => {
      await deleteStudent(id);
      setData((current) => ({ ...current, students: current.students.filter((item) => item.id !== id) }));
    }, "Aluno excluido.");
  }

  function removeClass(id) {
    runMutation(async () => {
      await deleteClass(id);
      setData((current) => ({ ...current, classes: current.classes.filter((item) => item.id !== id) }));
    }, "Turma excluida.");
  }

  function removeEvent(id) {
    runMutation(async () => {
      await deleteEvent(id);
      setData((current) => ({ ...current, events: current.events.filter((item) => item.id !== id) }));
    }, "Evento excluido.");
  }

  function removeNotice(id) {
    runMutation(async () => {
      await deleteNotice(id);
      setData((current) => ({ ...current, notices: current.notices.filter((item) => item.id !== id) }));
    }, "Aviso excluido.");
  }

  function toggleNotice(id) {
    const notice = data.notices.find((item) => item.id === id);
    if (!notice) return;

    runMutation(async () => {
      await updateNoticePin(id, !notice.pinned);
      setData((current) => ({
        ...current,
        notices: current.notices.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
      }));
    }, notice.pinned ? "Aviso desafixado." : "Aviso fixado.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <School size={22} />
          </span>
          <div>
            <strong>Agenda Escolar</strong>
            <span>Escolinha LaLeLu</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Navegacao principal">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "nav-item active" : "nav-item"}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Painel administrativo</p>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <Check size={16} />
              {isSaving ? "Salvando..." : getDataSourceLabel()}
            </span>
            <button className="icon-button" title="Notificacoes" onClick={() => setActiveTab("notices")}>
              <Bell size={19} />
            </button>
          </div>
        </header>

        {feedback && <p className="feedback">{feedback}</p>}
        {isLoading && <p className="feedback">Carregando dados...</p>}

        {activeTab === "dashboard" && (
          <section className="view-stack">
            <div className="metrics-grid">
              <Metric label="Eventos" value={data.events.length} tone="green" />
              <Metric label="Alunos" value={data.students.length} tone="blue" />
              <Metric label="Turmas" value={data.classes.length} tone="yellow" />
              <Metric label="Avisos" value={data.notices.length} tone="rose" />
            </div>

            <div className="split-layout">
              <section className="panel">
                <PanelTitle icon={CalendarDays} title="Proximos compromissos" />
                <div className="event-list">
                  {upcomingEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              </section>

              <section className="panel">
                <PanelTitle icon={Megaphone} title="Avisos fixados" />
                <div className="notice-list">
                  {sortNotices(data.notices)
                    .filter((notice) => notice.pinned)
                    .map((notice) => (
                      <NoticeCard key={notice.id} notice={notice} onToggle={toggleNotice} onRemove={removeNotice} />
                    ))}
                </div>
              </section>
            </div>
          </section>
        )}

        {activeTab === "agenda" && (
          <section className="view-stack">
            <div className="split-layout wide-left">
              <section className="panel">
                <div className="panel-heading">
                  <PanelTitle icon={CalendarDays} title={monthLabel(currentMonth)} />
                  <div className="month-controls">
                    <button className="icon-button" title="Mes anterior" onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}>
                      <ChevronLeft size={18} />
                    </button>
                    <button className="icon-button" title="Proximo mes" onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                <Calendar month={currentMonth} events={data.events} />
              </section>

              <section className="panel">
                <PanelTitle icon={Plus} title="Novo evento" />
                <form className="form-grid" onSubmit={addEvent}>
                  <label>
                    Titulo
                    <input value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} placeholder="Ex: Aula de artes" />
                  </label>
                  <div className="form-row">
                    <label>
                      Data
                      <input type="date" value={eventForm.date} onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })} />
                    </label>
                    <label>
                      Hora
                      <input type="time" value={eventForm.time} onChange={(event) => setEventForm({ ...eventForm, time: event.target.value })} />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Turma
                      <select value={eventForm.className} onChange={(event) => setEventForm({ ...eventForm, className: event.target.value })}>
                        {data.classes.map((item) => (
                          <option key={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Tipo
                      <select value={eventForm.type} onChange={(event) => setEventForm({ ...eventForm, type: event.target.value })}>
                        <option>Aula</option>
                        <option>Reuniao</option>
                        <option>Evento</option>
                        <option>Aviso</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Observacao
                    <textarea value={eventForm.note} onChange={(event) => setEventForm({ ...eventForm, note: event.target.value })} placeholder="Detalhes importantes" />
                  </label>
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    <Plus size={18} />
                    Adicionar
                  </button>
                </form>
              </section>
            </div>

            <section className="panel">
              <PanelTitle icon={CalendarDays} title="Todos os eventos" />
              <div className="event-list compact">
                {[...data.events]
                  .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
                  .map((event) => (
                    <EventRow key={event.id} event={event} onRemove={() => removeEvent(event.id)} />
                  ))}
              </div>
            </section>
          </section>
        )}

        {activeTab === "students" && (
          <section className="view-stack">
            <div className="toolbar">
              <div className="search-box">
                <Search size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar aluno, responsavel ou turma" />
              </div>
            </div>

            <div className="split-layout">
              <section className="panel">
                <PanelTitle icon={UsersRound} title="Alunos cadastrados" />
                <div className="table-list">
                  {filteredStudents.map((student) => (
                    <article className="student-row" key={student.id}>
                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.className} | Resp. {student.guardian || "Nao informado"}</span>
                      </div>
                      <span>{student.phone || "Sem telefone"}</span>
                      <button className="icon-button danger" title="Excluir aluno" onClick={() => removeStudent(student.id)}>
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel">
                <PanelTitle icon={Plus} title="Novo aluno" />
                <form className="form-grid" onSubmit={addStudent}>
                  <label>
                    Nome
                    <input value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} placeholder="Nome do aluno" />
                  </label>
                  <label>
                    Responsavel
                    <input value={studentForm.guardian} onChange={(event) => setStudentForm({ ...studentForm, guardian: event.target.value })} placeholder="Nome do responsavel" />
                  </label>
                  <div className="form-row">
                    <label>
                      Turma
                      <select value={studentForm.className} onChange={(event) => setStudentForm({ ...studentForm, className: event.target.value })}>
                        {data.classes.map((item) => (
                          <option key={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Telefone
                      <input value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} placeholder="(00) 00000-0000" />
                    </label>
                  </div>
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    <Plus size={18} />
                    Cadastrar
                  </button>
                </form>
              </section>
            </div>
          </section>
        )}

        {activeTab === "classes" && (
          <section className="view-stack">
            <div className="split-layout">
              <section className="panel">
                <PanelTitle icon={GraduationCap} title="Turmas cadastradas" />
                <div className="cards-grid">
                  {data.classes.map((item) => (
                    <article className="class-card" key={item.id}>
                      <span className="class-icon">
                        <GraduationCap size={22} />
                      </span>
                      <h2>{item.name}</h2>
                      <p>{item.teacher}</p>
                      <div>
                        <span>{item.room}</span>
                        <span>{item.schedule}</span>
                      </div>
                      <button className="icon-button danger" title="Excluir turma" onClick={() => removeClass(item.id)}>
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
                  {data.classes.length === 0 && <p className="feedback">Nenhuma turma cadastrada ainda.</p>}
                </div>
              </section>

              <section className="panel">
                <PanelTitle icon={Plus} title="Nova turma" />
                <form className="form-grid" onSubmit={addClass}>
                  <label>
                    Nome da turma
                    <input value={classForm.name} onChange={(event) => setClassForm({ ...classForm, name: event.target.value })} placeholder="Ex: Jardim I" />
                  </label>
                  <label>
                    Professor(a)
                    <input value={classForm.teacher} onChange={(event) => setClassForm({ ...classForm, teacher: event.target.value })} placeholder="Nome do professor" />
                  </label>
                  <div className="form-row">
                    <label>
                      Sala
                      <input value={classForm.room} onChange={(event) => setClassForm({ ...classForm, room: event.target.value })} placeholder="Ex: Sala 1" />
                    </label>
                    <label>
                      Horario
                      <input value={classForm.schedule} onChange={(event) => setClassForm({ ...classForm, schedule: event.target.value })} placeholder="Ex: Seg a Sex - 08:00" />
                    </label>
                  </div>
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    <Plus size={18} />
                    Cadastrar
                  </button>
                </form>
              </section>
            </div>
          </section>
        )}

        {activeTab === "notices" && (
          <section className="view-stack">
            <div className="split-layout">
              <section className="panel">
                <PanelTitle icon={Megaphone} title="Mural de avisos" />
                <div className="notice-list">
                  {sortNotices(data.notices).map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} onToggle={toggleNotice} onRemove={removeNotice} />
                  ))}
                </div>
              </section>

              <section className="panel">
                <PanelTitle icon={Plus} title="Novo aviso" />
                <form className="form-grid" onSubmit={addNotice}>
                  <label>
                    Titulo
                    <input value={noticeForm.title} onChange={(event) => setNoticeForm({ ...noticeForm, title: event.target.value })} placeholder="Ex: Reuniao geral" />
                  </label>
                  <label>
                    Mensagem
                    <textarea value={noticeForm.text} onChange={(event) => setNoticeForm({ ...noticeForm, text: event.target.value })} placeholder="Escreva o aviso" />
                  </label>
                  <label>
                    Importancia
                    <select value={noticeForm.priority} onChange={(event) => setNoticeForm({ ...noticeForm, priority: event.target.value })}>
                      <option value="normal">Normal</option>
                      <option value="important">Importante</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </label>
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    <Plus size={18} />
                    Publicar
                  </button>
                </form>
              </section>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PanelTitle({ icon: Icon, title }) {
  return (
    <div className="panel-title">
      <Icon size={19} />
      <h2>{title}</h2>
    </div>
  );
}

function EventRow({ event, onRemove }) {
  const badge = dateBadgeParts(event.date);

  return (
    <article className="event-row">
      <div className="date-badge">
        <strong>{badge.day}</strong>
        <span>{badge.label}</span>
      </div>
      <div className="event-info">
        <strong>{event.title}</strong>
        <span>
          {event.time} | {event.className} | {event.type}
        </span>
        {event.note && <p>{event.note}</p>}
      </div>
      {onRemove && (
        <button className="icon-button danger" title="Excluir evento" onClick={onRemove}>
          <Trash2 size={17} />
        </button>
      )}
    </article>
  );
}

function NoticeCard({ notice, onToggle, onRemove }) {
  const priority = notice.priority || "normal";

  return (
    <article className={`notice-card ${notice.pinned ? "pinned" : ""} ${priority}`}>
      <div>
        <span className={`priority-badge ${priority}`}>{priorityLabels[priority]}</span>
        <strong>{notice.title}</strong>
        <p>{notice.text || "Sem detalhes adicionais."}</p>
      </div>
      <div className="notice-actions">
        <button className="icon-button" title={notice.pinned ? "Desafixar" : "Fixar"} onClick={() => onToggle(notice.id)}>
          <Check size={17} />
        </button>
        <button className="icon-button danger" title="Excluir aviso" onClick={() => onRemove(notice.id)}>
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

function sortNotices(notices) {
  return [...notices].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (priorityOrder[a.priority || "normal"] ?? 2) - (priorityOrder[b.priority || "normal"] ?? 2);
  });
}

function Calendar({ month, events }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(firstDay);
  start.setDate(1 - firstDay.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });

  return (
    <div className="calendar">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
        <span className="weekday" key={day}>
          {day}
        </span>
      ))}
      {days.map((day) => {
        const iso = day.toISOString().slice(0, 10);
        const dayEvents = events.filter((event) => event.date === iso);
        return (
          <div className={day.getMonth() === monthIndex ? "calendar-day" : "calendar-day muted"} key={iso}>
            <strong>{day.getDate()}</strong>
            {dayEvents.slice(0, 2).map((event) => (
              <span className="calendar-event" key={event.id}>
                {event.time} {event.title}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function shiftMonth(date, amount) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

export default App;
