import React, { memo, useMemo, useState, useEffect, useRef, useCallback } from "react";
import Quill from "quill";
import {
  isNil,
  toPairs,
  has,
  prop,
  compose,
  path,
  keys,
  values,
  not,
  map,
  defaultTo,
  complement
} from "ramda";

import uuid from 'uuid/v4';

// Material UI
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper';
import RootRef from '@material-ui/core/RootRef';
import { withStyles } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';

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
import InsertLinkIcon from '@material-ui/icons/InsertLink';

// Custom Icons
import {
  FormatSubscriptIcon,
  FormatSuperscriptIcon
} from './icons';

import { SketchPicker } from 'react-color';

import { useDelta } from "./useDelta";

import "quill/dist/quill.snow.css";
import "./styles.css";

const SizeMenu = ({onChange, size = ""}) => {
  const onSizeChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);

  return (
    <FormControl>
      <InputLabel htmlFor="toolbar-size-select">Size</InputLabel>
      <Select
        value={size}
        onChange={onSizeChange}
        id="toolbar-size-select"
        data-cy="toolbar-size-select">
        <MenuItem value="">Normal</MenuItem>
        <MenuItem value="small">Small</MenuItem>
        <MenuItem value="large">Large</MenuItem>
        <MenuItem value="huge">Huge</MenuItem>
      </Select>
    </FormControl>
  );
};

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

const LinkInput = ({value, onChange}) => {
  return (
    <FormControl>
      <InputLabel htmlFor="toolbar-link-input">Link</InputLabel>
      <Input id="toolbar-link-input"
        type="text"
        value={value}
        onChange={onChange}
        endAdornment={(
          <InputAdornment position="end">
            <IconButton>
              <InsertLinkIcon />
            </IconButton>
          </InputAdornment>
        )} />
    </FormControl>
  );
};

