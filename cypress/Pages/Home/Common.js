

class Common {

    static runSQLfile(sqldata) {
        cy.fixture('sqldata').then((filedata) => {

            cy.log(filedata);
            cy.task("seedasfile", filedata)

        });


    }

    static runSQLuery(query){

        cy.task("seedasquery", sqlscripts.Data.Insertquery).then(data => {
           
      
        })

    }


    static writetext(object, query) {
        cy.get(object)
            .type(query);

    }



    static clickButton(object) {
        cy.get(object)
            .click();
    }


    static clickButtonfocussed(object) {
        cy.focused().click();
    }

    static clicktopcornerofthebutton(object){

        cy.get(object).click('topRight')

    }

    static shiftClick(object){
        cy.get('body').type('{shift}', { release: false })
        cy.get(object).click();

    }



    static Veriftext(object, text) {
        cy.get(object).contains(text)

    }

    static runSQLquery(query) {

        cy.task("seedasquery", query).then(data => {
            cy.log(data);

        })


    }

    static doubleClick(object){

        cy.get(object).dblclick() ;
    }

    static doubleClickonfocussedlement(object){

        cy.focused().dblclick()  ;
    }

    static doubleclickontexttext(text){

        cy.contains(text).dblclick()    // Double click on first el containing 'Welcome'

    }

    static clickonbottomoftheButton(object)

    {
        cy.get(object).dblclick(30, 10)

    }

    static selectdropdownlist(text)

    {
        cy.get('select').selecttext(text) //'Homer Simpson'

    }

   

    static visit(URL) {
        cy.visit(URL);
        cy.viewport(1524, 868)
    
      }



}


export default Common;

