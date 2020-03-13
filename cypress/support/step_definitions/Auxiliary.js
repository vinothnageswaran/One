import { Given, Then, When, And } from "cypress-cucumber-preprocessor/steps";
import elements from "../../Pages/Home/Objects.json";
import Common from "../../Pages/Home/Common";

// before(function () {

//     Common.PSSD_Seed_runSQLfile("T001_Auxiliary_Page_PSSD");
//     Common.PSS_Seed_runSQLfile("T001_Auxiliary_Page_PSS");
// })

Given('User hit Auxiliary button on Deviation Management Dashboard', async () => {

    //cy.visit("/scheduling/deviation/auxiliary/stockpiles/stock-projection");

    cy.visit("/scheduling/deviation/dashboard")
    cy.viewport(2000, 1500)
    cy.wait(7000)
    cy.get(elements.Dashboardobj.Auxiliary).click();
});


Then('the first item on the top panel is {string}', Stockpilesl => {

    Common.Veriftext(elements.Auxiliaryobj.Stockpiiles, Stockpilesl)

});

And('the second item on the top panel is {string}', Berthsl => {
    Common.Veriftext(elements.Auxiliaryobj.Berths, Berthsl)

    cy.window().then((win) => {

        cy.get(elements.Auxiliaryobj.Berths).click();
        console.log(win);
    });

});


And('the third item on the top panel is {string}', InHatchBlendingl => {
    Common.Veriftext(elements.Auxiliaryobj.InHatchBlending, InHatchBlendingl)

});

And('the fourth item on the top panel is {string}', Alertsl => {
    Common.Veriftext(elements.Auxiliaryobj.Alerts, Alertsl)

});