import { URLPattern } from "./urlPattern.ts";

export const EMPTY: URLPattern = {
  // chrome://vivaldi-webui/
  href: /(chrome:\/\/vivaldi-webui\/startpage\?section=Speed-dials&.*|file:\/\/\/C:\/Dev\/ZRepos\/overview\/urls_table\.html)/,
};

export const CLAUDE: URLPattern = {
  host: /claude\.ai/,
};

export const JIRA: URLPattern = {
  host: /nexus-nederland\.atlassian\.net/,
  pathname: /\/jira\/.*/,
};

export const JIRA_BOARD: URLPattern = {
  host: /nexus-nederland\.atlassian\.net/,
  pathname: /\/jira\/software\/c\/projects\/SDB\/boards\/20.*/,
};

export const INTERNAL_ENV: URLPattern = {
  host: /.*(nexus-nederland|nlad\.intra:(?!8443|6543)).*/,
};

export const INTERNAL_JBOSS_ENV: URLPattern = {
  host: /.*\.nlad\.intra:(?:8443|6543)/,
};

export const BUNDLE_DESKTOP: URLPattern = {
  pathname: /\/nxs-bundle-desktop/,
};

export const LOCALHOST: URLPattern = {
  host: /localhost:.*/,
};
