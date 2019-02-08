describe('Toolbar', () => {
    it('should align text on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.get('[data-cy="toolbar"] [value="center"]').click();

        cy.contains('Hello').should('have.class', 'ql-align-center');

        cy.get('[data-cy="toolbar"] [value="right"]').click();

        cy.contains('Hello').should('have.class', 'ql-align-right');

        cy.get('[data-cy="toolbar"] [value="justify"]').click();

        cy.contains('Hello').should('have.class', 'ql-align-justify');
    });

    it('should bold, italicize, underline, and blockquote text on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.contains('Hello').highlight();

        cy.get('[data-cy="toolbar"] [value="bold"]').click();

        cy.contains('Hello').should('match', 'strong');

        cy.get('[data-cy="toolbar"] [value="bold"]').click();

        cy.contains('Hello').should('not.match', 'strong');

        cy.get('[data-cy="toolbar"] [value="italic"]').click();

        cy.contains('Hello').should('match', 'em');

        cy.get('[data-cy="toolbar"] [value="italic"]').click();

        cy.contains('Hello').should('not.match', 'em');

        cy.get('[data-cy="toolbar"] [value="underline"]').click();

        cy.contains('Hello').should('match', 'u');

        cy.get('[data-cy="toolbar"] [value="underline"]').click();

        cy.contains('Hello').should('not.match', 'u');

        cy.get('[data-cy="toolbar"] [value="blockquote"]').click();

        cy.contains('Hello').should('match', 'blockquote');

        cy.get('[data-cy="toolbar"] [value="blockquote"]').click();

        cy.contains('Hello').should('not.match', 'blockquote');
    });

    it('should appropriately set the `script` on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.contains('Hello').highlight();

        cy.get('[data-cy="toolbar"] [value="super"]').click();

        cy.contains('Hello').should('match', 'sup');

        cy.get('[data-cy="toolbar"] [value="sub"]').click();

        cy.contains('Hello').should('match', 'sub');

        cy.get('[data-cy="toolbar"] [value="sub"]').click();

        cy.contains('Hello').should('not.match', 'sub');
    });

    it('should color the text.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.contains('Hello').highlight();

        cy.get('[data-cy="toolbar"] [data-cy="color-picker-toolbar-button"]').click();

        cy.get('input + :contains(r)').prev('input').type('32');
        cy.get('input + :contains(g)').prev('input').type('255');
        cy.get('input + :contains(b)').prev('input').type('111');
        cy.get('input + :contains(a)').prev('input').type('100');

        cy.contains('Hello').should('have.css', 'color', 'rgb(32, 255, 111)');
    });

    it('should set the header on button select.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.contains('Hello').highlight();

        cy.get('[data-cy="toolbar-header-select"]').children('label:contains(\'Header\') + div').then(($el) => {
            cy.wrap($el).click();

            cy.get('li:contains(\'Header 1\')').click();

            cy.contains('Hello').should('match', 'h1');

            cy.wrap($el).click();

            cy.get('li:contains(\'Header 2\')').click();

            cy.contains('Hello').should('match', 'h2');

            cy.wrap($el).click();

            cy.get('li:contains(\'Header 3\')').click();

            cy.contains('Hello').should('match', 'h3');

            cy.wrap($el).click();

            cy.get('li:contains(\'Header 4\')').click();

            cy.contains('Hello').should('match', 'h4');

            cy.wrap($el).click();

            cy.get('li:contains(\'Header 5\')').click();

            cy.contains('Hello').should('match', 'h5');

            cy.wrap($el).click();

            cy.get('li:contains(\'Header 6\')').click();

            cy.contains('Hello').should('match', 'h6');

            cy.wrap($el).click();

            cy.get('li:contains(\'None\')').click();

            cy.contains('Hello').should('match', 'p');
        });
    });

    it('should set the font on button select.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.contains('Hello').highlight();

        cy.get('[data-cy="toolbar-font-select"]').children('label:contains(\'Font\') + div').then(($el) => {
            cy.wrap($el).click();

            cy.get('li:contains(\'Verdana\')').click();

            cy.contains('Hello').should('have.class', 'ql-font-verdana');

            cy.wrap($el).click();

            cy.get('li:contains(\'Ariel\')').click();

            cy.contains('Hello').should('have.class', 'ql-font-ariel');

            cy.wrap($el).click();

            cy.get('li:contains(\'None\')').click();

            cy.contains('Hello').should('not.have.class', 'ql-font-ariel');
        });
    });

    it('should set the size on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.contains('Hello').highlight();

        cy.get('[data-cy="toolbar-size-select"]').children('label:contains(\'Size\') + div').then(($el) => {
            cy.wrap($el).click();

            cy.get('li:contains(\'Small\')').click();

            cy.contains('Hello').should('have.class', 'ql-size-small');

            cy.wrap($el).click();

            cy.get('li:contains(\'Large\')').click();

            cy.contains('Hello').should('have.class', 'ql-size-large');

            cy.wrap($el).click();

            cy.get('li:contains(\'Huge\')').click();

            cy.contains('Hello').should('have.class', 'ql-size-huge');

            cy.wrap($el).click();

            cy.get('li:contains(\'Normal\')').click();

            cy.contains('Hello').should('not.have.class', 'ql-size-huge');
        });
    });

    it('should appropriately indent on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-1');

        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-2');

        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-3');
        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-4');
        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-5');
        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-6');
        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-7');
        cy.get('[data-cy="toolbar"] [value="indent-increase"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-8');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-7');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-6');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-5');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-4');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-3');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-2');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('have.class', 'ql-indent-1');

        cy.get('[data-cy="toolbar"] [value="indent-decrease"]').click();

        cy.contains('Hello').should('not.have.class', 'ql-indent-1');
    });

    it('should appropriately structure lists on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.get('[data-cy="toolbar"] [value="list-ordered"]').click();

        cy.contains('Hello').should('match', 'li').parent().should('match', 'ol');

        cy.get('[data-cy="toolbar"] [value="list-unordered"]').click();

        cy.contains('Hello').should('match', 'li').parent().should('match', 'ul');

        cy.get('[data-cy="toolbar"] [value="list-unordered"]').click();

        cy.contains('Hello').should('not.match', 'li');
    });
});