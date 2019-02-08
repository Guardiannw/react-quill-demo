import React, {
  forwardRef,
  memo,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback
} from "react";
import Quill from "quill";
import {
  __,
  toPairs,
  toString,
  range,
  complement,
  converge,
  concat,
  identity,
  nth,
  mergeAll,
  objOf,
  isNil,
  has,
  both,
  prop,
  invoker,
  useWith,
  equals,
  merge,
  compose,
  reduce,
  path,
  keys,
  values,
  not,
  nAry,
  map,
  defaultTo
} from "ramda";

import uuid from 'uuid/v4';
import classNames from 'classnames';

// Material UI
import { createMuiTheme } from '@material-ui/core/styles';
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper';
import RootRef from '@material-ui/core/RootRef';
import { withStyles, makeStyles, ThemeProvider } from '@material-ui/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Button from '@material-ui/core/Button';

// Material UI Colors
import blue from '@material-ui/core/colors/blue';

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
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import MovieIcon from '@material-ui/icons/Movie';

// Custom Icons
import {
  FormatSubscriptIcon,
  FormatSuperscriptIcon
} from './icons';

import { SketchPicker } from 'react-color';

import { useDelta } from "./useDelta";

import {convertFileToDataURI} from './convert-to-data-uri';

import "./styles.css";

// Functions
const isNotNil = complement(isNil);

const defaultTheme = createMuiTheme({});

const useSizeMenuStyles = makeStyles({
  root: {
    width: 75,
    '&&': {
      marginLeft: 8,
      marginRight: 8
    }
  }
});

const SizeMenu = ({onChange, size = ""}) => {
  const classes = useSizeMenuStyles();

  const onSizeChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);

  return (
    <TextField select
      classes={classes}
      label="Size"
      value={size}
      onChange={onSizeChange}
      data-cy="toolbar-size-select">
      <MenuItem value="">Normal</MenuItem>
      <MenuItem value="small">Small</MenuItem>
      <MenuItem value="large">Large</MenuItem>
      <MenuItem value="huge">Huge</MenuItem>
    </TextField>
  );
};

const useHeaderMenuStyles = makeStyles({
  root: {
    width: 100,
    '&&': {
      marginLeft: 8,
      marginRight: 8
    }
  }
});

const HeaderMenu = ({onChange, header = ""}) => {
  const classes = useHeaderMenuStyles();

  const onHeaderChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);

  return (
      <TextField
        select
        classes={classes}
        label="Header"
        value={header}
        onChange={onHeaderChange}
        data-cy="toolbar-header-select">
        <MenuItem value="">None</MenuItem>
        <MenuItem value="1">Header 1</MenuItem>
        <MenuItem value="2">Header 2</MenuItem>
        <MenuItem value="3">Header 3</MenuItem>
        <MenuItem value="4">Header 4</MenuItem>
        <MenuItem value="5">Header 5</MenuItem>
        <MenuItem value="6">Header 6</MenuItem>
      </TextField>
  );
};

const useFontMenuStyles = makeStyles({
  root: {
    width: 100,
    '&&': {
      marginLeft: 8,
      marginRight: 8
    }
  }
});

const FontMenu = ({onChange, fonts = [], font = ""}) => {
  const classes = useFontMenuStyles();

  const onFontChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);

  const menuItems = useMemo(() => map(([label, font]) => (
      <MenuItem key={font} value={font}>{label}</MenuItem>
    ), toPairs(fonts)), [fonts]);

  return (
      <TextField
        select
        classes={classes}
        label="Font"
        value={font}
        onChange={onFontChange}
        data-cy="toolbar-font-select">
          <MenuItem value="">None</MenuItem>
          {menuItems}
      </TextField>
  );
};

