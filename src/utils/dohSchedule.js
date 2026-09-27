export function generateDOHVaccines(birthDateString) {
  if (!birthDateString) return [];
  const birthDate = new Date(birthDateString);

  const addWeeks = (date, weeks) => {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d.toISOString().split('T')[0];
  };

  const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  return [
    { id: '1', name: 'BCG & Hepatitis B', targetAge: 'At Birth', dueDate: birthDateString, completed: true },
    { id: '2', name: 'Pentavalent 1 & OPV 1', targetAge: '1½ Months', dueDate: addWeeks(birthDate, 6), completed: false },
    { id: '3', name: 'Pentavalent 2 & OPV 2', targetAge: '2½ Months', dueDate: addWeeks(birthDate, 10), completed: false },
    { id: '4', name: 'Pentavalent 3 & OPV 3 & IPV 1', targetAge: '3½ Months', dueDate: addWeeks(birthDate, 14), completed: false },
    { id: '5', name: 'MMR 1 & IPV 2', targetAge: '9 Months', dueDate: addMonths(birthDate, 9), completed: false },
    { id: '6', name: 'MMR 2 (Booster)', targetAge: '1 Year', dueDate: addMonths(birthDate, 12), completed: false },
  ];
}