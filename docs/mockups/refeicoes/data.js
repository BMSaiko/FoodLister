/* Refeições de exemplo sobre os restaurantes reais do seed de dev (Restaurante Teste 1-5, ana.teste).
   A BD de dev não tem refeições agendadas: as datas/horas/participantes são exemplos marcados como tal. Forma = resposta de /api/meals/scheduled. */
window.TODAY = '2026-11-27';
window.MEALS = [
  { id: 'm1', role: 'organized', meal_type: 'jantar', meal_date: '2026-11-28', meal_time: '20:30', participant_count: 4, restaurant: { name: 'Restaurante Teste 2', location: 'Porto, Portugal', image: 'assets/r2.jpeg' } },
  { id: 'm2', role: 'participating', meal_type: 'almoco', meal_date: '2026-12-01', meal_time: '13:00', participant_count: 12, restaurant: { name: 'Restaurante Teste 5', location: 'Matosinhos, Portugal', image: 'assets/r5.png' } },
  { id: 'm3', role: 'organized', meal_type: 'jantar', meal_date: '2026-12-13', meal_time: '19:45', participant_count: 2, restaurant: { name: 'Restaurante com um nome muito comprido para testar o corte de texto em duas linhas no telemóvel', location: 'Vila Nova de Gaia, Portugal', image: 'assets/r1.png' } },
  { id: 'm4', role: 'participating', meal_type: 'almoco', meal_date: '2026-12-20', meal_time: null, participant_count: 0, restaurant: { name: 'Restaurante Teste 3', location: null, image: null } },
  { id: 'm5', role: 'organized', meal_type: 'jantar', meal_date: '2026-11-14', meal_time: '21:00', participant_count: 6, restaurant: { name: 'Restaurante Teste 4', location: 'Porto, Portugal', image: 'assets/r4.png' } },
  { id: 'm6', role: 'participating', meal_type: 'almoco', meal_date: '2026-10-30', meal_time: '12:30', participant_count: 3, restaurant: { name: 'Restaurante Teste 2', location: 'Porto, Portugal', image: 'assets/r2.jpeg' } },
  { id: 'm7', role: 'organized', meal_type: 'lanche', meal_date: null, meal_time: null, participant_count: 0, restaurant: { name: 'Restaurante Teste 1', location: 'Porto, Portugal', image: 'assets/r1.png' } }
];