const createAnchorEl = (anchorBounds, parentContainer) => {
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
      const left = anchorBounds.left + containerRect.left;
      const top = anchorBounds.top + containerRect.top;
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
  const toggleOpen = useCallback(() => setOpen(not), [setOpen]);

  // Only use the click-away to close the menu if it is not the button itself.
  const close = useCallback((event) => {
    if (!event.composedPath().includes(toolbarButton))
      setOpen(false);
  }, [toolbarButton]);

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
        <ToggleButton onChange={toggleOpen} selected={open} data-cy="color-picker-toolbar-button">
          <DynamicFormatColorTextIcon fontColor={color} />
          <ArrowDropDownIcon />
        </ToggleButton>
      </RootRef>
      <Popper
        anchorEl={toolbarButton}
        placement="bottom-start"
        modifiers={modifiers}
        open={open}>
        <ClickAwayListener onClickAway={close}>
          <SketchPicker color={formattedColor} onChange={onColorChange} />
        </ClickAwayListener>
      </Popper>
    </>
  );
});

const usePopperModifiers = (boundariesElement) => {
  return useMemo(() => {
    if (boundariesElement)
      return {
        preventOverflow: {
          boundariesElement
        },
        offset: {
          offset: '0, 4'
        },
        offsetInContainer: {
          enabled: true,
          order: 825,
          fn: (data) => {
            const boundaryRect = boundariesElement.getBoundingClientRect();
            const boundaryOffsetY = boundaryRect.y + window.pageYOffset;
            const boundaryOffsetX = boundaryRect.x + window.pageXOffset;

            data.offsets.reference.top -= boundaryOffsetY;
            data.offsets.reference.left -= boundaryOffsetX;
            data.offsets.popper.top -= boundaryOffsetY;
            data.offsets.popper.left -= boundaryOffsetX;

            return data;
          }
        }
      };
  }, [boundariesElement]);
};

const useLinkPaperStyles = makeStyles((theme) => {
  return {
    root: {
      ...theme.mixins.gutters(),
      paddingTop: theme.spacing.unit,
      paddingBottom: theme.spacing.unit
    },
    button: {
      '&&': {
        backgroundColor: blue[500],
        '&:hover': {
          backgroundColor: blue[700]
        }
      }
    }
  };
});

const ImageInput = memo(({anchorBounds, container, onSubmit}) => {
  const classes = useLinkPaperStyles();

  const parentContainer = prop('parentElement', container);

  const anchorEl = useMemo(() => createAnchorEl(anchorBounds, parentContainer), [anchorBounds, parentContainer]);

  const [toolbarButton, setToolbarButton] = useState();
  const [open, setOpen] = useState(false);
  const [imageEmbed, setImageEmbed] = useState('');

  const toggleOpen = useCallback(() => setOpen(not), [setOpen]);

  // Only use the click-away to close the menu if it is not the button itself.
  const close = useCallback((event) => {
    if (!event.composedPath().includes(toolbarButton)) {
      setOpen(false);
      setImageEmbed('');
    }
  }, [toolbarButton]);

  const handleChange = useCallback(compose(setImageEmbed, path(['target', 'value'])), [setImageEmbed]);

  const handleSubmit = useCallback(() => {
    onSubmit(imageEmbed);
    setOpen(false);
    setImageEmbed('');
  }, [imageEmbed, onSubmit]);

  const handleUpload = useCallback(async (event) => {
    const file = path(['target', 'files', 0], event);

    if (isNil(file))
      return;

    const uri = await convertFileToDataURI(file);

    setImageEmbed(uri);
  }, []);

  const modifiers = usePopperModifiers(parentContainer);

  return (
    <>
      <RootRef rootRef={setToolbarButton}>
        <ToggleButton onChange={toggleOpen}>
          <InsertPhotoIcon />
        </ToggleButton>
      </RootRef>
      <Popper
        anchorEl={anchorEl}
        container={container}
        placement="bottom-start"
        modifiers={modifiers}
        open={open}>
        <ClickAwayListener mouseEvent={'onMouseDown'} onClickAway={close}>
          <Paper className={classes.root}>
            <Grid container spacing={16} alignItems="center">
              <Grid item>
                Image:
              </Grid>
              <Grid item xs>
                <Input className={classes.input} placeholder="Enter Image URL Here..." value={imageEmbed} onChange={handleChange}/>
              </Grid>
              <Grid item xs container spacing={8} wrap="nowrap">
                <Grid item>
                  <Button variant="contained" color="default" component="label">
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleUpload} hidden/>
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmit}>
                    Accept
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
});

