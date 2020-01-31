var elements = require('./Objects.json');


class LandingPage {



  static visit() {
    cy.visit(Cypress.config().baseUrl);
    
   // cy.viewport(1524, 868)

  }

  static type(query) {
    cy.get(elements.LP.WEEKLY_BUTTON)
      .type(query);
  }



  static pressWeeklyButton() {
    cy.get(elements.LP.WEEKLY_BUTTON).contains('Weekly')
      .click();
  }

  static VerifyEvents(Events) {
    cy.get(elements.LP.EVENTS_BUTTON).contains(Events)

  }


  static pressGenerationSetButton() {
    cy.get(elements.LP.GENERATION_BUTTON).contains('Generation Sets')
      .click();
  }

}

export default LandingPage;