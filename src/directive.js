/* eslint-disable no-param-reassign, no-unused-vars */

import { warn, deprecate } from './utils';

function equalLanguage(el, vnode) {
  const vm = vnode.context;
  return el._i18nLanguage === vm.$i18n.i18next.language;
}

function equalValue(value, oldValue, el) {
  if (!value) {
    return el.innerHTML === el.dataset.origHTML;
  } else if (value === oldValue) {
    return true;
  }
  if (value && oldValue) {
    return (
      value.path === oldValue.path &&
      value.language === oldValue.language &&
      value.args === oldValue.args
    );
  }
}

function assert(vnode) {
  const vm = vnode.context;

  if (!vm.$i18n) {
    warn('No VueI18Next instance found in the Vue instance');
    return false;
  }

  return true;
}

function parseValue(value, el) {
  let path;
  let language;
  let args;

  if (!value) {
    if (!el.dataset.origHTML) {
      el.dataset.origHTML = el.innerHTML;
    }
    path = el.dataset.origHTML;
  } else if (typeof value === 'string') {
    path = value;
  } else if (toString.call(value) === '[object Object]') {
    ({ path, language, args } = value);
  }

  return { path, language, args };
}

function t(el, binding, vnode) {
  const { value } = binding;

  const { path, language, args } = parseValue(value, el);
  if (!path && !language && !args) {
    warn('v-t: invalid value');
    return;
  }

  if (!path) {
    warn('v-t: "path" is required');
    return;
  }

  if (language) {
    deprecate(`v-t: "language" is deprecated.Use the "lng" property in args.
      https://www.i18next.com/overview/configuration-options#configuration-options`);
  }

  const vm = vnode.context;
  el.textContent = vm.$i18n.i18next.t(path, {
    ...(language ? { lng: language } : {}),
    ...args
  });

  el._i18nLanguage = vm.$i18n.i18next.language;
}

export function bind(el, binding, vnode) {
  if (!assert(vnode)) {
    return;
  }

  t(el, binding, vnode);
}

export function update(el, binding, vnode, oldVNode) {
  if (equalLanguage(el, vnode) && equalValue(binding.value, binding.oldValue, el)) {
    return;
  }

  t(el, binding, vnode);
}

export default {
  bind,
  update
};
