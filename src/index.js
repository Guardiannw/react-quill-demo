import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Quill from "quill";
import {
  path,
  reject,
  always,
  identity,
  map,
  prop,
  join,
  pick,
  isNil,
  isEmpty,
  when,
  or,
  useWith,
  has,
  split,
  equals,
  chain,
  append
} from "ramda";

// Material UI
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatAlignJustifyIcon from "@material-ui/icons/FormatAlignJustify";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

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
  //   "header",
  //   "font",
  //   "size",
  "bold",
  "italic",
  "underline"
  //   "strike",
  //   "blockquote",
  //   "list",
  //   "bullet",
  //   "indent",
  //   "link",
  //   "image",
  //   "color",
  //   "align"
];

const QuillEditor = props => {
  const quillRef = useRef(null);
  const quillEditor = useRef(null);

  useEffect(
    () => {
      if (quillRef.current !== null) {
        quillEditor.current = new Quill(quillRef.current, {
          theme: "snow",
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

const replaceArr = (cond, mapping, arr) => map(when(cond, mapping), arr);
const replaceEl = useWith(replaceArr, [equals, always, identity]);

const Deltas = ({ deltas }) => {
  if (isNilOrEmpty(deltas)) return null;

  return map(op => {
    let attributes = prop("attributes", op);
    let insert = prop("insert", op);

    switch (typeof insert) {
      case "string":
        insert = replaceEl(
          "\n",
          <br />,
          reject(isEmpty, split(/(\n)/, insert))
        );

        if (prop("bold", attributes)) insert = <strong>{insert}</strong>;

        if (prop("underline", attributes)) insert = <u>{insert}</u>;

        if (prop("italic", attributes)) insert = <em>{insert}</em>;

        break;
      case "object":
        if (has("image", insert)) {
          let imgAttributes = pick(["alt", "width", "height"], attributes);
          return <img src={prop("image", insert)} {...imgAttributes} />;
        }
        break;
    }

    return insert;
  }, deltas);
};

const App = () => {
  const [value, setValue] = useState("");

  console.log(value);
  return (
    <div className="App">
      <Toolbar />
      <QuillEditor onChange={setValue} formats={formats} />
      <div>
        <Deltas deltas={value} />
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
