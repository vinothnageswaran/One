import elements from "../../Pages/Home/Objects.json";
import { waitforgetGeneration } from "../../Pages/Home/Database.js"

class Common {

    static PSS_runSQLfile(sqldata) {
        cy.fixture(sqldata).then((filedata) => {

            cy.log(filedata);
            cy.task("PSS_file", filedata)

        });


    }

    static PSSD_runSQLfile(sqldata) {
        cy.fixture(sqldata).then((filedata) => {

            cy.log(filedata);
            cy.task("PSSD_file", filedata)

        });


    }

    static PSS_Seed_runSQLfile(sqldata) {
        cy.fixture(sqldata).then((filedata) => {

            // cy.log(filedata);
            cy.task("PSS_Seed_file", filedata)

        });


    }

    static PSSD_Seed_runSQLfile(sqldata) {
        cy.fixture(sqldata).then((filedata) => {

            // cy.log(filedata);
            cy.task("PSSD_seed_file", filedata)

        });


    }

    static runSQLuery(query) {

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

    static clicktopcornerofthebutton(object) {

        cy.get(object).click('topRight')

    }

    static shiftClick(object) {
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

    static doubleClick(object) {

        cy.get(object).dblclick();
    }

    static doubleClickonfocussedlement(object) {

        cy.focused().dblclick();
    }

    static doubleclickontexttext(text) {

        cy.contains(text).dblclick()    // Double click on first el containing 'Welcome'

    }

    static clickonbottomoftheButton(object) {
        cy.get(object).dblclick(30, 10)

    }

    static selectdropdownlist(text) {
        cy.get('select').selecttext(text) //'Homer Simpson'

    }



    static visit(URL) {
        cy.visit(URL);
        cy.viewport(1524, 868)

    }

    static clickOnrake(rakenumber) {
        //cy.get(elements.Dashboardobj.Rakearrivalpanel, { timeout: 20000 }) // It will wait until Rake arrival panel is visible for 20 sec
        cy.window().then((win) => {
            const rakeItem = win['timeline_container_0_data'].find(x => x.id === rakenumber); //20M0001A
            console.log(win);
            console.log(rakeItem);
            cy.get("#timeline_container_0 > canvas", { timeout: 30000 })
                .click(rakeItem.position.x + 1, rakeItem.position.y + 1);
            cy.wait(2000);
            console.log(rakeItem.position.x, rakeItem.position.y);


        })

    }

    static clickOnvessel(vessel) {

        cy.window().then((win) => {
            const nominations = win['timeline_container_1_data'].find(x => x.id === vessel);
            console.log(nominations);
            cy.get("#timeline_container_1 > canvas",{ timeout: 30000 })
                .click(nominations.position.x + 1, nominations.position.y + 1, { force: true });
            cy.wait(2000);
            console.log(nominations.position.x, nominations.position.y);


        })

    }

    static importSchedule() {

        cy.wait(7000)
        cy.get(elements.Dashboardobj.ImportPSTSchedule, { timeout: 30000 })
        Common.clickButton(elements.Dashboardobj.ImportPSTSchedule);
        cy.wait(5000);
        waitforgetGeneration();
        cy.reload(true);
        cy.get(elements.Dashboardobj.Rakearrivalpanel, { timeout: 20000 })


    }


    static waitforgetGenerationStatus() {

    let status;
    cy.task("getGenerationStatus").then(result => {
        console.log(result);
        status = result;
        while (status != "GENERATED" && status != "Error") {
            cy.wait(2000);
            cy.task("getGenerationStatus").then(result => {
                console.log(result);
                status = result;



            })


        }
        // return status;

    });
}



}
export default Common;

