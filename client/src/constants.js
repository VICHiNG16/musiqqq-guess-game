export const CATEGORIES = [
  { id: 'pop', label: 'Pop' },
  { id: 'rock', label: 'Rock' },
  { id: 'hiphop', label: 'Hip-Hop' },
  { id: 'hituri', label: 'Hituri' },
];

export const FEEDBACK_MS = 1500;

export function getCategoryLabel(id) {
  const found = CATEGORIES.find((item) => item.id === id);
  return found ? found.label : id;
}
