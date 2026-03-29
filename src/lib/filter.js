import { Filter } from 'bad-words';

export const getFilter = () => {
  const filter = new Filter();
  
  // Turkish profanity extension
  const trBadWords = [
    'amk', 'aq', 'siktir', 'oç', 'orospu', 'pic', 'piç', 'yavsak', 'yavşak',
    'göt', 'yarrak', 'am', 'yarak', 'sik', 'sikerim', 'sikeyim', 'amcik', 'amcık',
    'ibne', 'puşt', 'pezevenk', 'kahpe', 'orosbu', 'sürtük', 'serefsiz', 'şerefsiz'
  ];
  
  filter.addWords(...trBadWords);
  return filter;
};

export const hasProfanity = (text) => {
  if (!text) return false;
  const filter = getFilter();
  return filter.isProfane(text);
};

export const cleanProfanity = (text) => {
  if (!text) return text;
  const filter = getFilter();
  return filter.clean(text);
};
