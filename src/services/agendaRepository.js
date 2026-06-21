import { blankData } from "../data/blankData";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const storageKey = "agenda-escolinha:v1";

export function getDataSourceLabel() {
  return isSupabaseConfigured ? "Banco online" : "Modo local";
}

export async function fetchAgendaData() {
  if (!isSupabaseConfigured) {
    return loadLocalData();
  }

  const [events, students, classes, notices] = await Promise.all([
    selectTable("events", "created_at", false),
    selectTable("students", "created_at", false),
    selectTable("classes", "name", true),
    selectTable("notices", "created_at", false)
  ]);

  return {
    events: events.map(mapEventFromDb),
    students: students.map(mapStudentFromDb),
    classes,
    notices
  };
}

export async function createEvent(event) {
  if (!isSupabaseConfigured) {
    return saveLocalItem("events", { ...event, id: createId("evt") });
  }

  const { data, error } = await supabase
    .from("events")
    .insert(mapEventToDb(event))
    .select()
    .single();

  if (error) throw error;
  return mapEventFromDb(data);
}

export async function createStudent(student) {
  if (!isSupabaseConfigured) {
    return saveLocalItem("students", { ...student, id: createId("stu") });
  }

  const { data, error } = await supabase
    .from("students")
    .insert(mapStudentToDb(student))
    .select()
    .single();

  if (error) throw error;
  return mapStudentFromDb(data);
}

export async function createNotice(notice) {
  if (!isSupabaseConfigured) {
    return saveLocalItem("notices", { ...notice, id: createId("not"), pinned: false });
  }

  const { data, error } = await supabase
    .from("notices")
    .insert({ title: notice.title, text: notice.text, priority: notice.priority, pinned: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createClass(classData) {
  if (!isSupabaseConfigured) {
    return saveLocalItem("classes", { ...classData, id: createId("cls") });
  }

  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: classData.name,
      teacher: classData.teacher,
      room: classData.room,
      schedule: classData.schedule
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClass(id) {
  if (!isSupabaseConfigured) {
    return deleteLocalItem("classes", id);
  }

  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id) {
  if (!isSupabaseConfigured) {
    return deleteLocalItem("events", id);
  }

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteNotice(id) {
  if (!isSupabaseConfigured) {
    return deleteLocalItem("notices", id);
  }

  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw error;
}

export async function updateNoticePin(id, pinned) {
  if (!isSupabaseConfigured) {
    const localData = loadLocalData();
    saveLocalData({
      ...localData,
      notices: localData.notices.map((notice) => (notice.id === id ? { ...notice, pinned } : notice))
    });
    return;
  }

  const { error } = await supabase.from("notices").update({ pinned }).eq("id", id);
  if (error) throw error;
}

async function selectTable(table, column, ascending) {
  const { data, error } = await supabase.from(table).select("*").order(column, { ascending });
  if (error) throw error;
  return data || [];
}

function mapEventFromDb(event) {
  return {
    id: event.id,
    title: event.title,
    date: event.event_date,
    time: String(event.event_time).slice(0, 5),
    className: event.class_name,
    type: event.type,
    note: event.note
  };
}

function mapEventToDb(event) {
  return {
    title: event.title,
    event_date: event.date,
    event_time: event.time,
    class_name: event.className,
    type: event.type,
    note: event.note
  };
}

function mapStudentFromDb(student) {
  return {
    id: student.id,
    name: student.name,
    guardian: student.guardian,
    className: student.class_name,
    phone: student.phone
  };
}

function mapStudentToDb(student) {
  return {
    name: student.name,
    guardian: student.guardian,
    class_name: student.className,
    phone: student.phone
  };
}

function loadLocalData() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : blankData;
  } catch {
    return blankData;
  }
}

function saveLocalData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function saveLocalItem(collection, item) {
  const localData = loadLocalData();
  const nextData = { ...localData, [collection]: [item, ...localData[collection]] };
  saveLocalData(nextData);
  return item;
}

function deleteLocalItem(collection, id) {
  const localData = loadLocalData();
  saveLocalData({ ...localData, [collection]: localData[collection].filter((item) => item.id !== id) });
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}
