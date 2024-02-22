import { format } from 'd3-format';

let debounceTimer: number = 0;

export const debounce = (callback: TimerHandler, time: number) => {
  if (debounceTimer) {
    window.clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(callback, time);
}

export const isVisibleInContainer = (element: Element, container: Element) => {
  const { bottom, height, top } = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return top <= containerRect.top ? containerRect.top - top <= height : bottom - containerRect.bottom <= height;
};

export const uuidv4 = () => {
  // @ts-ignore
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export const titleCase = (text: string) => {
  return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

export const parseBolt11 = (bolt11: string) => {
  if (!bolt11.startsWith('lnbc')) return;

  let digits: string[] = [];
  let unit: string = '';

  let i = 4;

  do {
    const char = bolt11[i];
    const n = parseInt(char);
    if (n !== 0 && !n) {
      break;
    }
    digits.push(char);
    i++;
  } while(i < bolt11.length);

  unit = bolt11[i];
  const number = parseInt(digits.join(''));
  let amount = number * 100_000_000;

  switch(unit) {
    case 'm':
      amount = amount / 1_000;
      break;
    case 'u':
      amount = amount / 1_000_000;
      break;
    case 'n':
      amount = amount / 1_000_000_000;
      break;
    case 'p':
      amount = amount / 1_000_000_000_000;
      break;
    default:
      amount = amount;
      break;
  }

  return amount;
}

export const arrayMerge: <T, >(a: T[], b: T[], predicate?: (x: T, y: T) => boolean) => T[]  = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a]; // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}

export const getScreenCordinates = (obj: any) =>  {
  let p: { x?: number, y?: number } = {};

  p.x = obj.offsetLeft;
  p.y = obj.offsetTop;

  while (obj.offsetParent) {
    p.x = p.x + obj.offsetParent.offsetLeft;
    p.y = p.y + obj.offsetParent.offsetTop;
    if (obj == document.getElementsByTagName("body")[0]) {
      break;
    }
    else {
      obj = obj.offsetParent;
    }
  }
  return p;
}

export const timeNow = () => Math.floor((new Date()).getTime() / 1000);

export const sha256 = async (file: File) => {
  const obj = await file.arrayBuffer();
  return crypto.subtle.digest('SHA-256', obj).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}

export const formatAmount = (amount: string, precision = 3) => {

  const value = parseFloat(amount);
  const min = Math.pow(10, precision > 2 ? -1*(precision - 2) : -1*precision);
  const max = Math.pow(10, precision);

  if (value === 0) {
    return `0`;
  }

  if (value > min && value < max) {
    return Intl.NumberFormat('en').format(parseFloat(amount))
  }

  const p = format(`.${precision}s`);

  return p(value);

};

export const formatStorage = (bytes: number) => {

  if (bytes < 1) {
    return '0'
  }

  let pow = 1;

  const units = ['', 'bytes', 'KB', 'MB', 'GB', 'TB']

  for(let i=1; i < 6; i++) {
    if (bytes < Math.pow(1024, i)) {
      pow = i;
      break;
    }
  }

  const amount = Math.round(bytes / Math.pow(1024, pow-1));

  const formatedAmount = new Intl.NumberFormat('en-US').format(amount)

  return `${formatedAmount} ${units[pow]}`;
};