const VideoInput = memo(({anchorBounds, container, onSubmit}) => {
  const classes = useLinkPaperStyles();

  const parentContainer = prop('parentElement', container);

  const anchorEl = useMemo(() => createAnchorEl(anchorBounds, parentContainer), [anchorBounds, parentContainer]);

  const [toolbarButton, setToolbarButton] = useState();
  const [open, setOpen] = useState(false);
  const [videoEmbed, setVideoEmbed] = useState('');

  const toggleOpen = useCallback(() => setOpen(not), [setOpen]);

  // Only use the click-away to close the menu if it is not the button itself.
  const close = useCallback((event) => {
    if (!event.composedPath().includes(toolbarButton)) {
      setOpen(false);
      setVideoEmbed('');
    }
  }, [toolbarButton]);

  const handleChange = useCallback(compose(setVideoEmbed, path(['target', 'value'])), [setVideoEmbed]);

  const handleSubmit = useCallback(() => {
    onSubmit(videoEmbed);
    setOpen(false);
    setVideoEmbed('');
  }, [videoEmbed, onSubmit]);

  const modifiers = usePopperModifiers(parentContainer);

  return (
    <>
      <RootRef rootRef={setToolbarButton}>
        <ToggleButton onChange={toggleOpen}>
          <MovieIcon />
        </ToggleButton>
      </RootRef>
      <Popper
        anchorEl={anchorEl}
        container={container}
        placement="bottom-start"
        modifiers={modifiers}
        open={open}>
        <ClickAwayListener mouseEvent={'onMouseDown'} onClickAway={close}>
          <Paper className={classes.root}>
            <Grid container spacing={16} alignItems="center">
              <Grid item>
                Embed:
              </Grid>
              <Grid item xs>
                <Input className={classes.input} placeholder="Enter Video Embed Here..." value={videoEmbed} onChange={handleChange}/>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" className={classes.button} onClick={handleSubmit}>
                  Accept
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
});

const LinkInputPaper = ({link = '', onChange, onAccept}) => {

  const classes = useLinkPaperStyles();

  const handleAccept = useCallback(nAry(0, onAccept), [onAccept]);
  const handleChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);

  return (
    <Paper className={classes.root}>
      <Grid container spacing={16} alignItems="center">
        <Grid item>
          Link:
        </Grid>
        <Grid item xs>
          <Input className={classes.input} placeholder="Enter Link Here..." value={link} onChange={handleChange}/>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" className={classes.button} onClick={handleAccept}>
            Accept
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LinkEditPaper = ({link = '', onChange, onAccept, onRemove}) => {

  const classes = useLinkPaperStyles();

  const handleAccept = useCallback(nAry(0, onAccept), [onAccept]);
  const handleChange = useCallback(compose(onChange, path(['target', 'value'])), [onChange]);
  const handleRemove = useCallback(nAry(0, onRemove), [onRemove]);

  return (
    <Paper className={classes.root}>
      <Grid container spacing={16} alignItems="center">
        <Grid item>
          Edit:
        </Grid>
        <Grid item xs>
          <Input className={classes.input} placeholder="Enter Link Here..." value={link} onChange={handleChange}/>
        </Grid>
        <Grid item xs container spacing={8} wrap="nowrap">
          <Grid item>
            <Button variant="contained" color="primary" className={classes.button} onClick={handleAccept}>
              Save
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={handleRemove}>
              Remove
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LinkInput = memo(({anchorBounds, link, container, onLinkChange}) => {
  const parentContainer = prop('parentElement', container);

  const anchorEl = useMemo(() => createAnchorEl(anchorBounds, parentContainer), [anchorBounds, parentContainer]);

  const [toolbarButton, setToolbarButton] = useState();
  const [open, setOpen] = useState(false);
  const [tempLink, setTempLink] = useState(link);

  // NOTE: Setting the state during rendering is totally fine.  See https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  useMemo(() => {
    setTempLink(link);

    if (link)
      setOpen(true);
    else
      setOpen(false);
  }, [link, anchorBounds]); // NOTE: It is important to include the `anchorBounds` so that, if the user clicks on a different link that has the same `url`, it will still reset the input.

  const toggleOpen = useCallback(() => setOpen(not), [setOpen]);

  // Only use the click-away to close the menu if it is not the button itself.
  const close = useCallback((event) => {
    if (!event.composedPath().includes(toolbarButton)) {
      setOpen(false);
      setTempLink(link);
    }
  }, [toolbarButton]);

  const handleLinkChange = useCallback(() => {
    onLinkChange(tempLink);
    setOpen(false);
  }, [tempLink, onLinkChange]);

  const handleLinkRemove = useCallback(() => {
    onLinkChange();
    setOpen(false);
  }, [onLinkChange]);

  const modifiers = usePopperModifiers(parentContainer);

  return (
    <>
      <RootRef rootRef={setToolbarButton}>
        <ToggleButton onChange={toggleOpen}>
          <InsertLinkIcon />
        </ToggleButton>
      </RootRef>
      <Popper
        anchorEl={anchorEl}
        container={container}
        placement="bottom-start"
        modifiers={modifiers}
        open={open}>
        <ClickAwayListener mouseEvent={'onMouseDown'} onClickAway={close}>
          {link ? (
            <LinkEditPaper link={tempLink} onChange={setTempLink} onAccept={handleLinkChange} onRemove={handleLinkRemove} />
          ) : (
            <LinkInputPaper link={tempLink} onChange={setTempLink} onAccept={handleLinkChange} />
          )}
        </ClickAwayListener>
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

const Toolbar = memo(({quill, fonts, quillRef}) => {
  const [, updateComponent] = useState();
  const refresh = useMemo(() => compose(updateComponent, uuid), [updateComponent]);

  const tooltipContainer = useMemo(() => {
    if (!quill || !quillRef)
      return;

    let element = quill.addContainer('ql-react-tooltip', quillRef.current.firstChild);

    element.setAttribute('style', `
      position: relative;
    `);

    return element;
  }, [quill, quillRef]);

  const getAttributes = useCallback(() => quill ? quill.getFormat() : {}, [quill]);
  const attributes = getAttributes();
  const formats = useMemo(() => keys(attributes), [attributes]);

  const handleAlignmentChange = useCallback((event, alignment) => {
    quill.format('align', alignment, 'user');

    refresh();
  }, [quill]);

  const handleFormatsChange = useCallback((event) => {
    const format = path(['currentTarget', 'value'], event);
    const attributes = getAttributes();
    const previousValue = has(format, attributes) ? prop(format, attributes) : false;
    quill.format(format, not(previousValue), 'user');

    refresh();
  }, [quill]);

  const handleColorChange = useCallback((color) => {
    quill.format('color', color && color.hex, 'user');

    refresh();
  }, [quill]);

  const handleHeaderChange = useCallback((value) => {
    quill.format('header', value);

    refresh();
  }, [quill]);

  const handleFontChange = useCallback((value) => {
    quill.format('font', value);

    refresh();
  }, [quill]);

  const handleSizeChange = useCallback((value) => {
    quill.format('size', value);

    refresh();
  }, [quill]);

  const handleEmbedVideo = useCallback((value) => {
    const index = prop('index', quill.getSelection(true));
    quill.insertEmbed(index, 'video', value);
    
    refresh();
  }, [quill]);

  const handleEmbedImage = useCallback((value) => {
    const index = prop('index', quill.getSelection(true));
    quill.insertEmbed(index, 'image', value);
    
    refresh();
  }, [quill]);

  const onScriptChange = useCallback((event) => {
    const format = path(['currentTarget', 'value'], event);
    const previousValue = prop('script', getAttributes());
    quill.format('script', previousValue === format ? false : format);

    refresh();
  }, [quill]);

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

  // Active Attributes
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

  const selection = quill ? quill.getSelection() : { index: 0, length: 0 };
  const bounds = quill && quill.getBounds(selection.index, selection.length);

  const linkSelection = useMemo(() => {
    if (!link)
      return;

    const {index, length} = selection;

    if (length > 0)
      return;

    const [leaf] = quill.getLeaf(index);

    let parentLinkBlot = leaf;

    // Search for parent link
    while(path(['statics', 'tagName'], parentLinkBlot) !== "A")
      parentLinkBlot = parentLinkBlot.parent;

    let firstLinkBlot = parentLinkBlot;

    const getLink = compose(prop('link'), invoker(0, 'formats'));
    const eqLinks = useWith(equals, [getLink, getLink]);
    const matchesLink = eqLinks(parentLinkBlot);
    const isLinkBlot = compose(equals('A'), path(['statics', 'tagName']));
    const isLinkAndMatches = both(isLinkBlot, matchesLink);

    // Search for previous links that are paired
    while(isLinkAndMatches(prop('prev', firstLinkBlot)))
      firstLinkBlot = firstLinkBlot.prev;

    let lastLinkBlot = parentLinkBlot;

    while(isLinkAndMatches(prop('next', lastLinkBlot)))
      lastLinkBlot = lastLinkBlot.next;

    const linkIndex = quill.getIndex(firstLinkBlot);
    const linkLength = (() => {
      let initialBlot = firstLinkBlot;
      let count = initialBlot.length();
      while(initialBlot != lastLinkBlot) {
        count += initialBlot.next.length();
        initialBlot = initialBlot.next;
      }
      return count;
    })();

    return {
      index: linkIndex,
      length: linkLength
    };
  }, [link]);

  const linkBounds = useMemo(() => linkSelection && quill.getBounds(linkSelection.index, linkSelection.length), [linkSelection]);

  const handleLinkChange = useCallback((value) => {
    const formattedValue = value == null ? false : value; 

    if (linkSelection)
      quill.formatText(linkSelection.index, linkSelection.length, 'link', formattedValue);
    else
      quill.format('link', formattedValue);

    refresh();
  }, [quill, linkSelection]);

  return (
    <div data-cy="toolbar">
      <InlineToggleButtonGroup value={alignment} exclusive onChange={handleAlignmentChange} selected="auto" selected="auto">
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
        <ColorPickerToolbarItem color={color} onColorChange={handleColorChange} />
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

      <InlineToggleButtonGroup>
        <LinkInput anchorBounds={linkBounds || bounds} container={tooltipContainer} link={link} onLinkChange={handleLinkChange} />
        <VideoInput anchorBounds={bounds} container={tooltipContainer} onSubmit={handleEmbedVideo} />
        <ImageInput anchorBounds={bounds} container={tooltipContainer} onSubmit={handleEmbedImage} />
      </InlineToggleButtonGroup>

      <HeaderMenu onChange={handleHeaderChange} header={header}/>
      <FontMenu onChange={handleFontChange} fonts={fonts} font={font} />
      <SizeMenu onChange={handleSizeChange} size={size} />
    </div>
  );
});

const formats = [
  'header', // Done
  'font', // Done
  'size', // Done
  'bold', // Done
  'italic', // Done
  'underline', // Done
  'script', // Done
  'blockquote', // Done
  'list', // Done
  'bullet', // Done
  'indent', // Done
  'link',// Done
  'image', // Done
  'video', // Done
  'color', // Done
  'align' // Done
];

const generateFontRules = compose(mergeAll, map(converge(objOf, [concat('.ql-font-'), objOf('fontFamily')])));
const generateSizeRules = compose(mergeAll, map(converge(objOf, [compose(concat('.ql-size-'), nth(0)), compose(objOf('fontSize'), nth(1))])), toPairs);
const generateIndentRules = (indentWidth) => compose(mergeAll, map(converge(objOf, [concat('.ql-indent-'), compose(objOf('marginLeft'), concat(`calc(${indentWidth} * `), concat(__, ')'))])));

const subPrefix = compose(mergeAll, map(converge(objOf, [compose(concat('& '), nth(0)), nth(1)])), toPairs);

const defaultQuillStyles = {
  '.ql-align-center': {
    textAlign: 'center'
  },
  '.ql-align-right': {
    textAlign: 'right'
  },
  '.ql-align-justify': {
    textAlign: 'justify'
  },
  'p': {
    marginTop: 0,
    marginBottom: 0
  },
  '.ql-container': {
    height: '100%'
  },
  '.ql-clipboard': {
    left: -100000,
    height: 1,
    overflowY: 'hidden',
    position: 'absolute',
    top: '50%'
  },
  '.ql-editor': {
    outline: 'none',
    height: '100%'
  }
};

const useQuillEditorStyles = makeStyles({
  root: ({fonts, sizes, indentWidth}) => {
    const fontRules = generateFontRules(fonts);
    const sizeRules = generateSizeRules(sizes);

    const indentSizes = map(toString, range(1, 9));
    const indentRules = generateIndentRules(indentWidth)(indentSizes);

    return subPrefix(mergeAll([fontRules, sizeRules, indentRules, defaultQuillStyles]));
  }
});

const QuillEditor = forwardRef((props, quillRef) => {
  const quillEditor = useRef(null);
  const fonts = props.fonts || [];
  const sizes = props.sizes || {};
  const indentWidth = props.indentWidth || '3em';

  const classes = useQuillEditorStyles({fonts, sizes, indentWidth});

  const className = props.className;

  // Fonts Initialization
  useMemo(() => {
    const FontAttributor = Quill.import('attributors/class/font');

    FontAttributor.whitelist = fonts;

    Quill.register(FontAttributor, true);
  }, []);

  // Editor Initialization
  useEffect(() => {
    quillEditor.current = new Quill(quillRef.current, {
      theme: null,
      modules: {
        toolbar: false
      },
      formats: props.formats
    });

    return () => {
      quillEditor.current.destroy();
    };
  }, [quillRef]);

  // Fire Initialization Action
  useEffect(() => {
    if (isNotNil(quillEditor.current) && isNotNil(props.onEditorInit))
      props.onEditorInit(quillEditor.current);
  }, [quillEditor.current, props.onEditorInit]);

  useEffect(() => {
    if (isNotNil(quillEditor.current) && isNotNil(props.onChange)) {
      const editor = quillEditor.current;

      const onEditorChange = (eventName) => {
        if (eventName === 'text-change')
          props.onChange(editor.getContents.bind(editor));
      };

      editor.on('editor-change', onEditorChange);

      return () => {
        editor.off('editor-change', onEditorChange);
      };
    }
  }, [quillEditor.current, props.onChange]);

  useEffect(() => {
    if (isNotNil(quillEditor.current) && isNotNil(props.onSelectionChange)) {
      const editor = quillEditor.current;

      const onSelectionChange = (range, oldRange) => {
        if (range !== null)
          props.onSelectionChange([range, oldRange]);
      };

      editor.on('selection-change', onSelectionChange);

      return () => {
        editor.off('selection-change', onSelectionChange);
      };
    }
  }, [quillEditor.current, props.onSelectionChange]);

  return (
    <div className={classNames(classes.root, className)}>
      <div ref={quillRef} />
    </div>
  );
});

const useAppStyles = makeStyles({
  editor: {
    height: '100%',
    padding: 10
  }
});

export const App = () => {
  const [quill, setQuill] = useState(null);
  const quillRef = useRef();
  const [quillSelection, setQuillSelection] = useState([null, null]);
  const [value, setValue] = useState();
  const fonts = useMemo(() => ({
    "Verdana": "verdana",
    "Ariel": "ariel"
  }), []);

  const classes = useAppStyles();

  const fontValues = useMemo(() => values(fonts), [fonts]);

  const sizeMap = useMemo(() => ({
    small: '14px',
    large: '26px',
    huge: '40px'
  }), []);

  const { Delta } = useDelta();

  const toolbar = (quill && quillRef) && (
    <Toolbar quill={quill} quillRef={quillRef} fonts={fonts} selection={quillSelection} quillValue={value}/>
  );

  return (
    <ThemeProvider theme={defaultTheme}>
      {toolbar}
      <QuillEditor ref={quillRef} className={classes.editor} sizes={sizeMap} fonts={fontValues} onEditorInit={setQuill} onChange={setValue} onSelectionChange={setQuillSelection} formats={formats} />
      <div>
          <Delta delta={value} sizeMap={sizeMap} indentWidth="3em"/>
      </div>
    </ThemeProvider>
  );
};