// De dataset voor de datasnack "Het Zomerse Airco-Effect".
// interactief: false  -> maand staat vast (Jan t/m Apr, ter ondersteuning)
// interactief: true   -> gebruiker sleept zelf de verdeling Thuis/Kantoor (Mei t/m Dec)
export const data = [
  { maand: 'Jan', temp: 3.6, kantoorEcht: 52, thuisEcht: 48, interactief: false },
  { maand: 'Feb', temp: 4.2, kantoorEcht: 50, thuisEcht: 50, interactief: false },
  { maand: 'Mar', temp: 7.1, kantoorEcht: 55, thuisEcht: 45, interactief: false },
  { maand: 'Apr', temp: 10.3, kantoorEcht: 53, thuisEcht: 47, interactief: false },
  { maand: 'Mei', temp: 14.2, kantoorEcht: 48, thuisEcht: 52, interactief: true },
  { maand: 'Jun', temp: 17.5, kantoorEcht: 42, thuisEcht: 58, interactief: true },
  { maand: 'Jul', temp: 22.8, kantoorEcht: 78, thuisEcht: 22, interactief: true },
  { maand: 'Aug', temp: 23.4, kantoorEcht: 82, thuisEcht: 18, interactief: true },
  { maand: 'Sep', temp: 16.1, kantoorEcht: 58, thuisEcht: 42, interactief: true },
  { maand: 'Okt', temp: 11.5, kantoorEcht: 52, thuisEcht: 48, interactief: true },
  { maand: 'Nov', temp: 7.0, kantoorEcht: 49, thuisEcht: 51, interactief: true },
  { maand: 'Dec', temp: 4.1, kantoorEcht: 45, thuisEcht: 55, interactief: true },
];
