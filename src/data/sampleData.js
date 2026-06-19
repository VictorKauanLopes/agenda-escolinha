export const initialData = {
  events: [
    {
      id: "evt-1",
      title: "Aula de alfabetizacao",
      date: todayISO(),
      time: "08:00",
      className: "Jardim I",
      type: "Aula",
      note: "Atividade com letras e cartazes coloridos."
    },
    {
      id: "evt-2",
      title: "Reuniao com responsaveis",
      date: addDaysISO(2),
      time: "17:30",
      className: "Pre II",
      type: "Reuniao",
      note: "Entrega dos relatorios do bimestre."
    }
  ],
  students: [
    { id: "stu-1", name: "Ana Clara", guardian: "Mariana", className: "Jardim I", phone: "(11) 99999-1200" },
    { id: "stu-2", name: "Miguel Santos", guardian: "Carlos", className: "Pre II", phone: "(11) 98888-3311" },
    { id: "stu-3", name: "Livia Rocha", guardian: "Patricia", className: "Maternal", phone: "(11) 97777-2040" }
  ],
  classes: [
    { id: "cls-1", name: "Maternal", teacher: "Prof. Bia", room: "Sala 1", schedule: "Seg, Qua e Sex - 13:00" },
    { id: "cls-2", name: "Jardim I", teacher: "Prof. Camila", room: "Sala 2", schedule: "Seg a Sex - 08:00" },
    { id: "cls-3", name: "Pre II", teacher: "Prof. Renata", room: "Sala 3", schedule: "Ter e Qui - 14:00" }
  ],
  notices: [
    { id: "not-1", title: "Levar garrafinha de agua", text: "Nesta semana teremos atividades no patio.", pinned: true },
    { id: "not-2", title: "Festa junina", text: "Ensaios toda sexta-feira depois do lanche.", pinned: false }
  ]
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
