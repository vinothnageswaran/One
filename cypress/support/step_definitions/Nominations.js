import { Given, When, Then, And } from "cypress-cucumber-preprocessor/steps";
import elements from "../../Pages/Home/Objects.json";
import Common from "../../Pages/Home/Common";


Given('User navigates to DM Dashboard', async () => {

    Common.PSSD_Seed_runSQLfile("T001_Nominations_PST");
    Common.PSS_Seed_runSQLfile("T001_Nominations_PSS");
 
    cy.visit("/scheduling/deviation/dashboard");
    cy.viewport(2000,1500)
    Common.importSchedule();
   
  
  
    
   });


Then('I click on vessel', async () => {

    Common.clickOnvessel(111111);


});


Then('I see Vessel details as {string}', vesselv => {

    Common.Veriftext(elements.Nominationsource.Vesselv, vesselv);


});

Then('I see Product as {string}', product => {

    //Common.Veriftext(elements.Nominationsource.productv, product);


});



Then('Reclaim from stockpile {string} is MACF', stockpile => {

   
    Common.Veriftext(elements.Nominationsource.Stockpile, stockpile);
    Common.Veriftext(elements.Nominationsource.Stockpile, 'MACF');   
    Common.Veriftext(elements.Nominationsource.All, 'All');
  
   
});


Then('I see {string} Tonnes', tonnes => {

    //Common.Veriftext(elements.Nominationsource.tonnes, 'Tonnes');
  expect(Cypress.$('#nomination0Tonnes').val()).to.equal(tonnes)


});


Then('I see {string} Left to Load', lefttoload=> {

   // Common.Veriftext(elements.Nominationsource.lefttoload, 'Left to Load');
  expect(Cypress.$('#nomination0TonnesLeft').val()).to.equal(lefttoload)


});

Then("the button Add Dual Load", () => {

     Common.Veriftext(elements.Nominationsource.Adddualload, 'Add Dual Load');


 });

 Then("the button Add Source should be available", () => {

    Common.Veriftext(elements.Nominationsource.Addsource, 'Add Source');


 });

 Then ("The manual override button exist",()=>{

    cy.get(elements.Nominationsource.Manualoverride).should('exist')

 })

 Then ("The remove source exist",()=>{

    cy.get(elements.Nominationsource.Removesource).should('exist')

 })