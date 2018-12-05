import React from 'react';
import {
    flatten,
    compose,
    has,
    prop,
    always,
    keys,
    invoker,
    cond
} from 'ramda';
import ReactTestUtils from 'react-dom/test-utils';
import TestRenderer from 'react-test-renderer';
import ShallowRenderer from 'react-test-renderer/shallow';
import { Delta } from './delta';
import { render } from 'react-testing-library';

const substring = invoker(2, 'substring');

// TODO: consider updating the tests to account for the fact that the delta list of ops 
// always ends in a newline
describe('<Delta />', () => {
    it('should render `<strong />` tags around text that has a `bold` attribute.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        bold: true
                    }
                }
            ]
        };

        const children = TestRenderer.create(<Delta delta={delta}/>).root.children;

        expect(children.length).toEqual(1);
        expect(children[0].type).toEqual('strong');
        expect(children[0].children[0]).toEqual('Hello');
    });

    it('should render `<span />` tags around text that has a `underline` attribute and specify the `textDecoration` property of the style attribute.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        underline: true
                    }
                }
            ]
        };
        const children = TestRenderer.create(<Delta delta={delta}/>).root.children;

        expect(children.length).toEqual(1);
        expect(children[0].type).toEqual('span');
        expect(children[0].props.style).toHaveProperty('textDecoration', 'underline');
        expect(children[0].children[0]).toEqual('Hello');
    });

    it('should render `<em />` tags around text that has a `italic` attribute.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        italic: true
                    }
                }
            ]
        };
        const children = TestRenderer.create(<Delta delta={delta}/>).root.children;

        expect(children.length).toEqual(1);
        expect(children[0].type).toEqual('em');
        expect(children[0].children[0]).toEqual('Hello');
    });

    it('should render `<br />` tags in place of newline characters.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello\nTimmy',
                    attributes: {}
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(3);
        expect(children[0]).toEqual('Hello');
        expect(children[1].type).toEqual('br');
        expect(children[2]).toEqual('Timmy');
    });

    it('should render `<img />` tag with attributes [`alt`, `width`, `height`] when `insert` has an `image` property', () => {
        const delta = {
            ops: [
                {
                    insert: {
                        image: 'src'
                    },
                    attributes: {
                        alt: 'alt',
                        height: '50',
                        width: '50'
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].type).toEqual('img');
        expect(children[0].props).toEqual({
            src: 'src',
            height: '50',
            width: '50',
            alt: 'alt'
        });
    });

    it('should format the most recent line of characters with the following line attribute delta', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello\nTimmy',
                    attributes: {}
                },
                {
                    insert: '\n',
                    attributes: {
                        header: 1
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(3);
        expect(children[0]).toEqual('Hello');
        expect(children[1].type).toEqual('br');
        expect(children[2].type).toEqual('h1');
        expect(children[2].children[0]).toEqual('Timmy');
    });

    it('should format the most recent line of characters with the appropriate level of indention if the `indent` attribute is set on the line.', () => {
        const indentWidth = '40pt';

        const delta = {
            ops: [
                {
                    insert: 'Hello\nTimmy',
                    attributes: {}
                },
                {
                    insert: '\n',
                    attributes: {
                        indent: 4
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta} indentWidth={indentWidth}/>).root.children);

        expect(children.length).toEqual(3);
        expect(children[0]).toEqual('Hello');
        expect(children[1].type).toEqual('br');
        expect(children[2].type).toEqual('div');
        expect(children[2].children[0]).toEqual('Timmy');
        expect(children[2].props.style.marginLeft).toEqual('calc(40pt * 4)');
    });

    it('should format the most recent line of characters with the appropriate text alignment `align` attribute is set on the line.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello\nTimmy',
                    attributes: {}
                },
                {
                    insert: '\n',
                    attributes: {
                        align: "right"
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta} />).root.children);

        expect(children.length).toEqual(3);
        expect(children[0]).toEqual('Hello');
        expect(children[1].type).toEqual('br');
        expect(children[2].type).toEqual('div');
        expect(children[2].children[0]).toEqual('Timmy');
        expect(children[2].props.style.textAlign).toEqual('right');
    });

    it('should format the most recent line of characters with the `<blockquote />` tag if the `blockquote` attribute is \'true\'.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello\nTimmy',
                    attributes: {}
                },
                {
                    insert: '\n',
                    attributes: {
                        blockquote: true
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta} />).root.children);

        expect(children.length).toEqual(3);
        expect(children[0]).toEqual('Hello');
        expect(children[1].type).toEqual('br');
        expect(children[2].type).toEqual('blockquote');
        expect(children[2].children[0]).toEqual('Timmy');
    });

    it('should render the `<sup />` tag around content that has the `script` attribute set to \'super\'.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        script: 'super'
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].children[0]).toEqual('Hello');
        expect(children[0].type).toEqual('sup');
    });

    it('should render the `<sub />` tag around content that has the `script` attribute set to \'sub\'.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        script: 'sub'
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].children[0]).toEqual('Hello');
        expect(children[0].type).toEqual('sub');
    }); 

    it('should render the `<span />` tag around content that has the `color` attribute set, and specify the color in the \'style\' attribute.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        color: '#FFEEFF'
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].children[0]).toEqual('Hello');
        expect(children[0].type).toEqual('span');
        expect(children[0].props.style).toHaveProperty('color', '#FFEEFF');
    }); 

    it('should render the `<a />` tag around content that has the `link` attribute set, and specify the href in the \'href\' attribute.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        link: 'http://google.com'
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].children[0]).toEqual('Hello');
        expect(children[0].type).toEqual('a');
        expect(children[0].props).toHaveProperty('href', 'http://google.com');
    });

    it('should render the `<span />` tag around content that has the `font` attributes set, and specify the font family in the \'style\' attribute.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        font: 'ariel'
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].children[0]).toEqual('Hello');
        expect(children[0].type).toEqual('span');
        expect(children[0].props.style).toHaveProperty('fontFamily', 'ariel');
    });

    it('should render the `<span />` tag around content that has the `size` attribute set, and specify the size in the \'style\' attribute according to the \'sizeMap\' prop.', () => {
        const sizeMap = {
            small: '18px',
            large: '25px',
            huge: '40px'
        };

        for (const size in keys(sizeMap)) {
            const delta = {
                ops: [
                    {
                        insert: 'Hello',
                        attributes: {
                            size: sizeMap[size]
                        }
                    }
                ]
            };
            const children = flatten(TestRenderer.create(<Delta delta={delta} sizeMap={sizeMap}/>).root.children);

            expect(children.length).toEqual(1);
            expect(children[0].children[0]).toEqual('Hello');
            expect(children[0].type).toEqual('span');
            expect(children[0].props.style).toHaveProperty('fontSize', sizeMap[size]);
        }
    });


    it('should render elements within an ordered list if the line attribute has a `list` property of `ordered`.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                },
                {
                    insert: '\n',
                    attributes: {
                        list: 'ordered'
                    }
                }
            ]
        };

        const children = flatten(TestRenderer.create(<Delta delta={delta} />).root.children); //?

        expect(children.length).toEqual(1);
        expect(children[0].type).toEqual('ol');
        expect(children[0].children[0].type).toEqual('li');
        expect(children[0].children[0].children[0]).toEqual('Hello');
    });

    it('should render elements within an unordered list if the line attribute has a `list` property of `bullet`.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                },
                {
                    insert: '\n',
                    attributes: {
                        list: 'bullet'
                    }
                }
            ]
        };

        const children = flatten(TestRenderer.create(<Delta delta={delta} />).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].type).toEqual('ul');
        expect(children[0].children[0].type).toEqual('li');
        expect(children[0].children[0].children[0]).toEqual('Hello');
    });

    it('should render subsequent lines with the same value for the line attribute of `list` within the same parent list element.', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                },
                {
                    insert: '\n',
                    attributes: {
                        list: 'bullet'
                    }
                },
                {
                    insert: 'Thomas'
                },
                {
                    insert: '\n',
                    attributes: {
                        list: 'bullet'
                    }
                },
                {
                    insert: 'Hello Again',
                },
                {
                    insert: '\n',
                    attributes: {
                        list: 'ordered'
                    }
                },
                {
                    insert: 'Thomas Again'
                },
                {
                    insert: '\n',
                    attributes: {
                        list: 'ordered'
                    }
                },
                {
                    insert: 'Harry'
                },
                {
                    insert: '\n'
                }
            ]
        };

        const children = flatten(TestRenderer.create(<Delta delta={delta} />).root.children);

        expect(children.length).toEqual(3);
        expect(children[0].type).toEqual('ul');
        expect(children[0].children[0].type).toEqual('li');
        expect(children[0].children[0].children[0]).toEqual('Hello');
        expect(children[0].children[1].type).toEqual('li');
        expect(children[0].children[1].children[0]).toEqual('Thomas');

        expect(children[1].type).toEqual('ol');
        expect(children[1].children[0].type).toEqual('li');
        expect(children[1].children[0].children[0]).toEqual('Hello Again');
        expect(children[1].children[1].type).toEqual('li');
        expect(children[1].children[1].children[0]).toEqual('Thomas Again');

        expect(children[2]).toEqual('Harry');
    });

    // TODO: Consider breaking up into 2 different tests.
    it('should appropriately apply block styles to only a single line, even if the line has multiple inline delta\'s.', () => {
        const delta = {
            "ops":
            [
                {
                    insert: "Hello",
                    attributes: {
                        bold: true
                    }
                },
                {
                    insert: "\nThomas"
                },
                {
                    insert: "!",
                    attributes: {
                        script: "super"
                    }
                },
                {
                    attributes: {
                        header: 1
                    },
                    insert: "\n"
                }
            ]
        };
  
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children).toHaveLength(3);
        expect(children[0].type).toEqual('strong');
        expect(children[0].children[0]).toEqual('Hello');
        expect(children[1].type).toEqual('br');
        expect(children[2].type).toEqual('h1');

        const blockChildren = children[2].children;
        expect(blockChildren).toHaveLength(2);
        expect(blockChildren[0]).toEqual('Thomas');
        expect(blockChildren[1].type).toEqual('sup');
        expect(blockChildren[1].children[0]).toEqual('!');
    });

    it('should allow other inline attributes shared with a link', () => {
        const delta = {
            ops: [
                {
                    insert: 'Hello',
                    attributes: {
                        link: 'http://google.com',
                        bold: true
                    }
                }
            ]
        };
        const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

        expect(children.length).toEqual(1);
        expect(children[0].children[0].type).toEqual('strong');
        expect(children[0].children[0].children[0]).toEqual('Hello');
        expect(children[0].type).toEqual('a');
        expect(children[0].props).toHaveProperty('href', 'http://google.com');
    });


    it('should allow inline formatting inside block formatting', () => {
        // TODO: Continue filling these out
        const inlineAttributes = [
            {bold: true},
            {underline: true},
            {italic: true},
            {script: 'sub'},
            {script: 'super'},
            {color: '#EE0000'}
        ];

        const blockAttributes = [
            {header: 1},
            {header: 2},
            {header: 3},
            {header: 4}
        ];

        for (const blockAttribute of blockAttributes) {
            for (const inlineAttribute of inlineAttributes) {
                const inlineType = cond([
                    [prop('bold'), always('strong')],
                    [prop('underline'), always('span')],
                    [prop('italic'), always('em')],
                    [has('script'), compose(substring(0, 3), prop('script'))],
                    [has('color'), always('span')]
                ])(inlineAttribute);

                const delta = {
                    ops: [
                        {
                            insert: 'H',
                            attributes: {}
                        },
                        {
                            insert: 'ell',
                            attributes: inlineAttribute
                        },
                        {
                            insert: 'o',
                            attributes: {}
                        },
                        {
                            insert: '\n',
                            attributes: blockAttribute
                        }
                    ]
                };
                const children = flatten(TestRenderer.create(<Delta delta={delta}/>).root.children);

                expect(children.length).toEqual(1);

                const blockChildren = flatten(children[0].children);

                expect(blockChildren.length).toEqual(3);
                expect(blockChildren[0]).toEqual('H');
                expect(blockChildren[2]).toEqual('o');
                expect(blockChildren[1].type).toEqual(inlineType);
                expect(blockChildren[1].children[0]).toEqual('ell');
            }
        }
    });
});