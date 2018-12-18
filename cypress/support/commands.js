import { cyan } from "@material-ui/core/colors";

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('highlight', { prevSubject: 'element' }, (element, range = {}) => {
    const document = element.context;
    const selectedRange = document.createRange();
    selectedRange.setStart(element[0], 0);
    selectedRange.setEnd(element[0], 1);

    const window = document.defaultView;

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(selectedRange);
});