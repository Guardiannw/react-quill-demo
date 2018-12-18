describe('Toolbar', () => {
    it('should align text on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.get(':nth-child(1) > [value="center"]').click();

        cy.contains('Hello').should('have.class', 'ql-align-center');

        cy.get(':nth-child(1) > [value="right"]').click();

        cy.contains('Hello').should('have.class', 'ql-align-right');

        cy.get(':nth-child(1) > [value="justify"]').click();

        cy.contains('Hello').should('have.class', 'ql-align-justify');
    });

    it('should bold, italicize, and underline text on button press.', () => {
        cy.visit('http://localhost:3000');

        cy.get('.ql-editor').type('Hello');

        cy.contains('Hello').highlight();

        cy.get('[value="bold"]').click();

        cy.contains('Hello').should('match', 'strong');

        cy.get('[value="bold"]').click();

        cy.contains('Hello').should('not.match', 'strong');

        cy.get('[value="italic"]').click();

        cy.contains('Hello').should('match', 'em');

        cy.get('[value="italic"]').click();

        cy.contains('Hello').should('not.match', 'em');

        cy.get('[value="underline"]').click();

        cy.contains('Hello').should('match', 'u');

        cy.get('[value="underline"]').click();

        cy.contains('Hello').should('not.match', 'u');
    });
});