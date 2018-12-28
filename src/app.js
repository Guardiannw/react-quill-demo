import React, { memo, useMemo, useState, useEffect, useRef, useImperativeMethods, forwardRef, useCallback } from "react";
import Quill from "quill";
import {
  isNil,
  toPairs,
  has,
  prop,
  compose,
  path,
  reduce,
  keys,
  values,
  not,
  map,
  isEmpty,
  complement,
  pickAll,
  or
} from "ramda";

// Material UI
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

// Material UI Icons
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import FormatIndentIncreaseIcon from "@material-ui/icons/FormatIndentIncrease";
import FormatIndentDecreaseIcon from "@material-ui/icons/FormatIndentDecrease";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatAlignJustifyIcon from "@material-ui/icons/FormatAlignJustify";
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatColorTextIcon from '@material-ui/icons/FormatColorText';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import { SketchPicker } from 'react-color';

import { useDelta } from "./useDelta";

import "quill/dist/quill.snow.css";
import "./styles.css";

const isNotNil = complement(isNil);

const HeaderMenu = ({onChange, header = ""}) => {
  const onHeaderChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);

  return (
    <FormControl>
      <InputLabel htmlFor="toolbar-header-select">Header</InputLabel>
      <Select
        value={header}
        onChange={onHeaderChange}
        id="toolbar-header-select"
        data-cy="toolbar-header-select">
        <MenuItem value="">None</MenuItem>
        <MenuItem value="1">Header 1</MenuItem>
        <MenuItem value="2">Header 2</MenuItem>
        <MenuItem value="3">Header 3</MenuItem>
        <MenuItem value="4">Header 4</MenuItem>
        <MenuItem value="5">Header 5</MenuItem>
        <MenuItem value="6">Header 6</MenuItem>
      </Select>
    </FormControl>
  );
};


const FontMenu = ({onChange, fonts = [], font = ""}) => {
  const onFontChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);

  const menuItems = useMemo(() => {
    return map(([label, font]) => (
      <MenuItem key={font} value={font}>{label}</MenuItem>
    ), toPairs(fonts));
  }, [fonts]);

  return (
    <FormControl>
      <InputLabel htmlFor="toolbar-font-select">Font</InputLabel>
      <Select
        value={font}
        onChange={onFontChange}
        id="toolbar-font-select"
        data-cy="toolbar-font-select">
          <MenuItem value="">None</MenuItem>
          {menuItems}
      </Select>
    </FormControl>
  );
};

const Toolbar = memo(({quill, fonts}) => {
  const getAttributes = useCallback(() => quill ? quill.getFormat() : {}, [quill]);

  const attributes = getAttributes();

  const onChange = useCallback((event, alignment) => {
    quill.format('align', alignment, 'user');
  }, [quill]);

  const formats = useMemo(() => keys(attributes), [attributes]);

  const handleFormatsChange = useCallback((event) => {
    const format = path(['currentTarget', 'value'], event);
    const attributes = getAttributes();
    const previousValue = has(format, attributes) ? prop(format, attributes) : false;
    quill.format(format, not(previousValue), 'user');
  }, [quill]);

  const onColorChange = useCallback((color) => {
    quill.format('color', color && color.hex, 'user');
  }, [quill]);

  const onHeaderChange = useCallback((value) => {
    quill.format('header', value);
  }, [quill]);

  const onFontChange = useCallback((value) => {
    quill.format('font', value);
  }, [quill]);

  const alignment = attributes.align;
  const color = attributes.color || '#000';
  const header = attributes.header;
  const font = attributes.font;
  const block = useMemo(() => {
    if (attributes.list === 'ordered')
      return 'list-ordered';
    if (attributes.list === 'bullet')
      return 'list-unordered';
  }, [attributes.list]);

  const onBlocksChange = useCallback((event) => {
    const key = path(['currentTarget', 'value'], event);
    const attributes = getAttributes();
    switch (key) {
      case 'list-ordered':
        if (attributes.list === 'ordered')
          quill.format('list', false);
        else
          quill.format('list', 'ordered');
        break;
      case 'list-unordered':
        if (attributes.list === 'bullet')
          quill.format('list', false);
        else
          quill.format('list', 'bullet');
        break;
      case 'indent-decrease':
        if (attributes.indent == null || attributes.indent === 1)
          quill.format('indent', false);
        else
          quill.format('indent', attributes.indent - 1);
        break;
      case 'indent-increase':
        if (attributes.indent == null)
          quill.format('indent', 1);
        else if (attributes.indent >= 7)
          quill.format('indent', 8);
        else
          quill.format('indent', attributes.indent + 1);
        break;
    }
  }, [quill]);

  return (
    <div data-cy="toolbar">
      <ToggleButtonGroup value={alignment} exclusive onChange={onChange}>
        <ToggleButton value={null}>
          <FormatAlignLeftIcon />
        </ToggleButton>
        <ToggleButton value="center">
          <FormatAlignCenterIcon />
        </ToggleButton>
        <ToggleButton value="right">
          <FormatAlignRightIcon />
        </ToggleButton>
        <ToggleButton value="justify">
          <FormatAlignJustifyIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup value={formats} onChange={handleFormatsChange}>
        <ToggleButton value="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic">
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton value="underline">
          <FormatUnderlinedIcon />
        </ToggleButton>
        <ToggleButton value="color">
          <FormatColorTextIcon />
          <ArrowDropDownIcon />
        </ToggleButton>
        <ToggleButton value="blockquote">
          <FormatQuoteIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <ToggleButtonGroup value={block} exclusive onChange={onBlocksChange}>
        <ToggleButton value="list-ordered">
          <FormatListNumberedIcon />
        </ToggleButton>
        <ToggleButton value="list-unordered">
          <FormatListBulletedIcon />
        </ToggleButton>
        <ToggleButton value="indent-decrease">
          <FormatIndentDecreaseIcon />
        </ToggleButton>
        <ToggleButton value="indent-increase">
          <FormatIndentIncreaseIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      {formats.includes('color') && (
        <SketchPicker color={color} onChange={onColorChange} />
      )}
      <HeaderMenu onChange={onHeaderChange} header={header}/>
      <FontMenu onChange={onFontChange} fonts={fonts} font={font} />
    </div>
  );
});

