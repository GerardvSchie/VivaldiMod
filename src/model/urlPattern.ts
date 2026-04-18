export interface URLPattern {
  href?: RegExp;
  protocol?: RegExp;
  host?: RegExp;
  pathname?: RegExp;
}

export interface SingletonURLPattern extends URLPattern {
  urlMatchingPatternMustBeUnique?: boolean;
  keepNewest?: boolean;
}

export interface OpenURLPattern extends URLPattern {
  urlToOpen: string;
}

export interface ColorURLPattern extends URLPattern {
  color: string;
}
