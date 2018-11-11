import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Quill from "quill";
import {
  path,
  compose,
  type,
  __,
  reject,
  always,
  identity,
  map,
  prop,
  join,
  invoker,
  pick,
  isNil,
  isEmpty,
  when,
  or,
  reverse,
  prepend,
  useWith,
  has,
  split,
  equals,
  bind,
  chain,
  reduce,
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
  "header",
  //   "font",
  //   "size",
  "bold",
  "italic",
  "underline",
  //   "strike",
  //     "blockquote",
  "list",
  "bullet"
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

const Deltas = ({ delta }) => {
  if (isNilOrEmpty(delta)) return null;

  console.log(prop("ops", delta));
  let reversedOps = reverse(prop("ops", delta));

  const result = [];

  let lineAttributes = {};

  const isLineConfig = equals("\n");
  const isType = typeId =>
    compose(
      equals(typeId),
      type
    );
  const isString = isType("string");
  const isObject = isType("object");
  const addItem = bind(result.unshift, result);

  for (const op of reversedOps) {
    let attributes = prop("attributes", op);
    let data = prop("insert", op);

    if (isString(data)) {
      if (isLineConfig(data)) {
        lineAttributes = attributes;
        addItem(<br />);
        continue;
      }

      data = replaceEl("\n", <br />, reject(isEmpty, split(/(\n)/, data)));

      if (prop("bold", attributes)) data = <strong>{data}</strong>;

      if (prop("underline", attributes)) data = <u>{data}</u>;

      if (prop("italic", attributes)) data = <em>{data}</em>;

      addItem(data);
    } else if (isObject(data)) {
      if (has("image", data)) {
        let imgAttributes = pick(["alt", "width", "height"], attributes);

        addItem(<img src={prop("image", data)} {...imgAttributes} />);
      }
    }
  }

  return result;
};

const App = () => {
  const [value, setValue] = useState();

  console.log(value);
  return (
    <div className="App">
      <Toolbar />
      <QuillEditor onChange={setValue} formats={formats} />
      <div>
        <Deltas delta={value} />
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
