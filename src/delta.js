import React, { Fragment } from "react";
import {
    compose,
    defaultTo,
    path,
    type,
    reverse,
    not,
    __,
    reject,
    always,
    identity,
    map,
    prop,
    pick,
    isNil,
    apply,
    append,
    isEmpty,
    invoker,
    reduce,
    toPairs,
    over,
    mergeDeepLeft,
    when,
    or,
    useWith,
    has,
    split,
    equals,
    complement,
    curryN,
    test,
    ifElse,
    bind,
    either,
    lensIndex
  } from "ramda";

const isNilOrEmpty = either(isNil, isEmpty);
const isNotEmpty = complement(isEmpty);
const replaceArr = (cond, mapping, arr) => map(when(cond, mapping), arr);
const replaceEl = useWith(replaceArr, [equals, always, identity]);
const hasNewLine = test(/\n/);
const splitAtLastLine = split(/\n(?!.*\n)/);
const isNotIdentity = compose(not, equals(identity));
const substring = invoker(2, 'substring');
const wrap = (Component, props) => (children) => (<Component {...props}>{children}</Component>);
const lastLens = lensIndex(-1);
const composeEm = ifElse(isEmpty, always(identity), apply(compose));

const formatLine = curryN(3, (config, attributes, text) => {
  const composition = reduce((list, [key, value]) => {
    switch (key) {
      case 'bold':
        if (value)
          return append(['strong', {}], list);
        return list;
      case 'underline':
        if (value)
          if (isNotEmpty(list))
            return over(lastLens, over(lensIndex(1), mergeDeepLeft({style: {textDecoration: 'underline'}})), list);
          else
            return append(['span', {style: {textDecoration: 'underline'}}], list);
        return list;
      case 'italic':
        if (value)
          return append(['em', {}], list);
        return list;
      case 'script':
        return append([substring(0, 3)(value), {}], list);
      case 'color':
        if (isNotEmpty(list))
          return over(lastLens, over(lensIndex(1), mergeDeepLeft({style: {color: value}})), list);
        return append(['span', {style: {color: value}}], list);
      case 'size':
        const size = path([value, 'sizeMap'], config);

        if (isNotEmpty(list))
          return over(lastLens, over(lensIndex(1), mergeDeepLeft({style: {fontSize: size}})), list);
        return append(['span', {style: {fontSize: size}}], list);
      case 'link':
        return append(['a', {href: value}], list);
      case 'font':
        if (isNotEmpty(list))
          return over(lastLens, over(lensIndex(1), mergeDeepLeft({style: {fontFamily: value}})), list);
        return append(['span', {style: {fontFamily: value}}], list);
    }
  }, [], toPairs(attributes));

  const wrapper = composeEm(map(apply(wrap), composition));

  return wrapper(replaceEl('\n', <br />, reject(isEmpty, split(/(\n)/, text))));
});

export const Delta = ({ delta, sizeMap = {}, indentWidth = '15px'}) => {
    if (isNilOrEmpty(delta)) return null;

    const formatInline = formatLine({sizeMap, indentWidth});
  
    let reversedOps = reverse(prop("ops", delta));

    const result = [];
    const lineBuffer = [];
  
    let newSequentialLineComposition = [];
    let sequentialLineComposition = [];
    let sequentialLineBuffer = [];
    let lineWrapper = identity;
  
    const isLineConfig = equals("\n");
    const isType = typeId =>
      compose(
        equals(typeId),
        type
      );
    const isString = isType("String");
    const isObject = isType("Object");
    const addItem = bind(result.unshift, result);
    const storeItem = bind(lineBuffer.push, lineBuffer);
    const hasBufferedItems = () => not(isEmpty(lineBuffer));
    const popBufferedItems = () => {
      const result = [];
      while(lineBuffer.length) {
        result.push(lineBuffer.pop());
      }
      return result;
    }

    for (const op of reversedOps) {
      let attributes = defaultTo({}, prop('attributes', op));
      let data = prop('insert', op);
  
      if (isString(data)) {
        if (isLineConfig(data)) {
          const addOrBufferItem = isEmpty(sequentialLineComposition) ? addItem : bind(sequentialLineBuffer.push, sequentialLineBuffer);

          if (hasBufferedItems())
            addOrBufferItem(lineWrapper(popBufferedItems()));

          lineWrapper = identity;

          // TODO: change these so that the styles are applied on the same block element; only create a new div if no block exists.
          if (has('header', attributes)) {
            const level = prop('header', attributes);

            lineWrapper = compose(wrap(`h${level}`), lineWrapper);
          }

          if (has('indent', attributes)) {
            const indention = prop('indent', attributes);

            lineWrapper = compose(wrap('div', {style: {marginLeft: `calc(${indentWidth} * ${indention})`}}), lineWrapper);
          }

          if (has('align', attributes)) {
            const alignment = prop('align', attributes);

            lineWrapper = compose(wrap('div', {style: {textAlign: alignment}}), lineWrapper);
          }

          if (prop('blockquote', attributes)) lineWrapper = compose(wrap('blockquote'), lineWrapper);

          if (has('list', attributes)) {
            const type = prop('list', attributes);

            if (type === 'ordered')
              newSequentialLineComposition = ['ol', {}];
            else if (type === 'bullet')
              newSequentialLineComposition = ['ul', {}];

            lineWrapper = compose(wrap('li'), lineWrapper);
          }

          if (not(equals(sequentialLineComposition[0], newSequentialLineComposition[0])) && not(isNilOrEmpty(sequentialLineBuffer))) {
            const sequentialLineWrapper = wrap(...sequentialLineComposition);
            addItem(sequentialLineWrapper(reverse(sequentialLineBuffer)));
            sequentialLineBuffer = [];
          }
          sequentialLineComposition = newSequentialLineComposition;

        } else if (isNotIdentity(lineWrapper)) {
          if (hasNewLine(data)) {
            const [beginning, lastLine] = splitAtLastLine(data);

            const addOrBufferItem = isEmpty(sequentialLineComposition) ? addItem : bind(sequentialLineBuffer.push, sequentialLineBuffer);

            if (not(isNilOrEmpty(lastLine))) {
              const lastLineFormatted = formatInline(attributes, lastLine);

              if (hasBufferedItems()) {
                addOrBufferItem(lineWrapper(
                  <>
                    {lastLineFormatted}
                    {popBufferedItems()}
                  </>
                ));
              }
              else
                addOrBufferItem(lineWrapper(lastLineFormatted));
            }

            lineWrapper = identity;

            addOrBufferItem(<br />);

            addOrBufferItem(formatInline(attributes, beginning));
          } else {
            storeItem(formatInline(attributes, data));
          }
        } else 
          addItem(formatInline(attributes, data));
      } else if (isObject(data)) {
          // TODO: Consider adding the buffered items here as well.
        if (has('image', data)) {
          let imgAttributes = pick(['alt', 'width', 'height'], attributes);
  
          addItem(<img src={prop('image', data)} {...imgAttributes} />);
        }
      }
    }

    const addOrBufferItem = isEmpty(sequentialLineComposition) ? addItem : bind(sequentialLineBuffer.push, sequentialLineBuffer);

    if (hasBufferedItems())
      addOrBufferItem(lineWrapper(popBufferedItems()));

    if (not(isEmpty(sequentialLineComposition)) && not(isNilOrEmpty(sequentialLineBuffer))) {
      const sequentialLineWrapper = wrap(...sequentialLineComposition);
      addItem(sequentialLineWrapper(reverse(sequentialLineBuffer)));
    }
  
    return result;
  };