const modules = {
  toolbar: {
    container: '#toolbar',
    handlers: {}
  }
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'script',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'color',
  'align'
];

const QuillEditor = (props) => {
  const quillRef = useRef(null);
  const quillEditor = useRef(null);
  const fonts = useMemo(() => props.fonts || [], []);

  useMemo(() => {
    const FontAttributor = Quill.import('attributors/class/font');

    FontAttributor.whitelist = fonts;

    Quill.register(FontAttributor, true);
  }, []);

  useEffect(
    () => {
      quillEditor.current = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
          
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
          
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link'],
            ['video'],
          
            ['clean']                                         // remove formatting button
          ]
        },
        formats: props.formats
      });

      if (props.onEditorInit)
        props.onEditorInit(quillEditor.current);
    },
    [quillRef]
  );

  useEffect(() => {
    if (quillEditor.current && props.onEditorInit)
      props.onEditorInit(quillEditor.current);
  }, [quillEditor.current, props.onEditorInit]);

  useEffect(
    () => {
      if (
        quillEditor.current !== null &&
        typeof props.onChange === 'function'
      ) {
        const editor = quillEditor.current;

        const onEditorChange = (eventName) => {
          if (eventName === 'text-change') {
            props.onChange(editor.getContents.bind(editor));
          }
        };

        editor.on('editor-change', onEditorChange);

        return () => {
          editor.off('editor-change', onEditorChange);
        };
      }
    },
    [quillEditor.current, props.onChange]
  );

  useEffect(
    () => {
      if (quillEditor.current !== null && typeof props.onSelectionChange === 'function') {
        const editor = quillEditor.current;

        const onSelectionChange = (range, oldRange) => {
          props.onSelectionChange([range, oldRange]);
        };

        editor.on('selection-change', onSelectionChange);

        return () => {
          editor.off('selection-change', onSelectionChange);
        };
      }
    },
    [quillEditor.current, props.onSelectionChange]
  );

  return (<>
      <style>
        {fonts.map((font) => `
          .ql-font-${font} {
            font-family: ${font};
          }
        `).join('')}
      </style>
    <div ref={quillRef} />
  </>);
};

export const App = () => {
  const [quill, setQuill] = useState(null);
  const [quillSelection, setQuillSelection] = useState([null, null]);
  const [value, setValue] = useState();
  const fonts = useMemo(() => ({
    "Verdana": "verdana",
    "Ariel": "ariel"
  }), []);
  const fontValues = useMemo(() => values(fonts), [fonts]);

  const { Delta } = useDelta();

  return (
    <div className="App">
      <Toolbar quill={quill} fonts={fonts} selection={quillSelection} valueChange={value}/>
      <QuillEditor fonts={fontValues} onEditorInit={setQuill} onChange={setValue} onSelectionChange={setQuillSelection} formats={formats} />
      <div>
          <Delta delta={value} sizeMap={{
            small: '14px',
            large: '26px',
            huge: '40px'
          }} indentWidth="3em"/>
      </div>
    </div>
  );
};