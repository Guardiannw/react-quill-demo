import React, { Fragment } from "react";
import {
    compose,
    keys,
    last,
    defaultTo,
    head,
    path,
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
    sortWith,
    over,
    mergeDeepLeft,
    has,
    split,
    equals,
    ascend,
    complement,
    indexOf,
    test,
    ifElse,
    lensIndex
  } from "ramda";

const isNotNil = complement(isNil);
const isNotEmpty = complement(isEmpty);
const substring = invoker(2, 'substring');
const wrap = (Component, props) => (children) => (<Component {...props}>{children}</Component>);
const lastLens = lensIndex(-1);
const composeEm = ifElse(isEmpty, always(identity), apply(compose));

const lineAttributePriorityMap = ['script', 'link', 'bold', 'italic', 'underline', 'font', 'size', 'color'];
const sortLineAttributesByPriority = sortWith([ascend(compose(indexOf(__, lineAttributePriorityMap), head))]);

const formatLine = (config) => ({attributes, data = ''}) => {
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
        const size = path(['sizeMap', value], config);

        if (isNotEmpty(list))
          return over(lastLens, over(lensIndex(1), mergeDeepLeft({style: {fontSize: size}})), list);
        return append(['span', {style: {fontSize: size}}], list);
      case 'link':
        return append(['a', {href: value}], list);
      case 'font':
        if (isNotEmpty(list))
          return over(lastLens, over(lensIndex(1), mergeDeepLeft({style: {fontFamily: value}})), list);
        return append(['span', {style: {fontFamily: value}}], list);
      default:
        return list;
    }
  }, [], sortLineAttributesByPriority(toPairs(attributes))/*?*/);

  const wrapper = composeEm(map(apply(wrap), composition));

  if (data === '\n')
    return wrapper(<br />);

  if (typeof data === 'object') {
    const props = {
      style: {
        display: 'block'
      }
    };
    if (has('align', attributes))
      switch (prop('align', attributes)) {
        case 'center':
          props.style.margin = '0 auto';
          break;
        case 'left':
          props.style.margin = '0 auto 0 0';
          break;
        case 'right':
          props.style.margin = '0 0 0 auto';
          break;
      }
    switch (head(keys(data))) {
      case 'video':
        return (
          <iframe src={data.video} frameBorder={0} allowFullScreen {...props}/>
        );
      case 'image':
        return (
          <img src={prop('image', data)} {...pick(['alt', 'width', 'height'], attributes)} {...props}/>
        );
    }
  }

  return wrapper(data);
};

export const Delta = ({ delta, sizeMap = {}, indentWidth = '15px'}) => {
  // Regroup
  const fineGroups = [];
  const ops = defaultTo([], prop('ops', delta));
  for(const op of ops) {
    const attributes = defaultTo({}, prop('attributes', op));
    const data = prop('insert', op);

    if (test(/\n/, data)) {
      const segments = reject(isEmpty, split(/(\n)/, data));
      for(const segment of segments) {
        fineGroups.push({
          data: segment,
          attributes
        });
      }
    } else
      fineGroups.push({
        data,
        attributes
      });
  }

  //TODO: try to refactor this a bit
  const lastFineGroup = last(fineGroups);
  if (isNotNil(lastFineGroup) && head(prop('data', lastFineGroup)) == '\n' && isEmpty(prop('attributes', lastFineGroup)))
    fineGroups.pop();

  const popAll = (arr) => {
    const result = [];
    while(arr.length)
      result.push(arr.shift());
    return result;
  }

  const lines = [];
  const lineQueue = [];
  for(const group of fineGroups) {
    const data = prop('data', group);
    const attributes = prop('attributes', group);

    if(test(/^\n$/, data) && !isEmpty(attributes)) {
      lines.push({
        data: isEmpty(lineQueue) ? [''] : popAll(lineQueue),
        attributes
      });
    } else if (test(/^\n$/, data))
      lines.push({
        data: [...popAll(lineQueue), group],
        attributes
      });
    else if (typeof data === 'object')
      lines.push({
        data: [group],
        attributes: {}
      });
    else
      lineQueue.push(group);
  }
  if (lineQueue.length)
    lines.push({
      data: popAll(lineQueue),
      attributes: {}
    });

  const lineGroups = [];
  const groupQueue = [];
  let newListType;
  let previousListType;
  for (const line of lines) {
    const attributes = prop('attributes', line);
    newListType = prop('list', attributes);

    if(isNotNil(newListType) && (isNil(previousListType) || equals(previousListType, newListType))) {
        groupQueue.push(line);
    } else if (isNotNil(previousListType)) {
      lineGroups.push({
        data: popAll(groupQueue),
        attributes: {
          list: previousListType
        }
      });
      if (isNotNil(newListType))
        groupQueue.push(line);
      else
        lineGroups.push({
          data: [line],
          attributes
        });
    } else
      lineGroups.push({
        data: [line],
        attributes
      });
    
    previousListType = newListType;
  }
  if (isNotEmpty(groupQueue))
    lineGroups.push({
      data: popAll(groupQueue),
      attributes: {
        list: newListType
      }
    });

  const formatLineGroup = (config) => ({data, attributes}) => {
    const formattedLines = map(formatLines(config), data);

    switch (prop('list', attributes)) {
      case 'ordered':
        return (
          <ol>{formattedLines}</ol>
        );
      case 'bullet':
        return (
          <ul>{formattedLines}</ul>
        );
      default:
          return formattedLines;
    }
  };

  const formatLines = (config) => ({data, attributes}) => {
    const formattedLine = map(formatLine(config), data);
    let props = {};

    if (has('indent', attributes))
      props = mergeDeepLeft({style: {marginLeft: `calc(${config.indentWidth} * ${attributes.indent})`}}, props);

    if (has('align', attributes))
      props = mergeDeepLeft({style: {textAlign: attributes.align}}, props);

    if (has('header', attributes))
      return React.createElement(`h${attributes.header}`, props, formattedLine);

    if (has('blockquote', attributes))
      return <blockquote {...props}>{formattedLine}</blockquote>

    if (has('list', attributes))
      return <li {...props}>{formattedLine}</li>;

    if (has('indent', attributes))
      return <div {...props}>{formattedLine}</div>

    if (has('align', attributes))
      return <div {...props}>{formattedLine}</div>

    return formattedLine;
  };

  return map(formatLineGroup({sizeMap, indentWidth}), lineGroups);
};