import React, { memo, useState, useEffect, useRef, useImperativeMethods, forwardRef, useCallback } from "react";
import Quill from "quill";
import {
  isNil,
  keys,
  not,
  isEmpty,
  complement,
  or
} from "ramda";

// Material UI
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatAlignJustifyIcon from "@material-ui/icons/FormatAlignJustify";
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { SketchPicker } from 'react-color';

import { useDelta } from "./useDelta";

import "quill/dist/quill.snow.css";
import "./styles.css";

const isNotNil = complement(isNil);

const Toolbar = memo(({quill}) => {
  // TODO: Consider refactoring this appropriately.
  const alignment = quill && quill.getFormat().align;
  const formats = (quill && keys(quill.getFormat())) || [];
  const color = (quill && quill.getFormat().color) || '#000';
  const header = quill && quill.getFormat().header;
  const onChange = useCallback((event, alignment) => {
    quill.format('align', alignment, 'user');
  }, [quill]);
  const handleFormatsChange = useCallback((event) => {
    const format = event.currentTarget.value;
    const previousValue = isNotNil(quill.getFormat()[format]);
    quill.format(format, not(previousValue), 'user');
  }, [quill]);
  const onColorChange = useCallback((color) => {
    quill.format('color', color && color.hex, 'user');
  }, [quill]);

  const onHeaderChange = useCallback((value) => () => {
    quill.format('header', value);
  }, [quill]);

  return (
    <div id="toolbar">
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
          <FormatColorFillIcon />
          <ArrowDropDownIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      {formats.includes('color') && (
        <SketchPicker color={color} onChange={onColorChange} />
      )}
      {/* <List>
        <ListItem button>
          <ListItemText
            primary="Header"
            secondary={`H${header}`}
            />
        </ListItem>
      </List>
      <Menu open>
        {
          [
            'Header 1',
            'Header 2',
            'Header 3',
            'Header 4',
            'Header 5',
            'Header 6',
            'Header 7',
            'Header 8',
          ].map((option, index) => (
            <MenuItem
              key={option}
              disabled={index === 0}
              selected={index === header}
              onClick={onHeaderChange}
            >
              {option}
            </MenuItem>
          ))
        }
      </Menu> */}
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

const QuillEditor = forwardRef((props, ref) => {
  const quillRef = useRef(null);
  const quillEditor = useRef(null);

  // Forward the quillRef to the parent component
  useImperativeMethods(ref, () => quillEditor.current);

  useEffect(
    () => {
      if (quillRef.current !== null) {
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
      }
    },
    [quillRef]
  );

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

  return <div ref={quillRef} />;
});

export const App = () => {
  const quill = useRef();
  const [quillSelection, setQuillSelection] = useState([null, null]);
  const [value, setValue] = useState();

  const { Delta } = useDelta();

  console.log(value);
  return (
    <div className="App">
      <Toolbar quill={quill.current} selection={quillSelection} valueChange={value}/>
      <QuillEditor ref={quill} onChange={setValue} formats={formats} />
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