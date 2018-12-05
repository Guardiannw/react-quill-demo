import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import {
  isNil,
  isEmpty,
  or
} from "ramda";

// Material UI
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatAlignJustifyIcon from "@material-ui/icons/FormatAlignJustify";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import { useDelta } from './useDelta';

import "quill/dist/quill.snow.css";
import "./styles.css";

const isNilOrEmpty = or(isNil, isEmpty);

const Toolbar = () => {
  const [alignment, setAlignment] = useState("center");
  return (
    <div id="toolbar">
      <ToggleButtonGroup value={alignment} exclusive onChange={setAlignment}>
        <ToggleButton value="left">
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
    </div>
  );
};

const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {}
  }
};

const formats = [
  "header",
    "font",
    "size",
  "bold",
  "italic",
  "underline",
  "script",
      "blockquote",
  "list",
  "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "align"
];

const QuillEditor = props => {
  const quillRef = useRef(null);
  const quillEditor = useRef(null);

  useEffect(
    () => {
      if (quillRef.current !== null) {
        quillEditor.current = new Quill(quillRef.current, {
          theme: "snow",
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
        typeof props.onChange === "function"
      ) {
        let editor = quillEditor.current;

        const onEditorChange = (eventName, ...args) => {
          if (eventName === "text-change") {
            props.onChange(editor.getContents.bind(editor));
          }
        };

        editor.on("editor-change", onEditorChange);

        return () => {
          editor.off("editor-change", onEditorChange);
        };
      }
    },
    [quillEditor, props.onChange]
  );

  return <div ref={quillRef} />;
};

export const App = () => {
  const [value, setValue] = useState();

  const { Delta } = useDelta();

  console.log(value);
  return (
    <div className="App">
      <Toolbar />
      <QuillEditor onChange={setValue} formats={formats} />
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