const LinkEditPopover = ({anchorBounds, open, container, link, onChange}) => {
  const parentContainer = useMemo(() => container && container.parentElement, [container]);

  const anchorEl = useMemo(() => {
    const getBoundingClientRect = () => {

      if (!parentContainer)
        return {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      
      const containerRect = parentContainer.getBoundingClientRect();
  
      if (!anchorBounds)
        return containerRect;
  
      const width = anchorBounds.width;
      const height = anchorBounds.height;
      const left = anchorBounds.left - window.pageXOffset;
      const top = anchorBounds.top - window.pageYOffset;
      const right = left + width;
      const bottom = top + height;
      const x = left;
      const y = top;
  
      return {
        width,
        height,
        left,
        top,
        right,
        bottom,
        x,
        y
      };
    };

    const boundingRect = getBoundingClientRect();

    return {
      clientWidth: boundingRect.width,
      clientHeight: boundingRect.height,
      getBoundingClientRect
    };
  }, [anchorBounds, parentContainer]);

  const modifiers = useMemo(() => {
    if (container)
      return {
        offset: {
          enabled: false
        },
        preventOverflow: {
          boundariesElement: parentContainer
        }
      };

    return {

    };
  }, [container]);

  return (
    <Popper
      container={container}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={modifiers}
      open={open}>
        <Paper>
          {link}
        </Paper>
    </Popper>
  );
};

const DynamicFormatColorTextIcon = withStyles({
  root: {
    '& > path:nth-of-type(2)': {
      fillOpacity: 1,
      fill: compose(defaultTo(null), prop('fontColor'))
    }
  }
})(({fontColor, classes, ...props}) => (
  <FormatColorTextIcon className={classes.root} {...props}/>
));

const ColorPickerToolbarItem = memo(({color, onColorChange}) => {
  const [toolbarButton, setToolbarButton] = useState();
  const [open, setOpen] = useState(false);
  const toggleOpen = useCallback(() => setOpen((x) => !x), [setOpen]);

  const formattedColor = useMemo(() => ({
    hex: color || '#000'
  }), [color]);

  const modifiers = useMemo(() => {
    return {
      flip: {
        enabled: false
      }
    };
  }, []);

  return (
    <>
      <RootRef rootRef={setToolbarButton}>
        <ToggleButton ref={setToolbarButton} onChange={toggleOpen} selected={open}>
          <DynamicFormatColorTextIcon fontColor={color} />
          <ArrowDropDownIcon />
        </ToggleButton>
      </RootRef>
      <Popper
        anchorEl={toolbarButton}
        placement="bottom-start"
        modifiers={modifiers}
        open={open}>
        <SketchPicker color={formattedColor} onChange={onColorChange} />
      </Popper>
    </>
  );
});

const InlineToggleButtonGroup = memo(withStyles({
  root: {
    margin: '0 8px',
    display: 'inline-block',
    verticalAlign: 'bottom',
    '&$selected': {
      boxShadow: 'none'
    }
  },
  selected: {
    boxShadow: 'none'
  }
})(ToggleButtonGroup));

const Toolbar = memo(({quill, fonts, sizeMap}) => {

  if (!quill)
    return <div />;

  const [, updateComponent] = useState();
  const refresh = useMemo(() => compose(updateComponent, uuid), [updateComponent]);

  const getAttributes = useCallback(() => quill ? quill.getFormat() : {}, [quill]);

  const attributes = getAttributes();

  const onChange = useCallback((event, alignment) => {
    quill.format('align', alignment, 'user');

    refresh();
  }, [quill]);

  const formats = useMemo(() => keys(attributes), [attributes]);

  const handleFormatsChange = useCallback((event) => {
    const format = path(['currentTarget', 'value'], event);
    const attributes = getAttributes();
    const previousValue = has(format, attributes) ? prop(format, attributes) : false;
    quill.format(format, not(previousValue), 'user');

    refresh();
  }, [quill]);

  const onColorChange = useCallback((color) => {
    quill.format('color', color && color.hex, 'user');

    refresh();
  }, [quill]);

  const onHeaderChange = useCallback((value) => {
    quill.format('header', value);

    refresh();
  }, [quill]);

  const onFontChange = useCallback((value) => {
    quill.format('font', value);

    refresh();
  }, [quill]);

  const onSizeChange = useCallback((value) => {
    quill.format('size', value);

    refresh();
  }, [quill]);

  const onScriptChange = useCallback((event) => {
    const format = path(['currentTarget', 'value'], event);
    const previousValue = getAttributes().script;
    quill.format('script', previousValue === format ? false : format);

    refresh();
  }, [quill]);

  const onLinkChange = useCallback((value) => {
    quill.format('link', value == null ? false : value);

    refresh();
  }, [quill]);

  const tooltipContainer = useMemo(() => {
    if (!quill)
      return;

    let element = quill.addContainer('ql-react-tooltip');

    element.setAttribute('style', `
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    `);

    return element;
  }, [quill]);

  const script = attributes.script;
  const alignment = attributes.align;
  const color = attributes.color;
  const header = attributes.header;
  const font = attributes.font;
  const size = attributes.size;
  const link = attributes.link;
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

    refresh();
  }, [quill]);

  const bounds = useMemo(() => {
    if (quill) {
      const {index, length} = quill.getSelection();
      const bounds = quill.getBounds(index, length);

      return bounds;
    }
  }, [quill, link]);

  return (
    <div data-cy="toolbar">
      <InlineToggleButtonGroup value={alignment} exclusive onChange={onChange} selected="auto" selected="auto">
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
      </InlineToggleButtonGroup>

      <InlineToggleButtonGroup value={formats} onChange={handleFormatsChange} selected="auto">
        <ToggleButton value="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic">
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton value="underline">
          <FormatUnderlinedIcon />
        </ToggleButton>
        <ColorPickerToolbarItem color={color} onColorChange={onColorChange} />
        <ToggleButton value="blockquote">
          <FormatQuoteIcon />
        </ToggleButton>
      </InlineToggleButtonGroup>

      <InlineToggleButtonGroup value={script} exclusive onChange={onScriptChange} selected="auto">
        <ToggleButton value="super">
          <FormatSuperscriptIcon />
        </ToggleButton>
        <ToggleButton value="sub">
          <FormatSubscriptIcon />
        </ToggleButton>
      </InlineToggleButtonGroup>

      <InlineToggleButtonGroup value={block} exclusive onChange={onBlocksChange} selected="auto">
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
      </InlineToggleButtonGroup>

      <LinkEditPopover anchorBounds={bounds} open={!!link} container={tooltipContainer} link={link}/>

      <HeaderMenu onChange={onHeaderChange} header={header}/>

      <FontMenu onChange={onFontChange} fonts={fonts} font={font} />

      <SizeMenu onChange={onSizeChange} size={size} />

      <LinkInput onChange={onLinkChange} value={link} />
    </div>
  );
});

const formats = [
  'header', //Done
  'font', //Done
  'size', //Done
  'bold', //Done
  'italic', //Done
  'underline', //Done
  'script', //Done
  'blockquote', //Done
  'list', //Done
  'bullet', //Done
  'indent', //Done
  'link',
  'image',
  'video', // TODO: Need to find a way to upload videos to s3 in the editor?
  'color', // TODO: WORKING ON IT
  'align' //Done
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
          toolbar: false
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
          //TODO: Figure out why this is causing it to re-focus
          if (range !== null)
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